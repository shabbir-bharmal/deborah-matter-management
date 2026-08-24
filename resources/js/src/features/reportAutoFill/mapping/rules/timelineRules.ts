import type { ExtractionResult, MappedField } from '../../types/reportAutoFill';
import { DATE_PATTERN, makeField, paragraphsOf } from './ruleHelpers';

export function mapTimeline(extractions: ExtractionResult[]): MappedField[] {
    const fields: MappedField[] = [];
    for (const extraction of extractions) {
        if (!extraction.rawText) {
            continue;
        }
        const lines = paragraphsOf(extraction.rawText);
        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const dateMatch = line.match(DATE_PATTERN);
            if (!dateMatch) {
                continue;
            }

            // Description = words on the same line after the date, or the next line.
            const sameLine = line.slice((dateMatch.index ?? 0) + dateMatch[0].length).trim();
            const description = sameLine.length >= 10 ? sameLine : (lines[index + 1] ?? '').trim();
            if (description.replace(DATE_PATTERN, '').trim().split(/\s+/).length < 3) {
                continue;
            }

            // ISO / written-out month dates are unambiguous → high; numeric d/m/y → medium.
            const confidence = /^[A-Za-z]{3}/.test(dateMatch[0]) || /^\d{4}-/.test(dateMatch[0]) ? 'high' : 'medium';
            fields.push(
                makeField('keyTimelineEvents', `Timeline event — ${dateMatch[0]}`, `${dateMatch[0]} — ${description}`, confidence, {
                    ...extraction,
                    excerpt: line,
                }),
            );
        }
    }
    return fields;
}
