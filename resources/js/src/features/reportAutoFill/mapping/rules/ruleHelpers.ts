import type { FieldConfidence, MappedField, ReportSectionKey } from '../../types/reportAutoFill';

export const DATE_PATTERN =
    /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.? \d{1,2},? \d{4})\b/i;

export interface RuleContext {
    fileId: string;
    fileName: string;
    excerpt?: string;
}

export function makeField(
    sectionKey: ReportSectionKey,
    fieldLabel: string,
    value: string,
    confidence: FieldConfidence,
    context: RuleContext,
): MappedField {
    return {
        sectionKey,
        fieldLabel,
        value,
        confidence,
        sourceFileId: context.fileId,
        sourceFileName: context.fileName,
        sourceExcerpt: context.excerpt ? truncate(context.excerpt, 200) : undefined,
        edited: false,
    };
}

export function truncate(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

/** Split raw text into paragraphs (blank-line separated). */
export function paragraphsOf(rawText: string): string[] {
    return rawText
        .split(/\n{1,}/)
        .map((line) => line.trim())
        .filter(Boolean);
}

/**
 * Find a heading like "Summary", "Background:" at line start and return the
 * paragraph that follows it (or the remainder of the same line).
 */
export function paragraphAfterHeading(lines: string[], headings: string[]): { value: string; excerpt: string } | null {
    const headingPattern = new RegExp(`^(${headings.join('|')})\\s*[:.]?\\s*$`, 'i');
    const inlinePattern = new RegExp(`^(${headings.join('|')})\\s*[:.]\\s+(.+)$`, 'i');

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const inline = line.match(inlinePattern);
        if (inline && inline[2] && inline[2].trim().length > 20) {
            return { value: inline[2].trim(), excerpt: line };
        }
        if (headingPattern.test(line)) {
            const following = lines
                .slice(index + 1, index + 4)
                .join(' ')
                .trim();
            if (following.length > 0) {
                return { value: following, excerpt: `${line}\n${lines[index + 1]?.trim() ?? ''}`.trim() };
            }
        }
    }
    return null;
}

/** Fuzzy header match for CSV columns, e.g. "Witness Name" → name-ish. */
export function findColumn(headers: string[], variants: RegExp): string | null {
    return headers.find((header) => variants.test(header)) ?? null;
}
