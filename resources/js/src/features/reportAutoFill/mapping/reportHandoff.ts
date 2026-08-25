import type { ReportAutoFillValues } from '~/hooks/use-report-store';
import { REPORT_SECTION_KEYS, type ReportDraft, type ReportSectionKey } from '../types/reportAutoFill';

/** Maps auto-fill section keys onto the existing report generator's section ids. */
export const SECTION_KEY_TO_REPORT_SECTION: Record<ReportSectionKey, string> = {
    matterSummary: 'summary',
    allegationsAndFindings: 'allegations',
    witnessInterviews: 'interviews',
    evidenceReviewed: 'evidence',
    keyTimelineEvents: 'timeline',
    conclusion: 'conclusion',
};

/** A file-derived section that has no canonical report counterpart. */
export interface CustomReportSectionInput {
    id: string;
    heading: string;
    bullets: string[];
}

/**
 * Convert an accepted ReportDraft into the shape the existing report
 * generator consumes: existing section id → list of bullet lines.
 */
export function draftToReportSections(draft: ReportDraft): ReportAutoFillValues {
    const values: Record<string, string[]> = {};
    for (const key of REPORT_SECTION_KEYS) {
        const lines = draft.sections[key].map((field) => field.value.trim()).filter(Boolean);
        if (lines.length > 0) {
            values[SECTION_KEY_TO_REPORT_SECTION[key]] = lines;
        }
    }
    return values;
}

/** Custom (file-created) sections, ready for the report generator to append. */
export function draftToCustomReportSections(draft: ReportDraft): CustomReportSectionInput[] {
    return draft.customSections
        .map((section, index) => ({
            id: `auto-custom-${index}`,
            heading: section.name,
            bullets: section.fields.map((field) => field.value.trim()).filter(Boolean),
        }))
        .filter((section) => section.bullets.length > 0);
}
