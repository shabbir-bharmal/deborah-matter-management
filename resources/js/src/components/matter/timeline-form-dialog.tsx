import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createTimelineEvent, updateTimelineEvent } from '~/data/selectors';
import type { TimelineEvent, TimelineEventType } from '~/types';

const TEXT = PAGE_TEXT.workspace.timeline.form;

const timelineTypeLabels: Record<TimelineEventType, string> = {
    intake: 'Intake',
    meeting: 'Meeting',
    interview: 'Interview',
    evidence: 'Evidence',
    review: 'Review',
    milestone: 'Milestone',
    correspondence: 'Correspondence',
};

interface FormValues {
    date: string;
    type: TimelineEventType;
    title: string;
    description: string;
}

interface TimelineFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    event?: TimelineEvent | null;
    onSaved: (event: TimelineEvent) => void;
}

function toFormValues(event?: TimelineEvent | null): FormValues {
    if (!event) {
        return { date: '', type: 'milestone', title: '', description: '' };
    }
    return { date: event.date.slice(0, 10), type: event.type, title: event.title, description: event.description };
}

export default function TimelineFormDialog({ open, onOpenChange, matterId, event, onSaved }: TimelineFormDialogProps) {
    const [values, setValues] = useState<FormValues>(() => toFormValues(event));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(event);
    const types = Object.keys(timelineTypeLabels) as TimelineEventType[];

    useEffect(() => {
        if (open) {
            setValues(toFormValues(event));
            setError(null);
        }
    }, [open, event]);

    const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (eventSubmit: React.FormEvent) => {
        eventSubmit.preventDefault();
        if (!values.date) {
            setError(TEXT.errors.dateRequired);
            return;
        }
        if (!values.title.trim()) {
            setError(TEXT.errors.titleRequired);
            return;
        }
        if (!values.description.trim()) {
            setError(TEXT.errors.descriptionRequired);
            return;
        }

        const payload = {
            date: values.date,
            type: values.type,
            title: values.title.trim(),
            description: values.description.trim(),
        };

        setSaving(true);
        setError(null);
        try {
            const saved = isEdit && event ? await updateTimelineEvent(matterId, event.id, payload) : await createTimelineEvent(matterId, payload);
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="timeline-date">{TEXT.labels.date}</Label>
                            <Input id="timeline-date" type="date" value={values.date} onChange={(event) => set('date', event.target.value)} autoFocus />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="timeline-type">{TEXT.labels.type}</Label>
                            <Select id="timeline-type" value={values.type} onChange={(event) => set('type', event.target.value as TimelineEventType)}>
                                {types.map((value) => (
                                    <option key={value} value={value}>
                                        {timelineTypeLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="timeline-title">{TEXT.labels.title}</Label>
                        <Input
                            id="timeline-title"
                            value={values.title}
                            onChange={(event) => set('title', event.target.value)}
                            placeholder={TEXT.placeholders.title}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="timeline-description">{TEXT.labels.description}</Label>
                        <Textarea
                            id="timeline-description"
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
