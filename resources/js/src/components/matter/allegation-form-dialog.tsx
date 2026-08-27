import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createAllegation, updateAllegation } from '~/data/selectors';
import { allegationCategoryLabels, allegationStatusLabels } from '~/lib/status';
import type {
    Allegation,
    AllegationCategory,
    AllegationStatus,
} from '~/types';

type AllegationCategoryOption = AllegationCategory;
type AllegationStatusKey = AllegationStatus;

interface FormValues {
    title: string;
    description: string;
    category: AllegationCategory | '';
    status: AllegationStatus | '';
}

const TEXT = PAGE_TEXT.workspace.allegations.form;

interface AllegationFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    allegation?: Allegation | null;
    onSaved: (allegation: Allegation) => void;
}

function toFormValues(allegation?: Allegation | null): FormValues {
    if (!allegation) {
        return { title: '', description: '', category: 'misconduct', status: 'pending' };
    }
    return { title: allegation.title, description: allegation.description, category: allegation.category, status: allegation.status };
}

export default function AllegationFormDialog({ open, onOpenChange, matterId, allegation, onSaved }: AllegationFormDialogProps) {
    const [values, setValues] = useState<FormValues>(() => toFormValues(allegation));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(allegation);
    const categories = Object.keys(allegationCategoryLabels) as AllegationCategoryOption[];
    const statuses = Object.keys(allegationStatusLabels) as AllegationStatusKey[];

    useEffect(() => {
        if (open) {
            setValues(toFormValues(allegation));
            setError(null);
        }
    }, [open, allegation]);

    const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!values.title.trim()) {
            setError(TEXT.errors.titleRequired);
            return;
        }
        if (!values.description.trim()) {
            setError(TEXT.errors.descriptionRequired);
            return;
        }

        const payload = {
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category as AllegationCategory,
            status: values.status as AllegationStatus,
        };

        setSaving(true);
        setError(null);
        try {
            const saved = isEdit && allegation ? await updateAllegation(matterId, allegation.id, payload) : await createAllegation(matterId, payload);
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
                    <DialogDescription>{isEdit ? undefined : undefined}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="allegation-title">{TEXT.labels.title}</Label>
                        <Input
                            id="allegation-title"
                            value={values.title}
                            onChange={(event) => set('title', event.target.value)}
                            placeholder={TEXT.placeholders.title}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="allegation-description">{TEXT.labels.description}</Label>
                        <Textarea
                            id="allegation-description"
                            value={values.description}
                            onChange={(event) => set('description', event.target.value)}
                            placeholder={TEXT.placeholders.description}
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="allegation-category">{TEXT.labels.category}</Label>
                            <Select
                                id="allegation-category"
                                value={values.category}
                                onChange={(event) => set('category', event.target.value as AllegationCategory)}
                            >
                                {categories.map((value) => (
                                    <option key={value} value={value}>
                                        {allegationCategoryLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="allegation-status">{TEXT.labels.status}</Label>
                            <Select
                                id="allegation-status"
                                value={values.status}
                                onChange={(event) => set('status', event.target.value as AllegationStatus)}
                            >
                                {statuses.map((value) => (
                                    <option key={value} value={value}>
                                        {allegationStatusLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>
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
