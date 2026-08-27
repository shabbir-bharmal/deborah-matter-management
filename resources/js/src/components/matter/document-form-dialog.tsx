import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { PAGE_TEXT } from '~/constants/menuData';
import { createDocument, updateDocument } from '~/data/selectors';
import { documentStatusLabels, documentTypeLabels } from '~/lib/status';
import type { DocumentStatus, InvestigationDocument } from '~/types';

type DocumentType = InvestigationDocument['type'];

interface FormValues {
    name: string;
    type: DocumentType;
    status: DocumentStatus;
}

const TEXT = PAGE_TEXT.workspace.documents.form;

interface DocumentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    document?: InvestigationDocument | null;
    onSaved: (document: InvestigationDocument) => void;
}

function toFormValues(document?: InvestigationDocument | null): FormValues {
    if (!document) {
        return { name: '', type: 'report', status: 'draft' };
    }
    return { name: document.name, type: document.type, status: document.status };
}

export default function DocumentFormDialog({ open, onOpenChange, matterId, document, onSaved }: DocumentFormDialogProps) {
    const [values, setValues] = useState<FormValues>(() => toFormValues(document));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(document);
    const types = Object.keys(documentTypeLabels) as DocumentType[];
    const statuses = Object.keys(documentStatusLabels) as DocumentStatus[];

    useEffect(() => {
        if (open) {
            setValues(toFormValues(document));
            setError(null);
        }
    }, [open, document]);

    const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!values.name.trim()) {
            setError(TEXT.errors.nameRequired);
            return;
        }
        if (!values.type) {
            setError(TEXT.errors.typeRequired);
            return;
        }
        if (!values.status) {
            setError(TEXT.errors.statusRequired);
            return;
        }

        const payload = { name: values.name.trim(), type: values.type, status: values.status };

        setSaving(true);
        setError(null);
        try {
            const saved =
                isEdit && document ? await updateDocument(matterId, document.id, payload) : await createDocument(matterId, payload);
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
                        <Label htmlFor="document-name">{TEXT.labels.name}</Label>
                        <Input
                            id="document-name"
                            value={values.name}
                            onChange={(event) => set('name', event.target.value)}
                            placeholder={TEXT.placeholders.name}
                            autoFocus
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="document-type">{TEXT.labels.type}</Label>
                            <Select id="document-type" value={values.type} onChange={(event) => set('type', event.target.value as DocumentType)}>
                                {types.map((value) => (
                                    <option key={value} value={value}>
                                        {documentTypeLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="document-status">{TEXT.labels.status}</Label>
                            <Select
                                id="document-status"
                                value={values.status}
                                onChange={(event) => set('status', event.target.value as DocumentStatus)}
                            >
                                {statuses.map((value) => (
                                    <option key={value} value={value}>
                                        {documentStatusLabels[value]}
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
