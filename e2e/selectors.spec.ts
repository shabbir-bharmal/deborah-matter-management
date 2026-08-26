import { expect, test } from '@playwright/test';

import { investigations } from '~/data/investigations';

/**
 * Contract tests for the API the SPA reads through `~/data/selectors`. The
 * seeded database is generated from the same datasets these expectations use,
 * so the counts stay in step (`node scripts/dump-mock-data.mjs`).
 */

const ACTIVE = ['open', 'in_progress', 'review'];
const activeCount = investigations.filter((matter) => ACTIVE.includes(matter.status)).length;
const completedCount = investigations.length - activeCount;

test.describe('api', () => {
    test('returns all investigations', async ({ request }) => {
        const response = await request.get('/api/investigations');
        expect(response.ok()).toBe(true);
        expect((await response.json()).data).toHaveLength(investigations.length);
    });

    test('finds an investigation by id and 404s for unknown ids', async ({ request }) => {
        const found = await request.get('/api/investigations/inv-001');
        expect((await found.json()).data.referenceNumber).toBe('INV-2026-001');

        expect((await request.get('/api/investigations/nope')).status()).toBe(404);
    });

    test('joins witness details onto interviews', async ({ request }) => {
        const interviews = (await (await request.get('/api/investigations/inv-001/interviews')).json()).data;
        expect(interviews.length).toBeGreaterThan(0);
        for (const interview of interviews) {
            expect(interview.witnessName).not.toBe('Unknown witness');
            expect(interview.witnessRole).not.toBe('');
        }
    });

    test('filters child entities by investigation', async ({ request }) => {
        const load = async (path: string) => (await (await request.get(`/api/investigations/inv-001/${path}`)).json()).data;
        const [allegations, witnesses, evidence, events] = await Promise.all([
            load('allegations'),
            load('witnesses'),
            load('evidence'),
            load('timeline-events'),
        ]);

        expect(allegations).toHaveLength(4);
        expect(witnesses).toHaveLength(5);
        expect(evidence).toHaveLength(6);
        expect(events).toHaveLength(10);

        const dates = events.map((event: { date: string }) => event.date);
        expect([...dates].sort()).toEqual(dates);
    });

    test('builds a consistent dashboard snapshot', async ({ request }) => {
        const snapshot = (await (await request.get('/api/dashboard')).json()).data;

        expect(snapshot.activeMatterCount).toBe(activeCount);
        expect(snapshot.completedMatterCount).toBe(completedCount);
        expect(snapshot.statusCounts.reduce((sum: number, entry: { count: number }) => sum + entry.count, 0)).toBe(investigations.length);
        expect(snapshot.priorityCounts.reduce((sum: number, entry: { count: number }) => sum + entry.count, 0)).toBe(snapshot.activeMatterCount);

        for (const interview of snapshot.upcomingInterviews) {
            expect(['scheduled', 'rescheduled']).toContain(interview.status);
            expect(interview.investigationReference).not.toBe('');
        }
        expect(snapshot.recentActivity.length).toBeLessThanOrEqual(6);
    });

    test('derives client summaries from investigations', async ({ request }) => {
        const clients = (await (await request.get('/api/clients')).json()).data;
        const northwind = clients.find((client: { name: string }) => client.name === 'Northwind Logistics');
        const expected = investigations.filter((matter) => matter.client === 'Northwind Logistics');

        expect(northwind).toBeDefined();
        expect(northwind.matterCount).toBe(expected.length);
        expect(northwind.activeCount).toBe(expected.filter((matter) => ACTIVE.includes(matter.status)).length);
    });

    test('builds the client portal with shared documents only', async ({ request }) => {
        const portal = (await (await request.get('/api/clients/northwind-logistics')).json()).data;
        const expected = investigations.filter((matter) => matter.client === 'Northwind Logistics');

        expect(portal.name).toBe('Northwind Logistics');
        expect(portal.matters).toHaveLength(expected.length);

        for (const matter of portal.matters) {
            for (const document of matter.sharedDocuments) {
                expect(document.status).toBe('shared');
            }
            expect(matter.stageIndex).toBeGreaterThanOrEqual(0);
        }

        expect((await request.get('/api/clients/unknown')).status()).toBe(404);
    });

    test('rejects an unauthenticated request', async ({ playwright }) => {
        const anonymous = await playwright.request.newContext({ baseURL: 'http://localhost:5174' });
        expect((await anonymous.get('/api/investigations', { headers: { Accept: 'application/json' } })).status()).toBe(401);
        await anonymous.dispose();
    });
});
