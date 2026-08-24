import { describe, expect, it } from 'vitest';

import { buildReportDraft } from '~/features/reportAutoFill/mapping/mappingEngine';
import { draftToReportSections, SECTION_KEY_TO_REPORT_SECTION } from '~/features/reportAutoFill/mapping/reportHandoff';
import type { ExtractionResult } from '~/features/reportAutoFill/types/reportAutoFill';
import { buildReport } from '~/lib/report';

const sample: ExtractionResult = {
    fileId: 'f1',
    fileName: 'summary.docx',
    fileType: 'docx',
    rawText: [
        'Summary',
        'An investigation into harassment allegations in the engineering department.',
        'Conclusion',
        'The complaint is well supported by witness accounts and documentary records.',
    ].join('\n'),
};

const matter = {
    id: 'inv-001',
    referenceNumber: 'INV-2026-001',
    title: 'Harassment allegations — Engineering department',
    client: 'Northwind Logistics',
    type: 'harassment' as const,
    status: 'review' as const,
    priority: 'high' as const,
    investigator: 'Deborah Whitfield',
    openedAt: '2026-06-02',
    targetCompletionDate: '2026-09-15',
    description: 'Investigation into repeated allegations of verbal harassment.',
};

describe('report hand-off', () => {
    it('maps auto-fill section keys onto existing report section ids', () => {
        expect(SECTION_KEY_TO_REPORT_SECTION.matterSummary).toBe('summary');
        expect(SECTION_KEY_TO_REPORT_SECTION.keyTimelineEvents).toBe('timeline');
        expect(SECTION_KEY_TO_REPORT_SECTION.conclusion).toBe('conclusion');
    });

    it('converts an accepted draft into section-id keyed bullet lines', () => {
        const draft = buildReportDraft('inv-001', [sample]);
        const values = draftToReportSections(draft);

        expect(values.summary).toHaveLength(1);
        expect(values.summary[0]).toContain('harassment allegations');
        expect(values.conclusion[0]).toContain('well supported');
    });

    it('appends accepted values to the generated report sections', () => {
        const draft = buildReportDraft('inv-001', [sample]);
        const values = draftToReportSections(draft);

        const withOut = buildReport({ matter, allegations: [], interviews: [], evidenceItems: [], events: [], savedFindings: {} });
        const withIn = buildReport({
            matter,
            allegations: [],
            interviews: [],
            evidenceItems: [],
            events: [],
            savedFindings: {},
            autoFill: values,
        });

        const summaryWithout = withOut.find((section) => section.heading.includes('Matter summary'));
        const summaryWith = withIn.find((section) => section.heading.includes('Matter summary'));
        expect(summaryWith?.bullets.length).toBe((summaryWithout?.bullets.length ?? 0) + 1);
        expect(summaryWith?.bullets).toContainEqual(expect.stringContaining('harassment allegations'));
    });
});
