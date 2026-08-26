import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';

import AiAssistant from '~/components/matter/ai-assistant';
import { Badge } from '~/components/ui/badge';
import { WORKSPACE_TAB_PERMISSIONS, WORKSPACE_TABS } from '~/constants/menuData';
import { getMatter } from '~/data/selectors';
import { useAuthStore } from '~/hooks/use-auth';
import { matterStatusBadgeClass, matterStatusLabels, priorityBadgeClass, priorityLabels } from '~/lib/status';
import type { Investigation } from '~/types';

export default function MatterWorkspace() {
    const { id } = useParams<{ id: string }>();
    const [matter, setMatter] = useState<Investigation | null | undefined>(undefined);
    const permissions = useAuthStore((state) => state.user?.permissions ?? []);
    const tabs = WORKSPACE_TABS.filter((tab) => permissions.includes(WORKSPACE_TAB_PERMISSIONS[tab.id] ?? ''));

    useEffect(() => {
        let cancelled = false;
        getMatter(id ?? '').then((result) => {
            if (!cancelled) {
                setMatter(result ?? null);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (matter === undefined) {
        return <p className="text-muted-foreground text-sm">Loading matter…</p>;
    }

    if (matter === null) {
        return (
            <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Matter not found.</p>
                <Link to="/matters" className="text-sm font-medium underline">
                    Back to all matters
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-muted-foreground font-mono text-xs">{matter.referenceNumber}</span>
                <h1 className="text-2xl font-semibold tracking-tight">{matter.title}</h1>
                <Badge variant="outline" className={matterStatusBadgeClass[matter.status]}>
                    {matterStatusLabels[matter.status]}
                </Badge>
                <Badge variant="outline" className={priorityBadgeClass[matter.priority]}>
                    {priorityLabels[matter.priority]}
                </Badge>
                <span className="ml-auto">
                    <AiAssistant matter={matter} />
                </span>
            </div>

            <nav className="-mx-1 flex gap-1 overflow-x-auto border-b pb-px">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.id}
                        to={tab.id}
                        className={({ isActive }) =>
                            isActive
                                ? 'bg-card rounded-t-md border border-b-transparent px-3 py-2 text-sm font-medium whitespace-nowrap shadow-xs'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground rounded-t-md px-3 py-2 text-sm font-medium whitespace-nowrap'
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            <Outlet context={matter} />
        </div>
    );
}
