import { emptyReportDraft, type ExtractionResult, type MappedField, type ReportDraft, type ReportSectionKey } from '../types/reportAutoFill';
import { mapAllegations } from './rules/allegationRules';
import { mapEvidence } from './rules/evidenceRules';
import { makeField, paragraphsOf, truncate } from './rules/ruleHelpers';
import { segmentByHeadings } from './rules/sectionSegmenter';
import { mapConclusion, mapSummary } from './rules/summaryRules';
import { mapTimeline } from './rules/timelineRules';
import { mapWitnessInterviews } from './rules/witnessInterviewRules';

/** Display labels for the canonical report sections. */
export const CANONICAL_SECTION_LABELS: Record<ReportSectionKey, string> = {
    matterSummary: 'Matter summary',
    allegationsAndFindings: 'Allegations & findings',
    witnessInterviews: 'Witness interviews',
    evidenceReviewed: 'Evidence reviewed',
    keyTimelineEvents: 'Key timeline events',
    conclusion: 'Conclusion',
};

/** Lines longer than this get sentence-split before keyword classification. */
const MAX_LINE_LENGTH = 600;

/**
 * Rules-based mapping engine.
 *
 * Content under recognizable report headings ("1. Matter Summary",
 * "2. Allegations and Findings", …) goes straight into the matching section —
 * headings that match no canonical section create a NEW custom section with
 * that name. Keyword rules run only over leftover content without headings,
 * so a single multi-section document can never be dumped into one section.
 */
/** Per-section structured rules applied to segmented content. */
const SECTION_RULES: Partial<Record<ReportSectionKey, (extractions: ExtractionResult[]) => MappedField[]>> = {
    witnessInterviews: mapWitnessInterviews,
    evidenceReviewed: mapEvidence,
    keyTimelineEvents: mapTimeline,
    allegationsAndFindings: mapAllegations,
};

export function buildReportDraft(matterId: string, extractions: ExtractionResult[]): ReportDraft {
    const draft = emptyReportDraft(matterId);
    const unknownLines: string[] = [];

    for (const extraction of extractions) {
        // Tabular (CSV) data keeps the precise column-based rules.
        if (extraction.rows) {
            for (const field of mapWitnessInterviews([extraction])) {
                pushCanonical(draft, field);
            }
            for (const field of mapEvidence([extraction])) {
                pushCanonical(draft, field);
            }
        }

        if (!extraction.rawText) {
            continue;
        }

        for (const segment of segmentByHeadings(extraction.rawText)) {
            if (segment.lines.length === 0) {
                continue;
            }
            if (segment.key === 'unknown') {
                unknownLines.push(...segment.lines);
                continue;
            }
            if (segment.isCustom) {
                appendCustomSection(draft, segment.key, segment.lines, extraction);
            } else {
                appendCanonicalSegment(draft, segment.key as ReportSectionKey, segment.lines, extraction);
            }
        }
    }

    // Free-form fallback: keyword rules over content that had no headings.
    if (unknownLines.length > 0) {
        const pseudo: ExtractionResult = {
            fileId: extractions[0]?.fileId ?? 'unknown',
            fileName: extractions[0]?.fileName ?? 'unknown',
            fileType: extractions[0]?.fileType ?? 'docx',
            rawText: unknownLines.flatMap(splitLongLine).join('\n'),
        };
        for (const rule of [mapSummary, mapAllegations, mapWitnessInterviews, mapEvidence, mapTimeline, mapConclusion]) {
            for (const field of rule([pseudo])) {
                pushCanonical(draft, field);
            }
        }
    }

    draft.unmappedNotes = collectUnmapped(extractions, draft.sections);
    return draft;
}

function pushCanonical(draft: ReportDraft, field: MappedField): void {
    if (!field.value.trim()) {
        return;
    }
    const bucket = draft.sections[field.sectionKey];
    if (bucket) {
        bucket.push(field);
    }
}

function appendCustomSection(draft: ReportDraft, name: string, lines: string[], extraction: ExtractionResult): void {
    let section = draft.customSections.find((entry) => entry.name === name);
    if (!section) {
        section = { name, fields: [] };
        draft.customSections.push(section);
    }
    for (const line of lines) {
        section.fields.push(makeField(name as ReportSectionKey, name, line, 'high', { ...extraction, excerpt: line }));
    }
}

function fieldsFromLines(lines: string[], sectionKey: ReportSectionKey, label: string, extraction: ExtractionResult): MappedField[] {
    return lines.map((line) => makeField(sectionKey, label, line, 'high', { ...extraction, excerpt: line }));
}

/**
 * Append a canonical segment: run the section's structured rule first (for
 * precise field labels like "Interviewee — Jane Roe"); if it yields nothing,
 * fall back to one field per line.
 */
function appendCanonicalSegment(draft: ReportDraft, sectionKey: ReportSectionKey, lines: string[], extraction: ExtractionResult): void {
    const label = CANONICAL_SECTION_LABELS[sectionKey];
    const rule = SECTION_RULES[sectionKey];
    let fields: MappedField[] = [];

    if (rule) {
        const pseudo: ExtractionResult = {
            fileId: extraction.fileId,
            fileName: extraction.fileName,
            fileType: extraction.fileType,
            rawText: lines.join('\n'),
        };
        fields = rule([pseudo]);
    }
    if (fields.length === 0) {
        fields = fieldsFromLines(lines, sectionKey, label, extraction);
    }
    for (const field of fields) {
        pushCanonical(draft, field);
    }
}

/** Very long unsegmented lines are sentence-split so keyword rules stay precise. */
function splitLongLine(line: string): string[] {
    if (line.length <= MAX_LINE_LENGTH) {
        return [line];
    }
    return line
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
}

/** Paragraphs with real content that no mapped field used as its excerpt. */
function collectUnmapped(extractions: ExtractionResult[], sections: ReportDraft['sections']): string[] {
    const consumed = new Set<string>();
    for (const key of Object.keys(sections) as ReportSectionKey[]) {
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
