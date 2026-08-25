import { expect, test } from '@playwright/test';

import { buildReportDraft } from '~/features/reportAutoFill/mapping/mappingEngine';
import type { ExtractionResult } from '~/features/reportAutoFill/types/reportAutoFill';

const docxSample: ExtractionResult = {
    fileId: 'f-docx',
    fileName: 'investigation-summary.docx',
    fileType: 'docx',
    rawText: [
        'Summary',
        'An investigation into harassment allegations within the engineering department opened on 2026-06-02.',
        '',
        'Allegation — harassment by the team lead was substantiated by three witnesses.',
        'Interview with Sarah Okafor on 12 May 2026 confirmed the timeline of events.',
        'Interviewee: David Reyes',
        'Evidence: Stand-up meeting recording reviewed on 2026-05-20 by the investigator.',
        '12 May 2026 — first incident reported during a sprint meeting.',
        'Conclusion',
        'The preponderance of evidence supports the complaint.',
    ].join('\n'),
};

const csvWitnesses: ExtractionResult = {
    fileId: 'f-csv',
    fileName: 'witness-schedule.csv',
    fileType: 'csv',
    rows: [
        { Name: 'Jane Roe', Role: 'Complainant', Date: '2026-07-01', Notes: 'Consistent account across two sessions.' },
        { Name: 'John Smith', Role: 'Manager', Date: '2026-07-03', Notes: '' },
    ],
};

test.describe('mapping engine', () => {
    test('maps summary and conclusion paragraphs to the correct sections with high confidence', () => {
        const draft = buildReportDraft('inv-001', [docxSample]);

        expect(draft.sections.matterSummary).toHaveLength(1);
        expect(draft.sections.matterSummary[0].value).toContain('investigation into harassment');
        expect(draft.sections.matterSummary[0].confidence).toBe('high');

        expect(draft.sections.conclusion).toHaveLength(1);
        expect(draft.sections.conclusion[0].value).toContain('preponderance of evidence');
        expect(draft.sections.conclusion[0].confidence).toBe('high');
    });

    test('maps allegation lines with category + status as high confidence and category-only as medium', () => {
        const draft = buildReportDraft('inv-001', [docxSample]);
        const allegations = draft.sections.allegationsAndFindings;

        expect(allegations.length).toBeGreaterThan(0);
        expect(allegations.some((field) => field.confidence === 'high' && field.value.includes('substantiated'))).toBe(true);
        expect(allegations.every((field) => field.sourceFileId === 'f-docx')).toBe(true);
    });

    test('maps CSV witness rows into interviewee, date, and notes fields', () => {
        const draft = buildReportDraft('inv-001', [csvWitnesses]);
        const interviews = draft.sections.witnessInterviews;
        const labels = interviews.map((field) => field.fieldLabel);

        expect(labels).toContain('Interviewee — Jane Roe');
        expect(labels).toContain('Interview date — Jane Roe');
        expect(labels).toContain('Interview notes — Jane Roe');
        expect(interviews.find((field) => field.fieldLabel === 'Interviewee — John Smith')?.value).toBe('John Smith, Manager');
    });

    test('extracts "Interview with" mentions from text into witness interviews', () => {
        const draft = buildReportDraft('inv-001', [docxSample]);
        const interviews = draft.sections.witnessInterviews;

        expect(interviews.some((field) => field.fieldLabel === 'Interviewee — Sarah Okafor')).toBe(true);
        expect(interviews.some((field) => field.value === 'David Reyes')).toBe(true);
    });

    test('extracts evidence lines into evidenceReviewed', () => {
        const draft = buildReportDraft('inv-001', [docxSample]);
        const evidence = draft.sections.evidenceReviewed;

        expect(evidence.length).toBeGreaterThan(0);
        expect(evidence[0].value).toContain('Stand-up meeting recording');
        expect(evidence[0].confidence).toBe('high');
    });

    test('extracts dated lines into keyTimelineEvents with traceable sources', () => {
        const draft = buildReportDraft('inv-001', [docxSample]);
        const timeline = draft.sections.keyTimelineEvents;

        expect(timeline.length).toBeGreaterThan(0);
        for (const field of timeline) {
            expect(field.sourceExcerpt).toBeTruthy();
            expect(field.sourceFileName).toBe('investigation-summary.docx');
        }
    });

    test('collects leftover content in unmappedNotes instead of dropping it', () => {
        const noisy: ExtractionResult = {
            fileId: 'f-noise',
            fileName: 'notes.docx',
            fileType: 'docx',
            rawText: [
                'The weather during the site visit was rainy and the office parking lot was closed for resurfacing works.',
                'Summary',
                'Relevant summary paragraph that is definitely long enough to be captured by the rule above.',
            ].join('\n'),
        };
        const draft = buildReportDraft('inv-001', [noisy]);

        expect(draft.unmappedNotes.some((note) => note.includes('parking lot'))).toBe(true);
        expect(draft.unmappedNotes.every((note) => !note.includes('Relevant summary paragraph'))).toBe(true);
    });

    test('merges multiple files without cross-contaminating sources', () => {
        const draft = buildReportDraft('inv-001', [docxSample, csvWitnesses]);

        const allFields = Object.values(draft.sections).flat();
        expect(allFields.some((field) => field.sourceFileId === 'f-csv')).toBe(true);
        expect(allFields.some((field) => field.sourceFileId === 'f-docx')).toBe(true);
        expect(allFields.every((field) => field.edited === false)).toBe(true);
    });
});
