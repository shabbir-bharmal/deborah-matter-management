import { FileUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useReportAutoFill } from '../hooks/useReportAutoFill';
import type { ReportDraft } from '../types/reportAutoFill';
import FieldMappingPreview from './FieldMappingPreview';
import FileUploadZone from './FileUploadZone';
import UploadedFileList from './UploadedFileList';

interface AutoFillPanelProps {
    matterId: string;
    onAccept?: (draft: ReportDraft) => void;
}

/**
 * Top-level container for the custom report auto-fill POC:
 * upload → parse → map → editable preview → accept.
 */
export default function AutoFillPanel({ matterId, onAccept }: AutoFillPanelProps) {
    const { files, rejected, draft, addFiles, removeFile, clearRejected, updateFieldValue, clearField } = useReportAutoFill(matterId);

    return (
        <Card className="print:hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileUp className="size-4" /> Auto-fill report
                </CardTitle>
                <CardDescription>Upload supporting files (.docx, .pdf, .csv) and map their content into this report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <FileUploadZone onFiles={addFiles} />
                {rejected.length > 0 && (
                    <div
                        className="border-destructive/40 bg-destructive/5 space-y-1 rounded-lg border p-3"
                        role="alert"
                        data-testid="upload-rejections"
                    >
                        {rejected.map((entry) => (
                            <p key={`${entry.fileName}-${entry.reason}`} className="text-destructive text-xs">
                                <span className="font-medium">{entry.fileName}:</span> {entry.reason}
                            </p>
                        ))}
                        <button type="button" onClick={clearRejected} className="text-muted-foreground hover:text-foreground text-xs underline">
                            Dismiss
                        </button>
                    </div>
                )}
                <UploadedFileList files={files} onRemove={removeFile} />
                {draft && <FieldMappingPreview draft={draft} onChange={updateFieldValue} onClear={clearField} onAccept={onAccept} />}
            </CardContent>
        </Card>
    );
}
