import { expect, test } from '@playwright/test';

import { investigations } from '~/data/investigations';
import {
    getAllegationsByInvestigation,
    getClientPortal,
    getClients,
    getDashboardSnapshot,
    getEvidenceByInvestigation,
    getInterviewsByInvestigation,
    getInvestigation,
    getInvestigations,
    getTimelineEventsByInvestigation,
    getWitnessesByInvestigation,
} from '~/data/selectors';

const ACTIVE = ['open', 'in_progress', 'review'];
const activeCount = investigations.filter((matter) => ACTIVE.includes(matter.status)).length;
const completedCount = investigations.length - activeCount;

test.describe('selectors', () => {
    test('returns all investigations', async () => {
        const all = await getInvestigations();
        expect(all).toHaveLength(investigations.length);
    });

    test('finds an investigation by id and returns undefined for unknown ids', async () => {
        expect((await getInvestigation('inv-001'))?.referenceNumber).toBe('INV-2026-001');
        expect(await getInvestigation('nope')).toBeUndefined();
    });

    test('joins witness details onto interviews', async () => {
        const interviews = await getInterviewsByInvestigation('inv-001');
        expect(interviews.length).toBeGreaterThan(0);
        for (const interview of interviews) {
            expect(interview.witnessName).not.toBe('Unknown witness');
            expect(interview.witnessRole).not.toBe('');
        }
    });

    test('filters child entities by investigation', async () => {
        const [allegations, witnesses, evidence, events] = await Promise.all([
            getAllegationsByInvestigation('inv-001'),
            getWitnessesByInvestigation('inv-001'),
            getEvidenceByInvestigation('inv-001'),
            getTimelineEventsByInvestigation('inv-001'),
        ]);
        expect(allegations).toHaveLength(4);
        expect(witnesses).toHaveLength(5);
        expect(evidence).toHaveLength(6);
        expect(events).toHaveLength(10);
        const dates = events.map((event) => event.date);
        expect([...dates].sort()).toEqual(dates);
    });

    test('builds a consistent dashboard snapshot', async () => {
        const snapshot = await getDashboardSnapshot();
        expect(snapshot.activeMatterCount).toBe(activeCount);
        expect(snapshot.completedMatterCount).toBe(completedCount);
        expect(snapshot.statusCounts.reduce((sum, entry) => sum + entry.count, 0)).toBe(investigations.length);
        expect(snapshot.priorityCounts.reduce((sum, entry) => sum + entry.count, 0)).toBe(snapshot.activeMatterCount);
        for (const interview of snapshot.upcomingInterviews) {
            expect(['scheduled', 'rescheduled']).toContain(interview.status);
            expect(interview.investigationReference).not.toBe('');
        }
        expect(snapshot.recentActivity.length).toBeLessThanOrEqual(6);
    });

    test('derives client summaries from investigations', async () => {
        const clients = await getClients();
        const northwind = clients.find((client) => client.name === 'Northwind Logistics');
        const expectedNorthwind = investigations.filter((matter) => matter.client === 'Northwind Logistics');
        expect(northwind).toBeDefined();
        expect(northwind?.matterCount).toBe(expectedNorthwind.length);
        expect(northwind?.activeCount).toBe(expectedNorthwind.filter((matter) => ACTIVE.includes(matter.status)).length);
    });

    test('builds the client portal with shared documents only', async () => {
        const portal = await getClientPortal('northwind-logistics');
        const expectedMatters = investigations.filter((matter) => matter.client === 'Northwind Logistics');
        expect(portal?.name).toBe('Northwind Logistics');
        expect(portal?.matters).toHaveLength(expectedMatters.length);
        for (const matter of portal?.matters ?? []) {
            for (const document of matter.sharedDocuments) {
                expect(document.status).toBe('shared');
            }
            expect(matter.stageIndex).toBeGreaterThanOrEqual(0);
        }
        expect(await getClientPortal('unknown')).toBeUndefined();
    });
});
