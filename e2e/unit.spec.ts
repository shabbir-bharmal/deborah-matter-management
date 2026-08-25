import { expect, test } from '@playwright/test';

import { allegations } from '~/data/allegations';
import { evidence } from '~/data/evidence';
import { interviews } from '~/data/interviews';
import { investigations } from '~/data/investigations';
import { timelineEvents } from '~/data/timeline-events';
import { useFindingsStore } from '~/hooks/use-findings-store';
import { buildReport } from '~/lib/report';
import type { FindingOutcome } from '~/types';

const matter = investigations.find((investigation) => investigation.id === 'inv-001')!;

function input(savedFindings: Record<string, FindingOutcome> = {}, config?: Parameters<typeof buildReport>[0]['config']) {
    return {
        matter,
        allegations: allegations.filter((item) => item.investigationId === matter.id),
        interviews: interviews
            .filter((item) => item.investigationId === matter.id)
            .map((interview) => ({
                ...interview,
                witnessName: 'Sarah Okafor',
                witnessRole: 'Senior Engineer',
            })),
        evidenceItems: evidence.filter((item) => item.investigationId === matter.id),
        events: timelineEvents.filter((item) => item.investigationId === matter.id),
        savedFindings,
        config,
    };
}

test.describe('buildReport', () => {
    test.beforeEach(() => {
        useFindingsStore.setState({ byInvestigation: {} });
    });

    test('produces numbered sections in order', () => {
        const sections = buildReport(input());
        expect(sections.map((section) => section.heading)).toEqual([
            '1. Matter summary',
            '2. Allegations and findings',
            '3. Witness interviews',
            '4. Evidence reviewed',
            '5. Key events',
            '6. Conclusion',
        ]);
    });

    test('renumbers when sections are excluded and injects the executive summary first', () => {
        const sections = buildReport(
            input(
                {},
                {
                    includedSections: { summary: false, timeline: false },
                    title: 'Custom title',
                    executiveSummary: 'Short executive overview.',
                },
            ),
        );
        expect(sections[0].heading).toBe('1. Executive summary');
        expect(sections[0].paragraphs).toContain('Short executive overview.');
        expect(sections.map((section) => section.heading)).not.toContain('2. Matter summary');
        expect(sections.some((section) => section.heading.endsWith('Allegations and findings'))).toBe(true);
    });

    test('prefers session finding overrides over seeded findings', () => {
        const override: Record<string, FindingOutcome> = { 'alg-001': 'not_substantiated' };
        const sections = buildReport(input(override));
        const allegationBullets = sections.find((section) => section.id === 'allegations')?.bullets ?? [];
        expect(allegationBullets.some((bullet) => bullet.includes('finding: not substantiated'))).toBe(true);
    });

    test('conclusion reflects pending work', () => {
        const sections = buildReport(input());
        const conclusion = sections.find((section) => section.id === 'conclusion');
        expect(conclusion?.paragraphs.join(' ')).toMatch(/remain pending/);
    });
});

test.describe('findings store', () => {
    test.beforeEach(() => {
        useFindingsStore.setState({ byInvestigation: {} });
    });

    test('records, replaces, and clears finding overrides per allegation', () => {
        useFindingsStore.getState().setFinding('inv-001', 'alg-002', 'substantiated');
        expect(useFindingsStore.getState().byInvestigation['inv-001']?.findings['alg-002']).toBe('substantiated');

        useFindingsStore.getState().setFinding('inv-001', 'alg-002', 'inconclusive');
        expect(useFindingsStore.getState().byInvestigation['inv-001']?.findings['alg-002']).toBe('inconclusive');

        useFindingsStore.getState().setFinding('inv-001', 'alg-002', undefined);
        expect(useFindingsStore.getState().byInvestigation['inv-001']?.findings['alg-002']).toBeUndefined();
    });

    test('keeps investigations isolated from each other', () => {
        useFindingsStore.getState().setFinding('inv-001', 'alg-001', 'substantiated');
        useFindingsStore.getState().setNotes('inv-002', 'alg-005', 'note');
        expect(useFindingsStore.getState().byInvestigation['inv-001']?.findings['alg-001']).toBe('substantiated');
        expect(useFindingsStore.getState().byInvestigation['inv-002']?.notes['alg-005']).toBe('note');
        expect(useFindingsStore.getState().byInvestigation['inv-001']?.notes['alg-005']).toBeUndefined();
    });
});
