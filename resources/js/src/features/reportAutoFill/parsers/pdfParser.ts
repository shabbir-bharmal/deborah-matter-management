import type { ExtractionResult } from '../types/reportAutoFill';
import { normalizeText } from '../utils/textNormalize';

type PdfjsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfjsModule> | null = null;

/**
 * Lazily load pdf.js. Deferred because pdfjs-dist v5 touches browser globals
 * (DOMMatrix, etc.) at import time, which breaks plain-Node environments.
 *
 * Inside Vite the bundled worker is wired up via its `?url` asset import.
 * Outside Vite (e.g. unit tests) that fails silently and pdf.js falls back to
 * main-thread parsing.
 */
function loadPdfjs(): Promise<PdfjsModule> {
    if (!pdfjsPromise) {
        pdfjsPromise = (async () => {
            const pdfjs = await import('pdfjs-dist');
            try {
                const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
                pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
            } catch {
                // No Vite asset pipeline available — keep going without a worker.
            }
            return pdfjs;
        })();
    }
    return pdfjsPromise;
}

export async function parsePdf(file: File, fileId: string): Promise<ExtractionResult> {
    const pdfjs = await loadPdfjs();
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
