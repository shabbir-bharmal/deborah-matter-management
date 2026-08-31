import { Loader2, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import Pagination, { PAGE_SIZES } from '~/components/ui/pagination';
import { Skeleton } from '~/components/ui/skeleton';
import { ADMIN_TEXT, COMMON } from '~/constants/menuData';
import { createPermission, deletePermission, getPermissions, getRoles, updatePermission, updateRolePermissions } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import type { PermissionSummary, RoleMatrix } from '~/types';

const TEXT = ADMIN_TEXT.roles;

/** Groups `module.action` abilities by their module for a readable matrix. */
function groupByModule(permissions: string[]): Record<string, string[]> {
    return permissions.reduce<Record<string, string[]>>((groups, permission) => {
        const [module] = permission.split('.');
        groups[module] = [...(groups[module] ?? []), permission];
        return groups;
    }, {});
}

export default function AdminRoles() {
    const [matrix, setMatrix] = useState<RoleMatrix | null>(null);
    const [permissions, setPermissions] = useState<PermissionSummary[] | null>(null);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
    const [draft, setDraft] = useState<Record<number, Set<string>>>({});
    const [saving, setSaving] = useState<number | null>(null);
    const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<PermissionSummary | null>(null);
    const [deletingPermission, setDeletingPermission] = useState<PermissionSummary | null>(null);
    const [permissionName, setPermissionName] = useState('');
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [permissionSaving, setPermissionSaving] = useState(false);
    const canUpdate = useCan('roles.update');
    const [searchParams, setSearchParams] = useSearchParams();

    const sizeParam = Number(searchParams.get('pageSize'));
    const pageSize: number = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;
    const totalCount = permissions?.length ?? 0;
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

    const pagedPermissions = useMemo(
        () => (permissions ?? []).slice((page - 1) * pageSize, page * pageSize),
        [permissions, page, pageSize],
    );

    useEffect(() => {
        void getRoles().then((rolesResult) => {
            setMatrix(rolesResult);
            setDraft(Object.fromEntries(rolesResult.roles.map((role) => [role.id, new Set(role.permissions)])));
        });
    }, []);

    useEffect(() => {
        if (activeTab === 'permissions' && permissions === null && !permissionsLoading) {
            setPermissionsLoading(true);
            void getPermissions()
                .then(setPermissions)
                .catch(() => setPermissions([]))
                .finally(() => setPermissionsLoading(false));
        }
    }, [activeTab, permissions, permissionsLoading]);

    const handlePermissionsTabClick = () => {
        setActiveTab('permissions');
    };

    if (!matrix) {
        return <Skeleton className="h-64 rounded-xl" />;
    }

    const modules = groupByModule(matrix.permissions);

    const toggle = (roleId: number, permission: string) => {
        setDraft((current) => {
            const next = new Set(current[roleId] ?? []);
            if (next.has(permission)) {
                next.delete(permission);
            } else {
                next.add(permission);
            }
            return { ...current, [roleId]: next };
        });
    };

    const toggleModule = (roleId: number, permissions: string[]) => {
        setDraft((current) => {
            const next = new Set(current[roleId] ?? []);
            const allOn = permissions.every((permission) => next.has(permission));
            permissions.forEach((permission) => (allOn ? next.delete(permission) : next.add(permission)));
            return { ...current, [roleId]: next };
        });
    };

    const save = async (roleId: number) => {
        setSaving(roleId);
        try {
            await updateRolePermissions(roleId, [...(draft[roleId] ?? [])]);
            toast.success(TEXT.saved);
        } catch {
            toast.error(COMMON.saveFailed);
        } finally {
            setSaving(null);
        }
    };

    const refreshPermissions = () => {
        void getPermissions().then(setPermissions).catch(() => setPermissions([]));
    };

    const openCreatePermission = () => {
        setEditingPermission(null);
        setPermissionName('');
        setPermissionError(null);
        setPermissionDialogOpen(true);
    };

    const openEditPermission = (permission: PermissionSummary) => {
        setEditingPermission(permission);
        setPermissionName(permission.name);
        setPermissionError(null);
        setPermissionDialogOpen(true);
    };

    const savePermission = async () => {
        if (!permissionName.trim()) {
            setPermissionError(TEXT.permissions.form.nameRequired);
            return;
        }

        setPermissionSaving(true);
        setPermissionError(null);
        try {
            const saved = editingPermission
                ? await updatePermission(editingPermission.id, permissionName.trim())
                : await createPermission(permissionName.trim());
            setPermissionDialogOpen(false);
            refreshPermissions();
            toast.success(editingPermission ? TEXT.permissions.form.updated : TEXT.permissions.form.created, { description: saved.name });
        } catch {
            setPermissionError(editingPermission ? TEXT.permissions.form.updateError : TEXT.permissions.form.createError);
        } finally {
            setPermissionSaving(false);
        }
    };

    const confirmDeletePermission = async () => {
        if (!deletingPermission) {
            return;
        }

        setPermissionSaving(true);
        setPermissionError(null);
        try {
            await deletePermission(deletingPermission.id);
            setDeletingPermission(null);
            refreshPermissions();
            toast.success(TEXT.permissions.deleteDialog.deleted, { description: deletingPermission.name });
        } catch {
            setPermissionError(TEXT.permissions.deleteDialog.deleteError);
        } finally {
            setPermissionSaving(false);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-sm">{TEXT.description}</p>

            <div className="inline-flex rounded-lg border bg-muted/40 p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('roles')}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === 'roles' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Roles
                </button>
                <button
                    type="button"
                    onClick={handlePermissionsTabClick}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === 'permissions' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    System permissions
                </button>
            </div>

            {activeTab === 'roles' && (
                <>
                    {matrix.roles.map((role) => (
                        <Card key={role.id}>
                            <CardHeader className="flex flex-row flex-wrap items-center gap-3">
                                <ShieldCheck className="text-primary size-5" />
                                <CardTitle className="text-base capitalize">{role.name}</CardTitle>
                                <Badge variant="outline">
                                    {role.userCount} {TEXT.userCount}
                                </Badge>
                                {canUpdate && (
                                    <Button size="sm" className="ml-auto" onClick={() => void save(role.id)} disabled={saving === role.id}>
                                        {saving === role.id && <Loader2 className="size-4 animate-spin" />}
                                        {TEXT.save}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {Object.entries(modules).map(([module, permissions]) => (
                                    <div key={module} className="rounded-lg border p-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold tracking-wide uppercase">{module}</p>
                                            {canUpdate && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModule(role.id, permissions)}
                                                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                                                >
                                                    {TEXT.allInModule}
                                                </button>
                                            )}
                                        </div>
                                        <ul className="space-y-1.5">
                                            {permissions.map((permission) => {
                                                const id = `role-${role.id}-${permission}`;
                                                return (
                                                    <li key={permission} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={id}
                                                            disabled={!canUpdate}
                                                            checked={draft[role.id]?.has(permission) ?? false}
                                                            onCheckedChange={() => toggle(role.id, permission)}
                                                        />
                                                        <label htmlFor={id} className="cursor-pointer text-sm">
                                                            {permission.split('.')[1]}
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}

            {activeTab === 'permissions' && (
                <>
                    {(permissions === null || permissionsLoading) && <Skeleton className="h-64 rounded-xl" />}
                    {permissions !== null && !permissionsLoading && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">{TEXT.permissions.title}</CardTitle>
                                    <p className="text-muted-foreground text-sm">{TEXT.permissions.description}</p>
                                </div>
                                {canUpdate && (
                                    <Button type="button" size="sm" onClick={openCreatePermission}>
                                        + {TEXT.permissions.add}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {pagedPermissions.length === 0 && permissions.length === 0 && (
                                    <p className="text-muted-foreground text-sm">{TEXT.permissions.empty}</p>
                                )}
                                {pagedPermissions.map((permission) => (
                            <div key={permission.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                                <Badge variant="outline">{permission.module}</Badge>
                                <span className="font-medium">{permission.action}</span>
                                <span className="text-muted-foreground text-sm">{permission.name}</span>
                                <span className="text-muted-foreground text-xs">
                                    {permission.roles.length} {TEXT.userCount}
                                </span>
                                {canUpdate && (
                                    <div className="ml-auto flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditPermission(permission)}
                                            aria-label={`Edit ${permission.name}`}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletingPermission(permission)}
                                            aria-label={`Delete ${permission.name}`}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                        </Card>
                    )}
                    {permissions !== null && !permissionsLoading && totalCount > 0 && (
                        <Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} onPageSizeChange={setPageSize} />
                    )}
                    </>
            )}

            <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPermission ? TEXT.permissions.form.editTitle : TEXT.permissions.form.createTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="permission-name">{TEXT.permissions.form.labels.name}</Label>
                        <Input
                            id="permission-name"
                            value={permissionName}
                            onChange={(event) => setPermissionName(event.target.value)}
                            placeholder={TEXT.permissions.form.placeholders.name}
                            autoFocus
                        />
                        {permissionError && <p className="text-destructive text-sm">{permissionError}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPermissionDialogOpen(false)} disabled={permissionSaving}>
                            {TEXT.permissions.form.cancel}
                        </Button>
                        <Button type="button" onClick={savePermission} disabled={permissionSaving}>
                            {permissionSaving ? TEXT.permissions.form.saving : TEXT.permissions.form.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingPermission} onOpenChange={(open) => !open && setDeletingPermission(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{TEXT.permissions.deleteDialog.title}</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">{TEXT.permissions.deleteDialog.description}</p>
                    {permissionError && <p className="text-destructive text-sm">{permissionError}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeletingPermission(null)} disabled={permissionSaving}>
                            {TEXT.permissions.form.cancel}
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmDeletePermission} disabled={permissionSaving}>
                            {permissionSaving ? TEXT.permissions.deleteDialog.deleting : TEXT.permissions.deleteDialog.confirm}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
