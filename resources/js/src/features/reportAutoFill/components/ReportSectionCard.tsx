import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { MappedField } from '../types/reportAutoFill';
import MappedFieldRow from './MappedFieldRow';

interface ReportSectionCardProps {
    sectionKey: string;
    title: string;
    fields: MappedField[];
    onChange: (index: number, value: string) => void;
    onClear: (index: number) => void;
}

export default function ReportSectionCard({ sectionKey, title, fields, onChange, onClear }: ReportSectionCardProps) {
    const [collapsed, setCollapsed] = useState(false);

    if (fields.length === 0) {
        return null;
    }

    return (
        <Card data-testid={`report-section-${sectionKey}`}>
            <CardHeader>
                <button
                    type="button"
                    onClick={() => setCollapsed((open) => !open)}
                    className="flex w-full items-center gap-2 text-left"
                    aria-expanded={!collapsed}
                >
                    {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                    <CardTitle className="text-base">
                        {title}
                        <span className="text-muted-foreground ml-2 text-xs font-normal">
                            {fields.length} field{fields.length === 1 ? '' : 's'}
                        </span>
                    </CardTitle>
                </button>
            </CardHeader>
            {!collapsed && (
                <CardContent>
                    <ul className="space-y-2">
                        {fields.map((field, index) => (
                            <MappedFieldRow
                                key={`${field.fieldLabel}-${index}`}
                                field={field}
                                onChange={(value) => onChange(index, value)}
                                onClear={() => onClear(index)}
                            />
                        ))}
                    </ul>
                </CardContent>
            )}
        </Card>
    );
}
