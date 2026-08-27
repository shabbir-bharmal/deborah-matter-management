import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import Pagination, { PAGE_SIZES } from '~/components/ui/pagination';
import { PAGE_TEXT } from '~/constants/menuData';
import { createClient, deleteClient, getClients, updateClient } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import type { ClientSummary } from '~/types';

interface FormValues {
    name: string;
    contactEmail: string;
}

const EMPTY_VALUES: FormValues = {
    name: '',
    contactEmail: '',
};

export default function Clients() {
    const [clients, setClients] = useState<ClientSummary[] | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<ClientSummary | null>(null);
    const [deletingClient, setDeletingClient] = useState<ClientSummary | null>(null);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
    const [error, setError] = useState<string | null>(null);

    const canCreate = useCan('clients.create');
    const canUpdate = useCan('clients.update');
    const canDelete = useCan('clients.delete');

    const sizeParam = Number(searchParams.get('pageSize'));
    const pageSize: number = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

    const reload = () => {
        void getClients().then(setClients).catch(() => setClients([]));
    };

    useEffect(() => {
        let cancelled = false;
        getClients().then((result) => {
            if (!cancelled) {
                setClients(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (formOpen) {
            setValues(
                editingClient
                    ? {
                          name: editingClient.name,
                          contactEmail: editingClient.contactEmail ?? '',
                      }
                    : EMPTY_VALUES,
            );
            setError(null);
        }
    }, [editingClient, formOpen]);

    const totalCount = clients?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const requestedPage = Number(searchParams.get('page')) || 1;
    const page = Math.min(Math.max(1, requestedPage), totalPages);

    const setPage = (value: number) => {
        const params = new URLSearchParams(searchParams);
        if (value > 1) {
            params.set('page', String(value));
        } else {
            params.delete('page');
        }
        setSearchParams(params);
    };

    const setPageSize = (size: number) => {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        if (size !== 10) {
            params.set('pageSize', String(size));
        } else {
            params.delete('pageSize');
        }
        setSearchParams(params);
    };

    const pagedClients = useMemo(() => (clients ?? []).slice((page - 1) * pageSize, page * pageSize), [clients, page, pageSize]);

    const openCreate = () => {
        setEditingClient(null);
        setFormOpen(true);
    };

    const openEdit = (client: ClientSummary) => {
        setEditingClient(client);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setSaving(false);
    };

    const saveClient = async () => {
        if (!values.name.trim()) {
            setError(PAGE_TEXT.clients.form.nameRequired);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                name: values.name.trim(),
                contactEmail: values.contactEmail.trim() ? values.contactEmail.trim() : null,
            };
            const saved = editingClient?.id ? await updateClient(editingClient.id, payload) : await createClient(payload);
            closeForm();
            reload();
            toast.success(editingClient ? PAGE_TEXT.clients.form.updated : PAGE_TEXT.clients.form.created, { description: saved.name });
        } catch {
            setError(editingClient ? PAGE_TEXT.clients.form.updateError : PAGE_TEXT.clients.form.createError);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingClient?.id) {
            return;
        }

        setSaving(true);
        try {
            await deleteClient(deletingClient.id);
            setDeletingClient(null);
            reload();
            toast.success(PAGE_TEXT.clients.deleteDialog.deleted, { description: deletingClient.name });
        } catch {
            setError(PAGE_TEXT.clients.deleteDialog.deleteError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.clients.title}</h1>
                    <p className="text-muted-foreground text-sm">{PAGE_TEXT.clients.subtitle}</p>
                </div>
                {canCreate && (
                    <Button type="button" onClick={openCreate}>
                        <Plus />
                        {PAGE_TEXT.clients.add}
                    </Button>
                )}
            </div>

            {!clients && <p className="text-muted-foreground text-sm">Loading clients…</p>}
            {clients && clients.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.clients.empty}</CardContent>
                </Card>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="client-grid">
                {pagedClients.map((client) => (
                    <div key={client.id} className="group relative">
                        <Link to={`/clients/${client.id}`} className="block">
                            <Card className="hover:bg-accent/50 h-full transition-colors">
                                <CardContent className="flex h-full items-start gap-3 p-5 pr-24">
                                    <span className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                                        <Building2 className="text-primary size-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">{client.name}</span>
                                        {client.contactEmail && <span className="text-muted-foreground mt-1 block truncate text-xs">{client.contactEmail}</span>}
                                        <span className="text-muted-foreground mt-1 block text-xs">
                                            {client.matterCount} matter{client.matterCount === 1 ? '' : 's'} · {client.activeCount} active
                                        </span>
                                        <Badge variant="outline" className="mt-2">
                                            {PAGE_TEXT.clients.portalBadge}
                                        </Badge>
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>

                        {(canUpdate || canDelete) && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 opacity-100 shadow-sm backdrop-blur-md md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                                {canUpdate && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEdit(client)}
                                        aria-label={`${PAGE_TEXT.clients.edit}: ${client.name}`}
                                    >
                                        <Pencil />
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingClient(client)}
                                        aria-label={`${PAGE_TEXT.clients.delete}: ${client.name}`}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {clients && totalCount > 0 && (
                <Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? PAGE_TEXT.clients.form.editTitle : PAGE_TEXT.clients.form.createTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="client-name">{PAGE_TEXT.clients.form.labels.name}</Label>
                            <Input
                                id="client-name"
                                value={values.name}
                                onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                                placeholder={PAGE_TEXT.clients.form.placeholders.name}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="client-email">{PAGE_TEXT.clients.form.labels.contactEmail}</Label>
                            <Input
                                id="client-email"
                                type="email"
                                value={values.contactEmail}
                                onChange={(event) => setValues((prev) => ({ ...prev, contactEmail: event.target.value }))}
                                placeholder={PAGE_TEXT.clients.form.placeholders.contactEmail}
                            />
                        </div>
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                            {PAGE_TEXT.clients.form.cancel}
                        </Button>
                        <Button type="button" onClick={saveClient} disabled={saving}>
                            {saving ? PAGE_TEXT.clients.form.saving : PAGE_TEXT.clients.form.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{PAGE_TEXT.clients.deleteDialog.title}</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        {PAGE_TEXT.clients.deleteDialog.description}
                    </p>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeletingClient(null)} disabled={saving}>
                            {PAGE_TEXT.clients.form.cancel}
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete} disabled={saving}>
                            {saving ? PAGE_TEXT.clients.deleteDialog.deleting : PAGE_TEXT.clients.deleteDialog.confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
