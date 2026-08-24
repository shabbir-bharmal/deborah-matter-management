import type { ExtractionResult, MappedField } from '../../types/reportAutoFill';
import { DATE_PATTERN, findColumn, makeField, type RuleContext } from './ruleHelpers';

const NAME_COLUMN = /\b(witness|interviewee)?\s*name\b|\binterviewee\b|\bwitness\b/i;
const ROLE_COLUMN = /\brole\b|\bposition\b|\btitle\b/i;
const DATE_COLUMN = /\bdate\b|\bscheduled\b|\binterviewed on\b/i;
const NOTES_COLUMN = /\bnotes?\b|\bcomments?\b|\bsummary\b/i;

export function mapWitnessInterviews(extractions: ExtractionResult[]): MappedField[] {
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
    const nameColumn = findColumn(headers, NAME_COLUMN);
    if (!nameColumn) {
        return fields;
    }
    const roleColumn = findColumn(headers, ROLE_COLUMN);
    const dateColumn = findColumn(headers, DATE_COLUMN);
    const notesColumn = findColumn(headers, NOTES_COLUMN);

    for (const row of extraction.rows) {
        const name = (row[nameColumn] ?? '').trim();
        if (!name) {
            continue;
        }
        const context = {
            ...extraction,
            excerpt: Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; '),
        };
        if (roleColumn && row[roleColumn]?.trim()) {
            fields.push(makeField('witnessInterviews', `Interviewee — ${name}`, `${name}, ${row[roleColumn].trim()}`, 'high', context));
        } else {
            fields.push(makeField('witnessInterviews', `Interviewee — ${name}`, name, 'high', context));
        }
        if (dateColumn && row[dateColumn]?.trim()) {
            fields.push(makeField('witnessInterviews', `Interview date — ${name}`, row[dateColumn].trim(), 'high', context));
        }
        if (notesColumn && row[notesColumn]?.trim()) {
            fields.push(makeField('witnessInterviews', `Interview notes — ${name}`, row[notesColumn].trim(), 'medium', context));
        }
    }
    return fields;
}

const INTERVIEW_WITH_PATTERN = /[Ii]nterview\s+(?:with|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
const INTERVIEWEE_PATTERN = /^interviewee\s*[:.]\s*(.+)$/im;

function fromText(extraction: ExtractionResult): MappedField[] {
    const fields: MappedField[] = [];
    const rawText = extraction.rawText ?? '';

    for (const match of rawText.matchAll(INTERVIEW_WITH_PATTERN)) {
        const name = match[1];
        const line = lineAround(rawText, match.index ?? 0);
        const dateMatch = line.match(DATE_PATTERN);
        const context: RuleContext = { ...extraction, excerpt: line };
        fields.push(makeField('witnessInterviews', `Interviewee — ${name}`, name, dateMatch ? 'high' : 'medium', context));
        if (dateMatch) {
            fields.push(makeField('witnessInterviews', `Interview date — ${name}`, dateMatch[0], 'medium', context));
        }
    }

    const interviewee = rawText.match(INTERVIEWEE_PATTERN);
    if (interviewee?.[1]) {
        const value = interviewee[1].trim();
        fields.push(
            makeField('witnessInterviews', `Interviewee — ${firstWords(value)}`, value, 'medium', {
                ...extraction,
                excerpt: interviewee[0],
            }),
        );
    }
    return fields;
}

function lineAround(text: string, index: number): string {
    const start = text.lastIndexOf('\n', index) + 1;
    const nextBreak = text.indexOf('\n', index);
    return text.slice(start, nextBreak === -1 ? undefined : nextBreak).trim();
}

function firstWords(value: string): string {
    return value.split(/\s+/).slice(0, 3).join(' ');
}
