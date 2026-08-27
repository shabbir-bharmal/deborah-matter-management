import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { PAGE_TEXT } from '~/constants/menuData';
import { createMatter, getAssignableUsers, getClients, updateMatter } from '~/data/selectors';
import { matterStatusLabels, matterTypeLabels, priorityLabels } from '~/lib/status';
import type { AuthUser, ClientSummary, Investigation, InvestigationPriority, InvestigationStatus, InvestigationType } from '~/types';

interface MatterFormValues {
    title: string;
    clientId: string;
    investigatorId: string;
    type: InvestigationType;
    status: InvestigationStatus;
    priority: InvestigationPriority;
    openedAt: string;
    targetCompletionDate: string;
    description: string;
}

const TEXT = PAGE_TEXT.matters.form;

interface MatterFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** When provided the dialog edits this matter, otherwise it creates a new one. */
    matter?: Investigation | null;
    onSaved: (matter: Investigation) => void;
}

function toFormValues(matter?: Investigation | null): MatterFormValues {
    if (!matter) {
        const today = new Date().toISOString().slice(0, 10);
        return {
            title: '',
            clientId: '',
            investigatorId: '',
            type: 'misconduct',
            status: 'open',
            priority: 'medium',
            openedAt: today,
            targetCompletionDate: '',
            description: '',
        };
    }
    return {
        title: matter.title,
        clientId: matter.clientId ? String(matter.clientId) : '',
        investigatorId: matter.investigatorId ? String(matter.investigatorId) : '',
        type: matter.type,
        status: matter.status,
        priority: matter.priority,
        openedAt: matter.openedAt.slice(0, 10),
        targetCompletionDate: matter.targetCompletionDate.slice(0, 10),
        description: matter.description,
    };
}

export default function MatterFormDialog({ open, onOpenChange, matter, onSaved }: MatterFormDialogProps) {
    const [values, setValues] = useState<MatterFormValues>(() => toFormValues(matter));
    const [clients, setClients] = useState<ClientSummary[]>([]);
    const [investigators, setInvestigators] = useState<AuthUser[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEdit = Boolean(matter);

    useEffect(() => {
        if (open) {
            setValues(toFormValues(matter));
            setError(null);
            setFieldErrors({});
        }
    }, [open, matter]);

    useEffect(() => {
        if (!open) {
            return;
        }
        getClients().then(setClients).catch(() => setClients([]));
        getAssignableUsers()
            .then((users) => {
                setInvestigators(users);
                setValues((prev) => ({ ...prev, investigatorId: prev.investigatorId || String(users[0]?.id ?? '') }));
            })
            .catch(() => setInvestigators([]));
    }, [open]);

    const set = <K extends keyof MatterFormValues>(key: K, value: MatterFormValues[K]) => {
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
        if (!values.clientId) {
            nextErrors.clientId = TEXT.errors.clientRequired;
        }
        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            setError(TEXT.errors.invalid);
            return;
        }

        const payload = {
            title: values.title.trim(),
            clientId: Number(values.clientId),
            investigatorId: values.investigatorId ? Number(values.investigatorId) : null,
            type: values.type,
            status: values.status,
            priority: values.priority,
            openedAt: values.openedAt,
            targetCompletionDate: values.targetCompletionDate,
            description: values.description,
        };

        setSaving(true);
        setError(null);
        try {
            const saved = isEdit && matter ? await updateMatter(matter.id, payload) : await createMatter(payload);
            onSaved(saved);
        } catch {
            setError(isEdit ? TEXT.toasts.updateError : TEXT.toasts.createError);
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
                    <DialogDescription>{isEdit ? matter?.referenceNumber : undefined}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                        <Label htmlFor="matter-title">{TEXT.labels.title}</Label>
                        <Input
                            id="matter-title"
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
                            <Label htmlFor="matter-client">{TEXT.labels.client}</Label>
                            <Select
                                id="matter-client"
                                value={values.clientId}
                                onChange={(event) => set('clientId', event.target.value)}
                                className={inputClass('clientId')}
                            >
                                <option value="">{TEXT.noClient}</option>
                                {clients.map((client) => (
                                    <option key={client.clientId ?? client.id} value={String(client.clientId ?? client.id)}>
                                        {client.name}
                                    </option>
                                ))}
                            </Select>
                            {fieldErrors.clientId && <p className="text-destructive text-xs">{fieldErrors.clientId}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="matter-investigator">{TEXT.labels.investigator}</Label>
                            <Select
                                id="matter-investigator"
                                value={values.investigatorId}
                                onChange={(event) => set('investigatorId', event.target.value)}
                            >
                                <option value="">{TEXT.noInvestigator}</option>
                                {investigators.map((user) => (
                                    <option key={user.id} value={String(user.id)}>
                                        {user.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="matter-type">{TEXT.labels.type}</Label>
                            <Select id="matter-type" value={values.type} onChange={(event) => set('type', event.target.value as InvestigationType)}>
                                {(Object.keys(matterTypeLabels) as InvestigationType[]).map((value) => (
                                    <option key={value} value={value}>
                                        {matterTypeLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="matter-status">{TEXT.labels.status}</Label>
                            <Select
                                id="matter-status"
                                value={values.status}
                                onChange={(event) => set('status', event.target.value as InvestigationStatus)}
                            >
                                {(Object.keys(matterStatusLabels) as InvestigationStatus[]).map((value) => (
                                    <option key={value} value={value}>
                                        {matterStatusLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="matter-priority">{TEXT.labels.priority}</Label>
                            <Select
                                id="matter-priority"
                                value={values.priority}
                                onChange={(event) => set('priority', event.target.value as InvestigationPriority)}
                            >
                                {(Object.keys(priorityLabels) as InvestigationPriority[]).map((value) => (
                                    <option key={value} value={value}>
                                        {priorityLabels[value]}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="matter-opened">{TEXT.labels.openedAt}</Label>
                            <Input id="matter-opened" type="date" value={values.openedAt} onChange={(event) => set('openedAt', event.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="matter-target">{TEXT.labels.targetCompletionDate}</Label>
                            <Input
                                id="matter-target"
                                type="date"
                                value={values.targetCompletionDate}
                                onChange={(event) => set('targetCompletionDate', event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="matter-description">{TEXT.labels.description}</Label>
                        <Textarea
                            id="matter-description"
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
