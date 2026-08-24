import { FileUp } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '~/lib/utils';

const ACCEPTED_EXTENSIONS = '.docx,.pdf,.csv';

interface FileUploadZoneProps {
    onFiles: (files: FileList | File[]) => void;
}

export default function FileUploadZone({ onFiles }: FileUploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        if (event.dataTransfer.files.length > 0) {
            onFiles(event.dataTransfer.files);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="Upload supporting files"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    inputRef.current?.click();
                }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
            data-testid="file-upload-zone"
            className={cn(
                'hover:border-primary/60 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                dragActive ? 'border-primary bg-primary/5' : 'border-border',
            )}
        >
            <FileUp className="text-muted-foreground size-6" />
            <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
            <p className="text-muted-foreground text-xs">Accepted: .docx, .pdf, .csv — up to 10 MB per file</p>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                className="hidden"
                data-testid="file-input"
                onChange={(event) => {
                    if (event.target.files && event.target.files.length > 0) {
                        onFiles(event.target.files);
                    }
                    event.target.value = '';
                }}
            />
        </div>
    );
}
