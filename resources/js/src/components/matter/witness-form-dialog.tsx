import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createWitness, updateWitness } from '~/data/selectors';
import { interviewStatusLabels, relationshipLabels } from '~/lib/status';
import type { InterviewStatus, Witness } from '~/types';

interface WitnessFormValues {
    name: string;
    role: string;
    relationship: Witness['relationship'];
    interviewStatus: InterviewStatus;
    interviewDate: string;
    notes: string;
}

const RELATIONSHIP_VALUES: Witness['relationship'][] = ['complainant', 'respondent', 'coworker', 'manager', 'third_party'];
const INTERVIEW_STATUS_VALUES: InterviewStatus[] = ['not_scheduled', 'scheduled', 'completed', 'cancelled', 'rescheduled'];

const TEXT = PAGE_TEXT.workspace.witnesses.form;

interface WitnessFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    /** When provided the dialog edits this witness, otherwise it creates a new one. */
    witness?: Witness | null;
    onSaved: (witness: Witness) => void;
}

function toFormValues(witness?: Witness | null): WitnessFormValues {
    if (!witness) {
        return {
            name: '',
            role: '',
            relationship: 'coworker',
            interviewStatus: 'not_scheduled',
            interviewDate: '',
            notes: '',
        };
    }
    return {
        name: witness.name,
        role: witness.role,
        relationship: witness.relationship,
        interviewStatus: witness.interviewStatus,
        interviewDate: witness.interviewDate ? witness.interviewDate.slice(0, 10) : '',
        notes: witness.notes ?? '',
    };
}

export default function WitnessFormDialog({ open, onOpenChange, matterId, witness, onSaved }: WitnessFormDialogProps) {
    const [values, setValues] = useState<WitnessFormValues>(() => toFormValues(witness));
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEdit = Boolean(witness);

    useEffect(() => {
        if (open) {
            setValues(toFormValues(witness));
            setFieldErrors({});
        }
    }, [open, witness]);

    const set = <K extends keyof WitnessFormValues>(key: K, value: WitnessFormValues[K]) => {
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
        if (!values.name.trim()) {
            nextErrors.name = TEXT.errors.nameRequired;
        }
        if (!values.role.trim()) {
            nextErrors.role = TEXT.errors.roleRequired;
        }
        if (!values.relationship) {
            nextErrors.relationship = TEXT.errors.relationshipRequired;
        }
        if (!values.interviewStatus) {
            nextErrors.interviewStatus = TEXT.errors.interviewStatusRequired;
        }
        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            return;
        }

        const payload = {
            name: values.name.trim(),
            role: values.role.trim(),
            relationship: values.relationship,
            interviewStatus: values.interviewStatus,
            interviewDate: values.interviewDate || null,
            notes: values.notes.trim() ? values.notes.trim() : null,
        };

        setSaving(true);
        try {
            const saved =
                isEdit && witness ? await updateWitness(matterId, witness.id, payload) : await createWitness(matterId, payload);
            onSaved(saved);
        } catch {
            setFieldErrors((prev) => ({ ...prev, _submit: isEdit ? TEXT.updateError : TEXT.createError }));
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
                    <DialogDescription>{isEdit ? witness?.name : undefined}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="witness-name">{TEXT.labels.name}</Label>
                        <Input
                            id="witness-name"
                            value={values.name}
                            onChange={(event) => set('name', event.target.value)}
                            placeholder={TEXT.placeholders.name}
                            className={inputClass('name')}
                            autoFocus
                        />
                        {fieldErrors.name && <p className="text-destructive text-xs">{fieldErrors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="witness-role">{TEXT.labels.role}</Label>
                        <Input
                            id="witness-role"
                            value={values.role}
                            onChange={(event) => set('role', event.target.value)}
                            placeholder={TEXT.placeholders.role}
                            className={inputClass('role')}
                        />
                        {fieldErrors.role && <p className="text-destructive text-xs">{fieldErrors.role}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="witness-relationship">{TEXT.labels.relationship}</Label>
                            <Select
                                id="witness-relationship"
                                value={values.relationship}
                                onChange={(event) => set('relationship', event.target.value as Witness['relationship'])}
                                className={inputClass('relationship')}
                            >
                                {RELATIONSHIP_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {relationshipLabels[value]}
                                    </option>
                                ))}
                            </Select>
                            {fieldErrors.relationship && <p className="text-destructive text-xs">{fieldErrors.relationship}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="witness-interview-status">{TEXT.labels.interviewStatus}</Label>
                            <Select
                                id="witness-interview-status"
                                value={values.interviewStatus}
                                onChange={(event) => set('interviewStatus', event.target.value as InterviewStatus)}
                                className={inputClass('interviewStatus')}
                            >
                                {INTERVIEW_STATUS_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {interviewStatusLabels[value]}
                                    </option>
                                ))}
                            </Select>
                            {fieldErrors.interviewStatus && <p className="text-destructive text-xs">{fieldErrors.interviewStatus}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="witness-interview-date">{TEXT.labels.interviewDate}</Label>
                        <Input
                            id="witness-interview-date"
                            type="date"
                            value={values.interviewDate}
                            onChange={(event) => set('interviewDate', event.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="witness-notes">{TEXT.labels.notes}</Label>
                        <Textarea
                            id="witness-notes"
                            value={values.notes}
                            onChange={(event) => set('notes', event.target.value)}
                            placeholder={TEXT.placeholders.notes}
                            rows={4}
                        />
                    </div>

                    {fieldErrors._submit && <p className="text-destructive text-sm">{fieldErrors._submit}</p>}

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
