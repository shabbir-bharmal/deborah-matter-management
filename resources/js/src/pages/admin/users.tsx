import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Skeleton } from '~/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { ADMIN_TEXT, COMMON } from '~/constants/menuData';
import { createUser, deleteUser, getClients, getRoles, getUsers, updateUser } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import { ApiError } from '~/lib/api';
import type { AuthUser, ClientSummary } from '~/types';

const TEXT = ADMIN_TEXT.users;

interface UserFormValues {
    name: string;
    email: string;
    password: string;
    role: string;
    clientId: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<AuthUser[] | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [clients, setClients] = useState<ClientSummary[]>([]);
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState<AuthUser | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const canCreate = useCan('users.create');
    const canUpdate = useCan('users.update');
    const canDelete = useCan('users.delete');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>();

    const refresh = () => getUsers().then(setUsers);

    useEffect(() => {
        void refresh();
        void getRoles()
            .then((matrix) => setRoles(matrix.roles.map((role) => role.name)))
            .catch(() => setRoles(['admin', 'investigator', 'client']));
        void getClients().then(setClients);
    }, []);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return (users ?? []).filter((user) => `${user.name} ${user.email} ${user.roles.join(' ')}`.toLowerCase().includes(needle));
    }, [users, query]);

    const openCreate = () => {
        setEditing(null);
        reset({ name: '', email: '', password: '', role: roles[0] ?? 'investigator', clientId: '' });
        setDialogOpen(true);
    };

    const openEdit = (user: AuthUser) => {
        setEditing(user);
        reset({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] ?? 'investigator',
            clientId: user.clientId ? String(user.clientId) : '',
        });
        setDialogOpen(true);
    };

    const onSubmit = handleSubmit(async (values) => {
        const clientId = values.clientId ? Number(values.clientId) : null;

        try {
            if (editing) {
                await updateUser(editing.id, {
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    clientId,
                    ...(values.password ? { password: values.password } : {}),
                });
                toast.success(TEXT.updated);
            } else {
                await createUser({ name: values.name, email: values.email, password: values.password, role: values.role, clientId });
                toast.success(TEXT.created);
            }
            setDialogOpen(false);
            await refresh();
        } catch (error) {
            const message = error instanceof ApiError ? (Object.values(error.errors)[0]?.[0] ?? error.message) : COMMON.saveFailed;
            toast.error(message);
        }
    });

    const onDelete = async (user: AuthUser) => {
        if (!window.confirm(TEXT.deleteConfirm)) {
            return;
        }
        try {
            await deleteUser(user.id);
            toast.success(TEXT.deleted);
            await refresh();
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : COMMON.saveFailed);
        }
    };

    return (
        <div className="space-y-3">
            <Card>
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={TEXT.searchPlaceholder}
                            className="pl-9"
                        />
                    </div>
                    {canCreate && (
                        <Button onClick={openCreate} size="sm">
                            <Plus className="size-4" /> {TEXT.add}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {!users && <Skeleton className="h-40 rounded-xl" />}

            {users && visible.length === 0 && (
                <div className="bg-card text-muted-foreground rounded-xl border p-8 text-center text-sm">{TEXT.empty}</div>
            )}

            {users && visible.length > 0 && (
                <Card className="overflow-hidden p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{TEXT.columns.name}</TableHead>
                                <TableHead>{TEXT.columns.email}</TableHead>
                                <TableHead>{TEXT.columns.role}</TableHead>
                                <TableHead className="hidden md:table-cell">{TEXT.columns.client}</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                    <TableCell>
                                        {user.roles.map((role) => (
                                            <Badge key={role} variant="outline" className="mr-1">
                                                {role}
                                            </Badge>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">{user.clientSlug ?? '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            {canUpdate && (
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => void onDelete(user)}
                                                    aria-label={`Delete ${user.name}`}
                                                    className="hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? TEXT.form.editTitle : TEXT.form.createTitle}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={onSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="user-name">{TEXT.form.name}</Label>
                            <Input id="user-name" {...register('name', { required: true })} />
                            {errors.name && <p className="text-destructive text-xs">Required</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-email">{TEXT.form.email}</Label>
                            <Input id="user-email" type="email" {...register('email', { required: true })} />
                            {errors.email && <p className="text-destructive text-xs">Required</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-password">{TEXT.form.password}</Label>
                            <Input id="user-password" type="password" {...register('password', { required: !editing, minLength: 8 })} />
                            <p className="text-muted-foreground text-xs">{editing ? TEXT.form.passwordHintEdit : 'Minimum 8 characters.'}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-role">{TEXT.form.role}</Label>
                            <select
                                id="user-role"
                                {...register('role', { required: true })}
                                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-client">{TEXT.form.client}</Label>
                            <select
                                id="user-client"
                                {...register('clientId')}
                                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <option value="">{TEXT.form.noClient}</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.clientId ?? ''}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                {TEXT.form.cancel}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {TEXT.form.save}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
