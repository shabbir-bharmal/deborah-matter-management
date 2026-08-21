import { describe, expect, it } from 'vitest';

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

describe('selectors', () => {
    it('returns all investigations', async () => {
        const all = await getInvestigations();
        expect(all).toHaveLength(6);
    });

    it('finds an investigation by id and returns undefined for unknown ids', async () => {
        expect((await getInvestigation('inv-001'))?.referenceNumber).toBe('INV-2026-001');
        expect(await getInvestigation('nope')).toBeUndefined();
    });

    it('joins witness details onto interviews', async () => {
        const interviews = await getInterviewsByInvestigation('inv-001');
        expect(interviews.length).toBeGreaterThan(0);
        for (const interview of interviews) {
            expect(interview.witnessName).not.toBe('Unknown witness');
            expect(interview.witnessRole).not.toBe('');
        }
    });

    it('filters child entities by investigation', async () => {
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
        // Timeline must be chronological ascending
        const dates = events.map((event) => event.date);
        expect([...dates].sort()).toEqual(dates);
    });

    it('builds a consistent dashboard snapshot', async () => {
        const snapshot = await getDashboardSnapshot();
        expect(snapshot.activeMatterCount).toBe(4); // open + in_progress + review
        expect(snapshot.completedMatterCount).toBe(2); // completed + closed
        expect(snapshot.statusCounts.reduce((sum, entry) => sum + entry.count, 0)).toBe(6);
        expect(snapshot.priorityCounts.reduce((sum, entry) => sum + entry.count, 0)).toBe(snapshot.activeMatterCount);
        // Upcoming interviews only include scheduled/rescheduled with future dates
        for (const interview of snapshot.upcomingInterviews) {
            expect(['scheduled', 'rescheduled']).toContain(interview.status);
            expect(interview.investigationReference).not.toBe('');
        }
        expect(snapshot.recentActivity.length).toBeLessThanOrEqual(6);
    });

    it('derives client summaries from investigations', async () => {
        const clients = await getClients();
        const northwind = clients.find((client) => client.name === 'Northwind Logistics');
        expect(northwind).toBeDefined();
        expect(northwind?.matterCount).toBe(2);
        expect(northwind?.activeCount).toBe(2);
    });

    it('builds the client portal with shared documents only', async () => {
        const portal = await getClientPortal('northwind-logistics');
        expect(portal?.name).toBe('Northwind Logistics');
        expect(portal?.matters).toHaveLength(2);
        for (const matter of portal?.matters ?? []) {
            for (const document of matter.sharedDocuments) {
                expect(document.status).toBe('shared');
            }
            expect(matter.stageIndex).toBeGreaterThanOrEqual(0);
        }
        expect(await getClientPortal('unknown')).toBeUndefined();
    });
});
