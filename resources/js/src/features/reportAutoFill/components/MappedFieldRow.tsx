import { FileSearch, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { MappedField } from '../types/reportAutoFill';
import ConfidenceBadge from './ConfidenceBadge';

interface MappedFieldRowProps {
    field: MappedField;
    onChange: (value: string) => void;
    onClear: () => void;
}

export default function MappedFieldRow({ field, onChange, onClear }: MappedFieldRowProps) {
    const [showSource, setShowSource] = useState(false);

    return (
        <li className="space-y-1.5 rounded-lg border p-3" data-testid="mapped-field-row">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn('text-xs font-medium tracking-wide uppercase', field.edited ? 'text-foreground' : 'text-muted-foreground')}>
                    {field.fieldLabel}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                    <ConfidenceBadge confidence={field.confidence} edited={field.edited} />
                    <button
                        type="button"
                        onClick={onClear}
                        aria-label={`Clear ${field.fieldLabel}`}
                        className="hover:bg-accent text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                    >
                        <X className="size-3.5" />
                    </button>
                </span>
            </div>
            <textarea
                rows={2}
                value={field.value}
                aria-label={`Value for ${field.fieldLabel}`}
                onChange={(event) => onChange(event.target.value)}
                className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
            />
            <div className="flex items-center gap-2">
                {field.sourceExcerpt && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowSource((open) => !open)}>
                        <FileSearch className="mr-1 size-3" /> {field.sourceFileName}
                    </Button>
                )}
                {!field.sourceExcerpt && <span className="text-muted-foreground text-xs">{field.sourceFileName}</span>}
            </div>
            {showSource && field.sourceExcerpt && (
                <blockquote className="bg-muted/50 border-l-primary text-muted-foreground rounded-r-md border-l-2 px-3 py-1.5 font-mono text-xs">
                    {field.sourceExcerpt}
                </blockquote>
            )}
        </li>
    );
}
