import type { ExtractionResult, MappedField } from '../../types/reportAutoFill';
import { DATE_PATTERN, findColumn, makeField } from './ruleHelpers';

const TITLE_COLUMN = /\btitle\b|\bitem\b|\bname\b|\bdescription\b/i;
const TYPE_COLUMN = /\btype\b|\bcategory\b/i;
const SOURCE_COLUMN = /\bsource\b|\borigin\b|\bcustodian\b/i;
const DATE_COLUMN = /\bdate\b|\breceived\b/i;

export function mapEvidence(extractions: ExtractionResult[]): MappedField[] {
    const fields: MappedField[] = [];
    for (const extraction of extractions) {
        if (extraction.rows) {
            fields.push(...fromRows({ ...extraction, rows: extraction.rows }));
        }
        if (extraction.rawText) {
            fields.push(...fromText(extraction));
        }
    }
    return fields;
}

function fromRows(extraction: ExtractionResult & { rows: Record<string, string>[] }): MappedField[] {
    const fields: MappedField[] = [];
    const headers = extraction.rows.length > 0 ? Object.keys(extraction.rows[0]) : [];
    const titleColumn = findColumn(headers, TITLE_COLUMN);
    const typeColumn = findColumn(headers, TYPE_COLUMN);
    const sourceColumn = findColumn(headers, SOURCE_COLUMN);
    const dateColumn = findColumn(headers, DATE_COLUMN);

    for (const row of extraction.rows) {
        const title = titleColumn ? (row[titleColumn] ?? '').trim() : '';
        if (!title) {
            continue;
        }
        const context = {
            ...extraction,
            excerpt: Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; '),
        };
        const parts = [
            typeColumn && row[typeColumn]?.trim() ? `Type: ${row[typeColumn].trim()}` : null,
            sourceColumn && row[sourceColumn]?.trim() ? `Source: ${row[sourceColumn].trim()}` : null,
            dateColumn && row[dateColumn]?.trim() ? `Date: ${row[dateColumn].trim()}` : null,
        ].filter(Boolean);
        fields.push(makeField('evidenceReviewed', `Evidence item — ${title}`, [title, ...parts].join(' — '), 'high', context));
    }
    return fields;
}

const EVIDENCE_PATTERN = /^(?:evidence|exhibit)\s*[:.]?\s*(.{10,})$/gim;

function fromText(extraction: ExtractionResult): MappedField[] {
    const fields: MappedField[] = [];
    const rawText = extraction.rawText ?? '';

    for (const match of rawText.matchAll(EVIDENCE_PATTERN)) {
        const value = match[1].trim();
        const dateMatch = value.match(DATE_PATTERN);
        fields.push(
            makeField('evidenceReviewed', `Evidence item — ${value.split(/\s+/).slice(0, 6).join(' ')}`, value, dateMatch ? 'high' : 'medium', {
                ...extraction,
                excerpt: match[0],
            }),
        );
    }
    return fields;
}
