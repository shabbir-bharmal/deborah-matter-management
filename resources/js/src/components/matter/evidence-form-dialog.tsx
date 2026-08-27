import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createEvidence, updateEvidence } from '~/data/selectors';
import { evidenceStatusLabels, evidenceTypeLabels } from '~/lib/status';
import type { Evidence, EvidenceStatus, EvidenceType } from '~/types';

interface EvidenceFormValues {
    title: string;
    type: EvidenceType;
    source: string;
    date: string;
    status: EvidenceStatus;
    description: string;
}

const TEXT = PAGE_TEXT.workspace.evidence.form;

interface EvidenceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    /** When provided the dialog edits this evidence, otherwise it creates a new one. */
    evidence?: Evidence | null;
    onSaved: (evidence: Evidence) => void;
}

function toFormValues(evidence?: Evidence | null): EvidenceFormValues {
    if (!evidence) {
        return {
            title: '',
            type: 'document',
            source: '',
            date: '',
            status: 'received',
            description: '',
        };
    }
    return {
        title: evidence.title,
        type: evidence.type,
        source: evidence.source,
        date: evidence.date.slice(0, 10),
        status: evidence.status,
        description: evidence.description,
    };
}

export default function EvidenceFormDialog({ open, onOpenChange, matterId, evidence, onSaved }: EvidenceFormDialogProps) {
    const [values, setValues] = useState<EvidenceFormValues>(() => toFormValues(evidence));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEdit = Boolean(evidence);

    useEffect(() => {
        if (open) {
            setValues(toFormValues(evidence));
            setError(null);
            setFieldErrors({});
        }
    }, [open, evidence]);

    const set = <K extends keyof EvidenceFormValues>(key: K, value: EvidenceFormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
        if (fieldErrors[key]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const nextErrors: Record<string, string> = {};
        if (!values.title.trim()) {
            nextErrors.title = TEXT.errors.titleRequired;
        }
        if (!values.type) {
            nextErrors.type = TEXT.errors.typeRequired;
        }
        if (!values.source.trim()) {
            nextErrors.source = TEXT.errors.sourceRequired;
        }
        if (!values.date) {
            nextErrors.date = TEXT.errors.dateRequired;
        }
        if (!values.status) {
            nextErrors.status = TEXT.errors.statusRequired;
        }
        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        const payload = {
            title: values.title.trim(),
            type: values.type,
            source: values.source.trim(),
            date: values.date,
            status: values.status,
            description: values.description,
        };

        setSaving(true);
        setError(null);
        try {
            const saved = isEdit && evidence ? await updateEvidence(matterId, evidence.id, payload) : await createEvidence(matterId, payload);
            onSaved(saved);
        } catch {
            setError(isEdit ? TEXT.updateError : TEXT.createError);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (key: string) => (fieldErrors[key] ? 'border-destructive focus-visible:ring-destructive' : '');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? TEXT.editTitle : TEXT.createTitle}</DialogTitle>
                    <DialogDescription>{isEdit ? evidence?.source : undefined}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="evidence-title">{TEXT.labels.title}</Label>
                        <Input
                            id="evidence-title"
                            value={values.title}
                            onChange={(event) => set('title', event.target.value)}
                            placeholder={TEXT.placeholders.title}
                            className={inputClass('title')}
                            autoFocus
                        />
                        {fieldErrors.title && <p className="text-destructive text-xs">{fieldErrors.title}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="evidence-type">{TEXT.labels.type}</Label>
                            <Select id="evidence-type" value={values.type} onChange={(event) => set('type', event.target.value as EvidenceType)} className={inputClass('type')}>
                                {(Object.keys(evidenceTypeLabels) as EvidenceType[]).map((value) => (
                                    <option key={value} value={value}>
                                        {evidenceTypeLabels[value]}
                                    </option>
                                ))}
                            </Select>
                            {fieldErrors.type && <p className="text-destructive text-xs">{fieldErrors.type}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="evidence-source">{TEXT.labels.source}</Label>
                            <Input
                                id="evidence-source"
                                value={values.source}
                                onChange={(event) => set('source', event.target.value)}
                                placeholder={TEXT.placeholders.source}
                                className={inputClass('source')}
                            />
                            {fieldErrors.source && <p className="text-destructive text-xs">{fieldErrors.source}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="evidence-date">{TEXT.labels.date}</Label>
                            <Input
                                id="evidence-date"
                                type="date"
                                value={values.date}
                                onChange={(event) => set('date', event.target.value)}
                                className={inputClass('date')}
                            />
                            {fieldErrors.date && <p className="text-destructive text-xs">{fieldErrors.date}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="evidence-status">{TEXT.labels.status}</Label>
                            <Select id="evidence-status" value={values.status} onChange={(event) => set('status', event.target.value as EvidenceStatus)} className={inputClass('status')}>
                                {(Object.keys(evidenceStatusLabels) as EvidenceStatus[]).map((value) => (
                                    <option key={value} value={value}>
                                        {evidenceStatusLabels[value]}
                                    </option>
                                ))}
                            </Select>
                            {fieldErrors.status && <p className="text-destructive text-xs">{fieldErrors.status}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="evidence-description">{TEXT.labels.description}</Label>
                        <Textarea
                            id="evidence-description"
                            value={values.description}
                            onChange={(event) => set('description', event.target.value)}
                            placeholder={TEXT.placeholders.description}
                            rows={4}
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                            {TEXT.cancel}
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? TEXT.saving : TEXT.save}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
