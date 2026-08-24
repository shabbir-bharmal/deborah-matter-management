import { emptyReportDraft, REPORT_SECTION_KEYS, type ExtractionResult, type ReportDraft } from '../types/reportAutoFill';
import { mapAllegations } from './rules/allegationRules';
import { mapEvidence } from './rules/evidenceRules';
import { paragraphsOf, truncate } from './rules/ruleHelpers';
import { mapConclusion, mapSummary } from './rules/summaryRules';
import { mapTimeline } from './rules/timelineRules';
import { mapWitnessInterviews } from './rules/witnessInterviewRules';

/**
 * Rules-based mapping engine. Runs every rule module over all extraction
 * results and merges them into a single ReportDraft. Content that cannot be
 * confidently placed is collected in unmappedNotes rather than dropped.
 *
 * Future iteration: rule modules share the signature
 * `(extractions: ExtractionResult[]) => MappedField[]`, so they can be
 * replaced or supplemented by an LLM-based extractor without touching the
 * preview or hand-off layers.
 */
export function buildReportDraft(matterId: string, extractions: ExtractionResult[]): ReportDraft {
    const draft = emptyReportDraft(matterId);
    const ruleModules = [mapSummary, mapAllegations, mapWitnessInterviews, mapEvidence, mapTimeline, mapConclusion];

    for (const rule of ruleModules) {
        for (const field of rule(extractions)) {
            if (field.value.trim()) {
                draft.sections[field.sectionKey].push(field);
            }
        }
    }

    draft.unmappedNotes = collectUnmapped(extractions, draft.sections);
    return draft;
}

/** Paragraphs with real content that no mapped field used as its excerpt. */
function collectUnmapped(extractions: ExtractionResult[], sections: ReportDraft['sections']): string[] {
    const consumed = new Set<string>();
    for (const key of REPORT_SECTION_KEYS) {
        for (const field of sections[key]) {
            if (field.sourceExcerpt) {
                consumed.add(normalizeExcerpt(field.sourceExcerpt));
            }
            // A rule may have trimmed the heading off its excerpt; the value
            // itself is the reliable marker for "this content was used".
            consumed.add(normalizeExcerpt(field.value));
        }
    }

    const notes: string[] = [];
    for (const extraction of extractions) {
        if (!extraction.rawText) {
            continue;
        }
        for (const paragraph of paragraphsOf(extraction.rawText)) {
            if (paragraph.length < 25 || consumed.has(normalizeExcerpt(paragraph))) {
                continue;
            }
            notes.push(`[${extraction.fileName}] ${truncate(paragraph, 240)}`);
        }
    }
    return [...new Set(notes)];
}

function normalizeExcerpt(text: string): string {
    return text.replace(/\s+/g, ' ').trim().slice(0, 120).toLowerCase();
}
