import { CheckCircle2, FileSpreadsheet, FileText, Loader2, TriangleAlert, X } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { SupportedFileType, UploadedFile } from '../types/reportAutoFill';

const typeLabels: Record<SupportedFileType, string> = {
    docx: 'DOCX',
    pdf: 'PDF',
    csv: 'CSV',
};

const typeIcons: Record<SupportedFileType, typeof FileText> = {
    docx: FileText,
    pdf: FileText,
    csv: FileSpreadsheet,
};

const statusBadgeClass: Record<UploadedFile['status'], string> = {
    queued: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    parsing: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    parsed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

function formatSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadedFileListProps {
    files: UploadedFile[];
    onRemove?: (fileId: string) => void;
}

export default function UploadedFileList({ files, onRemove }: UploadedFileListProps) {
    if (files.length === 0) {
        return null;
    }

    return (
        <ul className="space-y-2" data-testid="uploaded-file-list">
            {files.map((entry) => {
                const Icon = typeIcons[entry.type];
                return (
                    <li
                        key={entry.id}
                        className={cn(
                            'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-sm',
                            entry.status === 'error' && 'border-destructive/40',
                        )}
                    >
                        <Icon className="text-muted-foreground size-4 shrink-0" />
                        <span className="truncate font-medium">{entry.file.name}</span>
                        <Badge variant="outline">{typeLabels[entry.type]}</Badge>
                        <span className="text-muted-foreground text-xs tabular-nums">{formatSize(entry.file.size)}</span>
                        {entry.status === 'parsing' ? (
                            <span className="ml-auto inline-flex items-center gap-1.5">
                                <Loader2 className="size-3.5 animate-spin" />
                                <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                                    Parsing
                                </Badge>
                            </span>
                        ) : (
                            <Badge variant="outline" className={`ml-auto ${statusBadgeClass[entry.status]}`}>
                                {entry.status === 'parsed' && <CheckCircle2 className="mr-1 inline size-3" />}
                                {entry.status === 'error' && <TriangleAlert className="mr-1 inline size-3" />}
                                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </Badge>
                        )}
                        {onRemove && (
                            <button
                                type="button"
                                aria-label={`Remove ${entry.file.name}`}
                                onClick={() => onRemove(entry.id)}
                                className="hover:bg-accent text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        {entry.errorMessage && (
                            <p className="text-destructive w-full text-xs" role="alert">
                                {entry.errorMessage}
                            </p>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
