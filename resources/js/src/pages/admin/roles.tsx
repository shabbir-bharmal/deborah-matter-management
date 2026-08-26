import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Skeleton } from '~/components/ui/skeleton';
import { ADMIN_TEXT, COMMON } from '~/constants/menuData';
import { getRoles, updateRolePermissions } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import type { RoleMatrix } from '~/types';

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
    const [draft, setDraft] = useState<Record<number, Set<string>>>({});
    const [saving, setSaving] = useState<number | null>(null);
    const canUpdate = useCan('roles.update');

    useEffect(() => {
        void getRoles().then((result) => {
            setMatrix(result);
            setDraft(Object.fromEntries(result.roles.map((role) => [role.id, new Set(role.permissions)])));
        });
    }, []);

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

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-sm">{TEXT.description}</p>

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
        </div>
    );
}
