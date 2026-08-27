import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createInterview, getAssignableUsers, updateInterview } from '~/data/selectors';
import { interviewStatusLabels } from '~/lib/status';
import type { AuthUser, Interview, InterviewStatus, Witness } from '~/types';

interface FormValues {
    witnessId: string;
    scheduledAt: string;
    status: InterviewStatus | '';
    interviewerId: string;
    notes: string;
}

const TEXT = PAGE_TEXT.workspace.interviews.form;

interface InterviewFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    interview?: Interview | null;
    witnesses: Witness[];
    onSaved: (interview: Interview) => void;
}

function toFormValues(interview?: Interview | null): FormValues {
    if (!interview) {
        return { witnessId: '', scheduledAt: '', status: 'scheduled', interviewerId: '', notes: '' };
    }
    return {
        witnessId: interview.witnessId,
        scheduledAt: interview.scheduledAt.slice(0, 16),
        status: interview.status,
        interviewerId: interview.interviewerId ? String(interview.interviewerId) : '',
        notes: interview.notes ?? '',
    };
}

export default function InterviewFormDialog({ open, onOpenChange, matterId, interview, witnesses, onSaved }: InterviewFormDialogProps) {
    const [values, setValues] = useState<FormValues>(() => toFormValues(interview));
    const [interviewers, setInterviewers] = useState<AuthUser[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(interview);
    const statuses = Object.keys(interviewStatusLabels) as InterviewStatus[];

    useEffect(() => {
        if (open) {
            setValues(toFormValues(interview));
            setError(null);
        }
    }, [open, interview]);

    useEffect(() => {
        if (!open) {
            return;
        }
        getAssignableUsers()
            .then((users) => {
                setInterviewers(users);
                if (!interview && values.interviewerId === '') {
                    setValues((prev) => ({ ...prev, interviewerId: String(users[0]?.id ?? '') }));
                }
            })
            .catch(() => setInterviewers([]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!values.witnessId) {
            setError(TEXT.errors.witnessRequired);
            return;
        }
        if (!values.scheduledAt) {
            setError(TEXT.errors.scheduledAtRequired);
            return;
        }
        if (!values.status) {
            setError(TEXT.errors.statusRequired);
            return;
        }

        const payload = {
            witnessId: values.witnessId,
            scheduledAt: values.scheduledAt,
            status: values.status as InterviewStatus,
            interviewerId: values.interviewerId ? Number(values.interviewerId) : null,
            notes: values.notes.trim() || null,
        };

        setSaving(true);
        setError(null);
        try {
            const saved = isEdit && interview ? await updateInterview(matterId, interview.id, payload) : await createInterview(matterId, payload);
            onSaved(saved);
        } catch {
            setError(isEdit ? TEXT.updateError : TEXT.createError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onOpenChange(false);
                }
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? TEXT.editTitle : TEXT.createTitle}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="interview-witness">{TEXT.labels.witness}</Label>
                        <Select id="interview-witness" value={values.witnessId} onChange={(event) => set('witnessId', event.target.value)}>
                            <option value="">{TEXT.noWitness}</option>
                            {witnesses.map((witness) => (
                                <option key={witness.id} value={witness.id}>
                                    {witness.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="interview-scheduled">{TEXT.labels.scheduledAt}</Label>
                            <Input
                                id="interview-scheduled"
                                type="datetime-local"
                                value={values.scheduledAt}
                                onChange={(event) => set('scheduledAt', event.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="interview-status">{TEXT.labels.status}</Label>
                            <Select
                                id="interview-status"
                                value={values.status}
                                onChange={(event) => set('status', event.target.value as InterviewStatus)}
                            >
                                {statuses.map((value) => (
                                    <option key={value} value={value}>
                                        {interviewStatusLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="interview-interviewer">{TEXT.labels.interviewer}</Label>
                        <Select
                            id="interview-interviewer"
                            value={values.interviewerId}
                            onChange={(event) => set('interviewerId', event.target.value)}
                        >
                            <option value="">{TEXT.noInterviewer}</option>
                            {interviewers.map((user) => (
                                <option key={user.id} value={String(user.id)}>
                                    {user.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="interview-notes">{TEXT.labels.notes}</Label>
                        <Textarea
                            id="interview-notes"
                            value={values.notes}
                            onChange={(event) => set('notes', event.target.value)}
                            rows={3}
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
