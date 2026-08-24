import type { ExtractionResult, MappedField } from '../../types/reportAutoFill';
import { makeField, paragraphAfterHeading, paragraphsOf } from './ruleHelpers';

const SUMMARY_HEADINGS = ['summary', 'background', 'overview'];
const CONCLUSION_HEADINGS = ['conclusion', 'outcome', 'recommendation'];

export function mapSummary(extractions: ExtractionResult[]): MappedField[] {
    const fields: MappedField[] = [];
    for (const extraction of extractions) {
        if (!extraction.rawText) {
            continue;
        }
        const match = paragraphAfterHeading(paragraphsOf(extraction.rawText), SUMMARY_HEADINGS);
        if (match) {
            fields.push(makeField('matterSummary', 'Matter summary', match.value, 'high', { ...extraction, excerpt: match.excerpt }));
        }
    }
    return fields;
}

export function mapConclusion(extractions: ExtractionResult[]): MappedField[] {
    const fields: MappedField[] = [];
    for (const extraction of extractions) {
        if (!extraction.rawText) {
            continue;
        }
        const match = paragraphAfterHeading(paragraphsOf(extraction.rawText), CONCLUSION_HEADINGS);
        if (match) {
            fields.push(makeField('conclusion', 'Conclusion', match.value, 'high', { ...extraction, excerpt: match.excerpt }));
        }
    }
    return fields;
}
