import type { ExtractionResult, SupportedFileType, UploadedFile } from '../types/reportAutoFill';
import { parseCsv } from './csvParser';
import { parseDocx } from './docxParser';
import { parsePdf } from './pdfParser';

export function detectFileType(file: File): SupportedFileType | null {
    const extension = file.name.toLowerCase().split('.').pop();
    const byExtension = extension === 'docx' || extension === 'pdf' || extension === 'csv' ? (extension as SupportedFileType) : null;

    const mime = file.type.toLowerCase();
    const mimeMatches: Record<string, SupportedFileType> = {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/pdf': 'pdf',
        'text/csv': 'csv',
    };
    const byMime = mimeMatches[mime] ?? null;

    if (byMime && byExtension) {
        return byMime === byExtension ? byMime : byExtension;
    }
    return byExtension ?? byMime;
}

export async function parseUploadedFile(uploaded: UploadedFile): Promise<ExtractionResult> {
    switch (uploaded.type) {
        case 'docx':
            return parseDocx(uploaded.file, uploaded.id);
        case 'pdf':
            return parsePdf(uploaded.file, uploaded.id);
        case 'csv':
            return parseCsv(uploaded.file, uploaded.id);
    }
}
