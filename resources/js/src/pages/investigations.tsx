import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Skeleton } from '~/components/ui/skeleton';
import { PAGE_TEXT } from '~/constants/menuData';
import { getInvestigations } from '~/data/selectors';
import { investigationStatusBadgeClass, investigationStatusLabels, investigationTypeLabels, priorityBadgeClass, priorityLabels } from '~/lib/status';
import type { Investigation } from '~/types';

type StatusFilter = 'all' | 'active' | 'completed';

const ACTIVE_STATUSES: Investigation['status'][] = ['open', 'in_progress', 'review'];
const COMPLETED_STATUSES: Investigation['status'][] = ['completed', 'closed'];

const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: PAGE_TEXT.investigations.filters.all },
    { value: 'active', label: PAGE_TEXT.investigations.filters.active },
    { value: 'completed', label: PAGE_TEXT.investigations.filters.completed },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Investigations() {
    const [matters, setMatters] = useState<Investigation[] | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        let cancelled = false;
        getInvestigations().then((result) => {
            if (!cancelled) {
                setMatters(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const visible = useMemo(() => {
        if (!matters) {
            return [];
        }
        return matters.filter((matter) => {
            if (filter === 'active' && !ACTIVE_STATUSES.includes(matter.status)) {
                return false;
            }
            if (filter === 'completed' && !COMPLETED_STATUSES.includes(matter.status)) {
                return false;
            }
            const haystack = `${matter.referenceNumber} ${matter.title} ${matter.client} ${matter.investigator}`.toLowerCase();
            return haystack.includes(query.trim().toLowerCase());
        });
    }, [matters, query, filter]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.investigations.title}</h1>
                <p className="text-muted-foreground text-sm">{PAGE_TEXT.investigations.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={PAGE_TEXT.investigations.searchPlaceholder}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-1 rounded-lg border p-1">
                    {filters.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setFilter(item.value)}
                            className={
                                filter === item.value
                                    ? 'bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium'
                            }
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {!matters && (
                <div className="space-y-2" aria-busy="true" aria-label="Loading matters">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-xl" />
                    ))}
                </div>
            )}

            {matters && visible.length === 0 && (
                <div className="bg-card text-muted-foreground rounded-xl border p-8 text-center text-sm">{PAGE_TEXT.investigations.empty}</div>
            )}

            <div className="space-y-2">
                {visible.map((matter) => (
                    <Link
                        key={matter.id}
                        to={`/investigations/${matter.id}`}
                        className="bg-card hover:bg-accent block rounded-xl border p-4 transition-colors"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="text-muted-foreground font-mono text-xs">{matter.referenceNumber}</span>
                            <span className="font-medium">{matter.title}</span>
                            <Badge variant="outline" className={investigationStatusBadgeClass[matter.status]}>
                                {investigationStatusLabels[matter.status]}
                            </Badge>
                            <Badge variant="outline" className={priorityBadgeClass[matter.priority]}>
                                {priorityLabels[matter.priority]}
                            </Badge>
                        </div>
                        <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                            <span>{matter.client}</span>
                            <span>{investigationTypeLabels[matter.type]}</span>
                            <span>
                                {PAGE_TEXT.investigations.rowLabels.investigator} {matter.investigator}
                            </span>
                            <span>
                                {PAGE_TEXT.investigations.rowLabels.opened} {formatDate(matter.openedAt)}
                            </span>
                            <span>
                                {PAGE_TEXT.investigations.rowLabels.target} {formatDate(matter.targetCompletionDate)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
