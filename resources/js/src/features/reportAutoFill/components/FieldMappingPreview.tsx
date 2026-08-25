import { ChevronDown, ChevronRight, FileQuestion } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { REPORT_SECTION_KEYS, type ReportDraft, type ReportSectionKey } from '../types/reportAutoFill';
import ReportSectionCard from './ReportSectionCard';

export const SECTION_TITLES: Record<ReportSectionKey, string> = {
    matterSummary: 'Matter summary',
    allegationsAndFindings: 'Allegations & findings',
    witnessInterviews: 'Witness interviews',
    evidenceReviewed: 'Evidence reviewed',
    keyTimelineEvents: 'Key timeline events',
    conclusion: 'Conclusion',
};

interface FieldMappingPreviewProps {
    draft: ReportDraft;
    onChange: (sectionKey: string, index: number, value: string) => void;
    onClear: (sectionKey: string, index: number) => void;
    onAccept?: (draft: ReportDraft) => void;
}

export default function FieldMappingPreview({ draft, onChange, onClear, onAccept }: FieldMappingPreviewProps) {
    const [showUnmapped, setShowUnmapped] = useState(false);
    const totalFields =
        REPORT_SECTION_KEYS.reduce((total, key) => total + draft.sections[key].length, 0) +
        draft.customSections.reduce((total, section) => total + section.fields.length, 0);

    return (
        <div className="space-y-3" data-testid="field-mapping-preview">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">
                    Review the auto-mapped fields below. Every value is editable; clear anything you do not want in the report.
                </p>
                {onAccept && totalFields > 0 && (
                    <Button type="button" size="sm" onClick={() => onAccept(draft)}>
                        Accept &amp; generate report
                    </Button>
                )}
            </div>

            {REPORT_SECTION_KEYS.map((key) => (
                <ReportSectionCard
                    key={key}
                    sectionKey={key}
                    title={SECTION_TITLES[key]}
                    fields={draft.sections[key]}
                    onChange={(index, value) => onChange(key, index, value)}
                    onClear={(index) => onClear(key, index)}
                />
            ))}

            {draft.customSections.map((section) => (
                <ReportSectionCard
                    key={section.name}
                    sectionKey={section.name}
                    title={section.name}
                    fields={section.fields}
                    onChange={(index, value) => onChange(section.name, index, value)}
                    onClear={(index) => onClear(section.name, index)}
                />
            ))}

            <Card className="border-dashed">
                <CardHeader>
                    <button
                        type="button"
                        onClick={() => setShowUnmapped((open) => !open)}
                        className="flex w-full items-center gap-2 text-left"
                        aria-expanded={showUnmapped}
                    >
                        {showUnmapped ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileQuestion className="text-muted-foreground size-4" /> Unmapped content
                        </CardTitle>
                        <span className="text-muted-foreground ml-auto text-xs font-normal">{draft.unmappedNotes.length} item(s)</span>
                    </button>
                </CardHeader>
                {showUnmapped && (
                    <CardContent>
                        {draft.unmappedNotes.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nothing left over — every extracted paragraph mapped to a section.</p>
                        ) : (
                            <ul className="space-y-1.5">
                                {draft.unmappedNotes.map((note) => (
                                    <li key={note} className="text-muted-foreground text-xs">
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
