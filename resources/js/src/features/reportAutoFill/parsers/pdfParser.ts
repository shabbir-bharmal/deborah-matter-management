import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import type { ExtractionResult } from '../types/reportAutoFill';
import { normalizeText } from '../utils/textNormalize';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export async function parsePdf(file: File, fileId: string): Promise<ExtractionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const document = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        pages.push(pageText);
    }

    return {
        fileId,
        fileName: file.name,
        fileType: 'pdf',
        pages,
        rawText: normalizeText(pages.join('\n\n')),
    };
}
