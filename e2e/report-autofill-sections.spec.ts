import { expect, test } from '@playwright/test';

import { buildReportDraft } from '~/features/reportAutoFill/mapping/mappingEngine';
import { draftToCustomReportSections, draftToReportSections } from '~/features/reportAutoFill/mapping/reportHandoff';
import { segmentByHeadings } from '~/features/reportAutoFill/mapping/rules/sectionSegmenter';
import type { ExtractionResult } from '~/features/reportAutoFill/types/reportAutoFill';
import { buildReport } from '~/lib/report';

/**
 * Regression for the misplacement bug: a flattened report print-out whose
 * whole text is effectively one line containing every section heading.
 */
const flattenedPrintOut: ExtractionResult = {
    fileId: 'f-print',
    fileName: 'printed-report.pdf',
    fileType: 'pdf',
    rawText: [
        '1. MATTER SUMMARY Investigation INV-2026-001 ("Harassment allegations") was opened for Northwind Logistics on 2 Jun 2026.',
        'The investigation was assigned to Deborah Whitfield with a target completion date of 15 Sep 2026.',
        '2. ALLEGATIONS AND FINDINGS - Repeated demeaning comments in stand-ups - finding: substantiated.',
        '- Intimidating behaviour toward contractor - finding pending.',
        '3. WITNESS INTERVIEWS 2 interviews conducted; 2 outstanding. - Sarah Okafor (Senior Engineer) - interviewed by Deborah Whitfield on 18 Jun 2026.',
        '4. EVIDENCE REVIEWED - Stand-up meeting recording reviewed on 20 May 2026.',
        '5. KEY TIMELINE EVENTS 12 May 2026 - first incident reported during a sprint meeting.',
        '6. CONCLUSION The preponderance of evidence supports the complaint.',
    ].join('\n'),
};

const matter = {
    id: 'inv-001',
    referenceNumber: 'INV-2026-001',
    title: 'Harassment allegations - Engineering department',
    client: 'Northwind Logistics',
    type: 'harassment' as const,
    status: 'review' as const,
    priority: 'high' as const,
    investigator: 'Deborah Whitfield',
    openedAt: '2026-06-02',
    targetCompletionDate: '2026-09-15',
    description: 'Investigation into repeated allegations of verbal harassment.',
};

test.describe('section segmenter', () => {
    test('splits a flattened document at inline numbered headings', () => {
        const sections = segmentByHeadings(flattenedPrintOut.rawText!);
        const keys = sections.map((section) => section.key);

        expect(keys).toContain('matterSummary');
        expect(keys).toContain('allegationsAndFindings');
        expect(keys).toContain('witnessInterviews');
        expect(keys).toContain('evidenceReviewed');
        expect(keys).toContain('keyTimelineEvents');
        expect(keys).toContain('conclusion');
    });

    test('keeps heading content with its own section', () => {
        const sections = segmentByHeadings('Matter Summary\nOpened in June.\nConclusion\nClosed in September.');
        expect(sections).toHaveLength(2);
        expect(sections[0].key).toBe('matterSummary');
        expect(sections[0].lines).toEqual(['Opened in June.']);
        expect(sections[1].key).toBe('conclusion');
        expect(sections[1].lines).toEqual(['Closed in September.']);
    });
});

