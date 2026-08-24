import Papa from 'papaparse';

import type { ExtractionResult } from '../types/reportAutoFill';

export async function parseCsv(file: File, fileId: string): Promise<ExtractionResult> {
    const text = await file.text();
    const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0 && result.data.length === 0) {
        throw new Error(`CSV could not be parsed: ${result.errors[0]?.message ?? 'unknown error'}`);
    }

    return {
        fileId,
        fileName: file.name,
        fileType: 'csv',
        rows: result.data,
    };
}
