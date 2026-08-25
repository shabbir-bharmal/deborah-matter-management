import { expect, test } from '@playwright/test';

import { parseCsv } from '~/features/reportAutoFill/parsers/csvParser';
import { parseDocx } from '~/features/reportAutoFill/parsers/docxParser';
import { detectFileType, parseUploadedFile } from '~/features/reportAutoFill/parsers/parserRouter';
import { countKeywordHits, scoreLine } from '~/features/reportAutoFill/utils/keywordScoring';
import { normalizeText } from '~/features/reportAutoFill/utils/textNormalize';

function makeFile(name: string, content: string, type = ''): File {
    return new File([content], name, { type });
}

/** Builds a tiny but valid .docx (zip) containing the given document.xml body. */
async function buildDocx(bodyXml: string): Promise<Uint8Array> {
    const { zipSync, strToU8 } = await import('fflate');
    const documentXml = `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}</w:body></w:document>`;
    return zipSync({
        '[Content_Types].xml': strToU8(
            '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
        ),
        '_rels/.rels': strToU8(
            '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
        ),
        'word/document.xml': strToU8(documentXml),
    });
}

test.describe('parser router', () => {
    test('detects file types by extension and MIME', () => {
        expect(detectFileType(makeFile('a.docx', ''))).toBe('docx');
        expect(detectFileType(makeFile('b.pdf', ''))).toBe('pdf');
        expect(detectFileType(makeFile('c.csv', '', 'text/csv'))).toBe('csv');
        expect(detectFileType(makeFile('d.png', '', 'image/png'))).toBeNull();
        expect(detectFileType(makeFile('e.docx', '', 'application/octet-stream'))).toBe('docx');
    });

    test('routes to the right parser and rejects unknown types', async () => {
        const csvFile = makeFile('r.csv', 'name,date\nJane,2026-01-05\n');
        const result = await parseUploadedFile({ id: 'f1', file: csvFile, type: 'csv', status: 'queued' });
        expect(result.fileType).toBe('csv');

        await expect(parseUploadedFile({ id: 'f2', file: makeFile('x.txt', 'hi'), type: 'pdf' as never, status: 'queued' })).rejects.toThrow();
    });
});

test.describe('csv parser', () => {
    test('parses rows with trimmed headers and skips empty lines', async () => {
        const result = await parseCsv(makeFile('w.csv', ' Name , Role , Date \nJane Doe,Manager,2026-01-05\n\n'), 'f1');
        expect(result.rows).toEqual([{ Name: 'Jane Doe', Role: 'Manager', Date: '2026-01-05' }]);
    });

    test('throws a readable error for garbage CSV with no rows', async () => {
        await expect(parseCsv(makeFile('bad.csv', '"unclosed\n'), 'f1')).rejects.toThrow(/CSV could not be parsed|/i);
    });
});

test.describe('docx parser', () => {
    test('extracts raw text from a minimal docx document', async () => {
        const buffer = await buildDocx('<w:p><w:r><w:t>Summary</w:t></w:r></w:p><w:p><w:r><w:t>The matter concerns harassment.</w:t></w:r></w:p>');
        const file = new File([buffer.buffer as ArrayBuffer], 'report.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const result = await parseDocx(file, 'f1');
        expect(result.rawText).toContain('Summary');
        expect(result.rawText).toContain('The matter concerns harassment.');
    });

    test('surfaces an error for a corrupted docx instead of crashing the caller', async () => {
        const file = new File(['not a real docx'], 'broken.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        await expect(parseDocx(file, 'f1')).rejects.toThrow(/DOCX could not be parsed|could not be read/i);
    });
});

test.describe('text + scoring utils', () => {
    test('normalizes whitespace and blank lines', () => {
        expect(normalizeText('  A\r\n\r\n\r\n  B  \n  C ')).toBe('A\n\nB\nC');
    });

    test('scores lines by strong/weak keyword hits', () => {
        expect(scoreLine('allegation of harassment substantiated', ['harassment'], ['substantiated'])).toBe(2);
        expect(scoreLine('mentioning retaliation only', ['harassment'], ['retaliation'])).toBe(1);
        expect(countKeywordHits('nothing here', ['harassment'])).toBe(0);
    });
});
