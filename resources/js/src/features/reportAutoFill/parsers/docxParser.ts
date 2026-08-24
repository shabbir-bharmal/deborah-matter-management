import mammoth from 'mammoth';

import type { ExtractionResult } from '../types/reportAutoFill';
import { normalizeText } from '../utils/textNormalize';

export async function parseDocx(file: File, fileId: string): Promise<ExtractionResult> {
    let arrayBuffer: ArrayBuffer;
    try {
        arrayBuffer = await file.arrayBuffer();
    } catch {
        throw new Error('The file could not be read.');
    }

    let value: string;
    try {
        // The browser build reads `arrayBuffer`; the Node build (used by vitest)
        // only understands `buffer`. Pass whichever exists so both runtimes work.
        const options: Record<string, unknown> = { arrayBuffer };
        const nodeBuffer = (globalThis as { Buffer?: { from(input: ArrayBuffer): unknown } }).Buffer;
        if (nodeBuffer) {
            options.buffer = nodeBuffer.from(arrayBuffer);
        }
        const result = await mammoth.extractRawText(options as unknown as Parameters<typeof mammoth.extractRawText>[0]);
        value = result.value;
    } catch (error) {
        throw new Error(error instanceof Error ? `DOCX could not be parsed: ${error.message}` : 'DOCX could not be parsed.');
    }

    return {
        fileId,
        fileName: file.name,
        fileType: 'docx',
        rawText: normalizeText(value),
    };
}
