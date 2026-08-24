import type { ExtractionResult, MappedField } from '../../types/reportAutoFill';
import { containsAny } from '../../utils/keywordScoring';
import { makeField, paragraphsOf } from './ruleHelpers';

const CATEGORY_KEYWORDS = ['harassment', 'discrimination', 'retaliation', 'misconduct', 'policy violation', 'conflict of interest'];
const STATUS_KEYWORDS = ['substantiated', 'unsubstantiated', 'not substantiated', 'pending', 'under review', 'inconclusive'];

export function mapAllegations(extractions: ExtractionResult[]): MappedField[] {
    const fields: MappedField[] = [];
    for (const extraction of extractions) {
        if (!extraction.rawText) {
            continue;
        }
        const lines = paragraphsOf(extraction.rawText);
        for (const line of lines) {
            const lower = line.toLowerCase();
            const category = CATEGORY_KEYWORDS.find((keyword) => lower.includes(keyword));
            if (!category) {
                continue;
            }
            // Strong: category + outcome status in the same line. Medium: category only.
            const confidence = containsAny(line, STATUS_KEYWORDS) ? 'high' : 'medium';
            fields.push(
                makeField('allegationsAndFindings', `Allegation — ${capitalize(category)}`, line, confidence, {
                    ...extraction,
                    excerpt: line,
                }),
            );
        }
    }
    return fields;
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
