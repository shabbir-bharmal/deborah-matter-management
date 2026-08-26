import type { ReportSectionKey } from '../../types/reportAutoFill';

/**
 * Splits raw extracted text into sections by detecting report headings.
 *
 * Handles:
 * - standalone headings on their own line ("Matter Summary", "Conclusion:")
 * - numbered headings ("1. Matter Summary", "2: Allegations and Findings"),
 *   including numbered headings for CUSTOM (non-canonical) section names
 * - flattened text where the whole document is one line — heading markers
 *   are split out of the line itself
 *
 * Headings that do not map to a known report section are kept as custom
 * section names so callers can create new sections for them.
 */

export interface TextSection {
    /** Canonical report section key, or a custom section display name. */
    key: string;
    isCustom: boolean;
    /** Content lines that belong to this section, in order. */
    lines: string[];
}

/** Canonical section key by heading synonym (all lowercase). */
const HEADING_SYNONYMS: Record<string, ReportSectionKey> = {
    'matter summary': 'matterSummary',
    summary: 'matterSummary',
    background: 'matterSummary',
    overview: 'matterSummary',
    allegations: 'allegationsAndFindings',
    allegation: 'allegationsAndFindings',
    'allegations and findings': 'allegationsAndFindings',
    'allegations & findings': 'allegationsAndFindings',
    findings: 'allegationsAndFindings',
    'witness interviews': 'witnessInterviews',
    interviews: 'witnessInterviews',
    interview: 'witnessInterviews',
    'evidence reviewed': 'evidenceReviewed',
    evidence: 'evidenceReviewed',
    exhibits: 'evidenceReviewed',
    'key timeline events': 'keyTimelineEvents',
    'key events': 'keyTimelineEvents',
    timeline: 'keyTimelineEvents',
    'timeline of events': 'keyTimelineEvents',
    conclusion: 'conclusion',
    outcome: 'conclusion',
    recommendations: 'conclusion',
};

/**
 * Makes each letter of a synonym case-insensitive WITHOUT the /i flag, so
 * the [A-Z] lookahead in the marker stays case-sensitive.
 */
const SYNONYM_PATTERN = Object.keys(HEADING_SYNONYMS)
    .sort((a, b) => b.length - a.length)
    .map((synonym) => synonym.replace(/[a-z]/g, (ch) => `[${ch}${ch.toUpperCase()}]`))
    .join('|');

/**
 * Matches a heading marker embedded mid-line: optional numbering, then a
 * known synonym (or a generic numbered Title-Case heading), followed by at
 * least one horizontal space and content that starts a new sentence.
 * The match is replaced by newlines so the heading becomes its own line.
 */
const INLINE_HEADING_MARKER = new RegExp(
    // Known synonym heading followed by sentence-start content (uppercase,
    // digit, or punctuation). The synonym letters carry their own case
    // classes so the [A-Z] lookahead stays case-sensitive.
    // Generic (custom) numbered headings are intentionally NOT split inline -
    // "1. HR Recommendations Provide..." is ambiguous - they are detected
    // when they stand on their own line (see isHeadingLine).
    `((?:\\d+\\s*[.:-]\\s*)?(?:${SYNONYM_PATTERN}))(?:[:.])?[ \\t]+(?=[A-Z0-9(-])`,
    'g',
);

/** Split flattened text into lines at heading markers embedded mid-line. */
export function splitAtInlineHeadings(rawText: string): string[] {
    return rawText
        .replace(INLINE_HEADING_MARKER, '\n$1\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function canonicalKeyFor(headingText: string): { key: string; isCustom: boolean } {
    const normalized = headingText.toLowerCase().replace(/\s+/g, ' ').trim();
    const key = HEADING_SYNONYMS[normalized];
    if (key) {
        return { key, isCustom: false };
    }
    // Custom section: keep the heading's original casing as the display name.
    return { key: headingText.replace(/\s+/g, ' ').trim(), isCustom: true };
}

const NUMBERING_PATTERN = /^\s*(?:section\s*)?\d+\s*[.:-]\s*/i;

function isHeadingLine(line: string): { heading: string } | null {
    const hasNumbering = NUMBERING_PATTERN.test(line);
    const candidate = line.replace(NUMBERING_PATTERN, '').replace(/[:.]$/, '').trim();

    if (candidate.length < 3 || candidate.length > 60) {
        return null;
    }
    if (!/^[A-Za-z]/.test(candidate)) {
        return null;
    }

    const normalized = candidate.toLowerCase().replace(/\s+/g, ' ');
    if (HEADING_SYNONYMS[normalized]) {
        return { heading: candidate };
    }

    // Custom heading: must be numbered (unnumbered short lines could be
    // names or list items) and look like a title, not a sentence.
    if (hasNumbering && /^[A-Z0-9]/.test(candidate) && !/[.!?]$/.test(candidate)) {
        return { heading: candidate };
    }
    return null;
}

/** Segment raw text into sections by heading. Unrecognized content → 'unknown'. */
export function segmentByHeadings(rawText: string): TextSection[] {
    const lines = splitAtInlineHeadings(rawText);
    const sections: TextSection[] = [];
    let current: TextSection = { key: 'unknown', isCustom: false, lines: [] };

    for (const line of lines) {
        const heading = isHeadingLine(line);
        if (heading) {
            if (current.lines.length > 0) {
                sections.push(current);
            }
            const { key, isCustom } = canonicalKeyFor(heading.heading);
            current = { key, isCustom, lines: [] };
            continue;
        }
        current.lines.push(line);
    }
    if (current.lines.length > 0) {
        sections.push(current);
    }
    return sections;
}
