import { AlertTriangle, Briefcase, Flame, Plus, Search, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { toast } from 'sonner';

import MatterFormDialog from '~/components/matter-form-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import Pagination, { PAGE_SIZES } from '~/components/ui/pagination';
import { Skeleton } from '~/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { PAGE_TEXT } from '~/constants/menuData';
import { getMatters } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import { matterStatusBadgeClass, matterStatusLabels, matterTypeLabels, priorityBadgeClass, priorityLabels } from '~/lib/status';
import type { Investigation } from '~/types';

type StatusFilter = 'all' | 'active' | 'completed';

const ACTIVE_STATUSES: Investigation['status'][] = ['open', 'in_progress', 'review'];
const COMPLETED_STATUSES: Investigation['status'][] = ['completed', 'closed'];

const TEXT = PAGE_TEXT.matters;

const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: TEXT.filters.all },
    { value: 'active', label: TEXT.filters.active },
    { value: 'completed', label: TEXT.filters.completed },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Compact metric tile above the matter table. */
function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Briefcase; label: string; value: number; tone: string }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${tone}`}>
                    <Icon className="size-4.5" />
                </span>
                <span className="min-w-0">
                    <span className="block text-xl leading-tight font-semibold">{value}</span>
                    <span className="text-muted-foreground block truncate text-xs">{label}</span>
                </span>
            </CardContent>
        </Card>
    );
}

export default function Matters() {
    const [matters, setMatters] = useState<Investigation[] | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const canCreate = useCan('investigations.create');

    const [formOpen, setFormOpen] = useState(false);

    const updateParams = (patch: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams);
        for (const [key, value] of Object.entries(patch)) {
            if (!value) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        setSearchParams(params);
    };

    const filterParam = searchParams.get('filter');
    const filter: StatusFilter = filterParam === 'active' || filterParam === 'completed' ? filterParam : 'all';
    // Filter changes reset back to the first page.
    const setFilter = (value: StatusFilter) => {
        updateParams({ filter: value === 'all' ? undefined : value, page: undefined });
    };

    const query = searchParams.get('q') ?? '';
    const setQuery = (value: string) => {
        // Search changes also reset pagination.
        updateParams({ q: value || undefined, page: undefined });
    };

    useEffect(() => {
        let cancelled = false;
        getMatters().then((result) => {
            if (!cancelled) {
                setMatters(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const reload = () => {
        getMatters().then(setMatters).catch(() => undefined);
    };

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

    const today = new Date().toISOString().slice(0, 10);
    const stats = {
        total: visible.length,
        active: visible.filter((matter) => ACTIVE_STATUSES.includes(matter.status)).length,
        overdue: visible.filter((matter) => ACTIVE_STATUSES.includes(matter.status) && matter.targetCompletionDate < today).length,
        critical: visible.filter((matter) => matter.priority === 'critical').length,
    };

    const sizeParam = Number(searchParams.get('pageSize'));
    const pageSize: number = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    const requestedPage = Number(searchParams.get('page')) || 1;
    const page = Math.min(Math.max(1, requestedPage), totalPages);

    const setPage = (value: number) => {
        updateParams({ page: value > 1 ? String(value) : undefined });
    };
    const setPageSize = (size: number) => {
        updateParams({ pageSize: size !== 10 ? String(size) : undefined, page: undefined });
    };

    const pagedItems = visible.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{TEXT.title}</h1>
                    <p className="text-muted-foreground text-sm">{TEXT.subtitle}</p>
                </div>
                {canCreate && (
                    <Button
                        onClick={() => setFormOpen(true)}
                        data-testid="new-matter-button"
                        className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8"
                    >
                        <Plus className="mr-2 size-4" />
                        {TEXT.actions.create}
                    </Button>
                )}
            </div>

            <MatterFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                onSaved={(matter) => {
                    setFormOpen(false);
                    toast.success(TEXT.form.created, { description: matter.referenceNumber });
                    reload();
                    navigate(`/matters/${matter.id}`);
                }}
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi icon={Briefcase} label={TEXT.stats.total} value={stats.total} tone="bg-primary/10 text-primary" />
                <Kpi icon={Timer} label={TEXT.stats.active} value={stats.active} tone="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
                <Kpi
                    icon={AlertTriangle}
                    label={TEXT.stats.overdue}
                    value={stats.overdue}
                    tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
                <Kpi icon={Flame} label={TEXT.stats.critical} value={stats.critical} tone="bg-red-500/10 text-red-600 dark:text-red-400" />
            </div>

            {/* Filter bar — search on the left, status segments on the right. */}
            <Card>
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={TEXT.searchPlaceholder}
                            className="w-full pl-9"
                        />
                    </div>
                    <div className="flex w-full gap-1 rounded-lg border p-1 sm:w-fit">
                        {filters.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setFilter(item.value)}
                                className={
                                    filter === item.value
                                        ? 'bg-primary text-primary-foreground flex-1 rounded-md px-3 py-1.5 text-sm font-medium sm:flex-none'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground flex-1 rounded-md px-3 py-1.5 text-sm font-medium sm:flex-none'
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {!matters && (
                <div className="space-y-2" aria-busy="true" aria-label="Loading matters">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 rounded-lg" />
                    ))}
                </div>
            )}

            {matters && visible.length === 0 && (
                <div className="bg-card text-muted-foreground rounded-xl border p-8 text-center text-sm">{TEXT.empty}</div>
            )}

            {matters && visible.length > 0 && (
                <Card className="overflow-hidden p-0">
                    <Table data-testid="matter-list">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{TEXT.columns.reference}</TableHead>
                                <TableHead>{TEXT.columns.matter}</TableHead>
                                <TableHead className="hidden md:table-cell">{TEXT.columns.client}</TableHead>
                                <TableHead className="hidden lg:table-cell">{TEXT.columns.type}</TableHead>
                                <TableHead>{TEXT.columns.status}</TableHead>
                                <TableHead>{TEXT.columns.priority}</TableHead>
                                <TableHead className="hidden xl:table-cell">{TEXT.columns.investigator}</TableHead>
                                <TableHead className="hidden lg:table-cell">{TEXT.columns.target}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedItems.map((matter) => (
                                <TableRow
                                    key={matter.id}
                                    data-testid="matter-row"
                                    onClick={() => navigate(`/matters/${matter.id}`)}
                                    className="cursor-pointer"
                                >
                                    <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                                        {matter.referenceNumber}
                                    </TableCell>
                                    <TableCell className="max-w-72 font-medium">
                                        <Link
                                            to={`/matters/${matter.id}`}
                                            onClick={(event) => event.stopPropagation()}
                                            className="underline-offset-2 hover:underline"
                                        >
                                            {matter.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground hidden text-sm md:table-cell">{matter.client}</TableCell>
                                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                                        {matterTypeLabels[matter.type]}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={matterStatusBadgeClass[matter.status]}>
                                            {matterStatusLabels[matter.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={priorityBadgeClass[matter.priority]}>
                                            {priorityLabels[matter.priority]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap xl:table-cell">
                                        {matter.investigator}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap lg:table-cell">
                                        {formatDate(matter.targetCompletionDate)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {matters && visible.length > 0 && (
                <Pagination page={page} pageSize={pageSize} totalCount={visible.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
        </div>
    );
}