test.describe('heading-aware mapping', () => {
    test('places each flattened section under its correct report section', () => {
        const draft = buildReportDraft('inv-001', [flattenedPrintOut]);

        const summaryValues = draft.sections.matterSummary.map((field) => field.value).join(' ');
        expect(summaryValues).toContain('INV-2026-001');
        expect(summaryValues).not.toContain('ALLEGATIONS');

        const allegationValues = draft.sections.allegationsAndFindings.map((field) => field.value).join(' ');
        expect(allegationValues).toContain('demeaning comments');
        expect(allegationValues).not.toContain('MATTER SUMMARY');
        expect(allegationValues).not.toContain('WITNESS INTERVIEWS');

        const interviewValues = draft.sections.witnessInterviews.map((field) => field.value).join(' ');
        expect(interviewValues).toContain('Sarah Okafor');

        const evidenceValues = draft.sections.evidenceReviewed.map((field) => field.value).join(' ');
        expect(evidenceValues).toContain('Stand-up meeting recording');

        const timelineValues = draft.sections.keyTimelineEvents.map((field) => field.value).join(' ');
        expect(timelineValues).toContain('12 May 2026');

        const conclusionValues = draft.sections.conclusion.map((field) => field.value).join(' ');
        expect(conclusionValues).toContain('preponderance of evidence');
    });

    test('no single mapped field swallows multiple sections', () => {
        const draft = buildReportDraft('inv-001', [flattenedPrintOut]);
        const allFields = Object.values(draft.sections).flat();

        for (const field of allFields) {
            expect(field.value.includes('MATTER SUMMARY') && field.value.includes('WITNESS INTERVIEWS')).toBe(false);
        }
    });

    test('creates a new custom section for an unrecognized heading', () => {
        const draft = buildReportDraft('inv-001', [
            {
                fileId: 'f-custom',
                fileName: 'memo.docx',
                fileType: 'docx',
                rawText: ['1. HR Recommendations', 'Provide refresher training to all team leads by end of quarter.'].join('\n'),
            },
        ]);

        expect(draft.customSections).toHaveLength(1);
        expect(draft.customSections[0].name).toBe('HR Recommendations');
        expect(draft.customSections[0].fields[0].value).toContain('refresher training');
    });

    test('free-form files without headings still map through keyword rules', () => {
        const draft = buildReportDraft('inv-001', [
            {
                fileId: 'f-free',
                fileName: 'notes.docx',
                fileType: 'docx',
                rawText: 'Allegation of harassment by the team lead was substantiated by witnesses.',
            },
        ]);
        expect(draft.sections.allegationsAndFindings.length).toBeGreaterThan(0);
    });
});

test.describe('custom section hand-off', () => {
    test('custom sections convert into new report sections', () => {
        const draft = buildReportDraft('inv-001', [
            {
                fileId: 'f-custom',
                fileName: 'memo.docx',
                fileType: 'docx',
                rawText: ['1. HR Recommendations', 'Provide refresher training to all team leads by end of quarter.'].join('\n'),
            },
        ]);

        const custom = draftToCustomReportSections(draft);
        expect(custom).toHaveLength(1);
        expect(custom[0].heading).toBe('HR Recommendations');
        expect(custom[0].bullets[0]).toContain('refresher training');

        // The generated report renders the custom section, renumbered last.
        const sections = buildReport({
            matter,
            allegations: [],
            interviews: [],
            evidenceItems: [],
            events: [],
            savedFindings: {},
            autoFillSections: custom,
        });
        const headings = sections.map((section) => section.heading);
        expect(headings.some((heading) => heading.includes('HR Recommendations'))).toBe(true);

        const hrSection = sections.find((section) => section.heading.includes('HR Recommendations'))!;
        const hrIndex = headings.indexOf(hrSection.heading);
        expect(hrIndex).toBe(sections.length - 1);
        expect(hrSection.heading).toMatch(new RegExp(`^${sections.length}\\. HR Recommendations$`));
    });

    test('canonical sections keep their mapping while custom sections pass through', () => {
        const draft = buildReportDraft('inv-001', [
            {
                fileId: 'f-both',
                fileName: 'report.docx',
                fileType: 'docx',
                rawText: [
                    'Matter Summary',
                    'An investigation into harassment allegations in the engineering department.',
                    '1. HR Recommendations',
                    'Deliver unconscious-bias training.',
                ].join('\n'),
            },
        ]);

        const values = draftToReportSections(draft);
        expect(values.summary?.[0]).toContain('harassment allegations');

        const custom = draftToCustomReportSections(draft);
        expect(custom[0].heading).toBe('HR Recommendations');
    });
});
