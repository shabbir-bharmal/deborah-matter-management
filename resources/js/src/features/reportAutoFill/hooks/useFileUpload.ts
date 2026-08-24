import { useCallback, useState } from 'react';

import { detectFileType, parseUploadedFile } from '../parsers/parserRouter';
import type { ExtractionResult, UploadedFile } from '../types/reportAutoFill';

export interface FileUploadState {
    files: UploadedFile[];
    rejected: { fileName: string; reason: string }[];
    extractions: ExtractionResult[];
    addFiles: (incoming: FileList | File[]) => void;
    removeFile: (fileId: string) => void;
    clearRejected: () => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function makeFileId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useFileUpload(): FileUploadState {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [rejected, setRejected] = useState<{ fileName: string; reason: string }[]>([]);
    const [extractions, setExtractions] = useState<ExtractionResult[]>([]);

    const updateFile = useCallback((fileId: string, patch: Partial<UploadedFile>) => {
        setFiles((current) => current.map((entry) => (entry.id === fileId ? { ...entry, ...patch } : entry)));
    }, []);

    const parseOne = useCallback(
        async (entry: UploadedFile) => {
            updateFile(entry.id, { status: 'parsing', errorMessage: undefined });
            try {
                const result = await parseUploadedFile(entry);
                setExtractions((current) => [...current.filter((existing) => existing.fileId !== entry.id), result]);
                const isEmpty = !result.rawText && !(result.rows && result.rows.length > 0) && !(result.pages && result.pages.length > 0);
                if (isEmpty) {
                    updateFile(entry.id, {
                        status: 'error',
                        errorMessage: 'No readable content found in this file.',
                    });
                    return;
                }
                updateFile(entry.id, { status: 'parsed' });
            } catch (error) {
                setExtractions((current) => current.filter((existing) => existing.fileId !== entry.id));
                updateFile(entry.id, {
                    status: 'error',
                    errorMessage: error instanceof Error ? error.message : 'The file could not be parsed.',
                });
            }
        },
        [updateFile],
    );

    const addFiles = useCallback(
        (incoming: FileList | File[]) => {
            const list = Array.from(incoming);
            const accepted: UploadedFile[] = [];
            const rejectedEntries: { fileName: string; reason: string }[] = [];

            for (const file of list) {
                const type = detectFileType(file);
                if (!type) {
                    rejectedEntries.push({ fileName: file.name, reason: 'Unsupported file type — upload .docx, .pdf, or .csv files.' });
                    continue;
                }
                if (file.size > MAX_SIZE_BYTES) {
                    rejectedEntries.push({ fileName: file.name, reason: 'File is larger than the 10 MB client-side limit.' });
                    continue;
                }
                accepted.push({ id: makeFileId(), file, type, status: 'queued' });
            }

            if (accepted.length > 0) {
                setFiles((current) => [...current, ...accepted]);
                for (const entry of accepted) {
                    void parseOne(entry);
                }
            }
            if (rejectedEntries.length > 0) {
                setRejected((current) => [...current, ...rejectedEntries]);
            }
        },
        [parseOne],
    );

    const removeFile = useCallback((fileId: string) => {
        setFiles((current) => current.filter((entry) => entry.id !== fileId));
        setExtractions((current) => current.filter((entry) => entry.fileId !== fileId));
    }, []);

    const clearRejected = useCallback(() => {
        setRejected([]);
    }, []);

    return { files, rejected, extractions, addFiles, removeFile, clearRejected };
}
