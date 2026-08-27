import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { PAGE_TEXT } from '~/constants/menuData';
import { getDashboardSnapshot } from '~/data/selectors';
import { matterStatusBadgeClass, matterStatusLabels, priorityBadgeClass, priorityLabels } from '~/lib/status';
import type { DashboardSnapshot } from '~/types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
    const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);

    useEffect(() => {
        let cancelled = false;
        getDashboardSnapshot().then((result) => {
            if (!cancelled) {
                setSnapshot(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!snapshot) {
        return (
            <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-72 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-56 rounded-xl" />
                    <Skeleton className="h-56 rounded-xl" />
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: PAGE_TEXT.dashboard.stats.activeMatters,
            value: snapshot.activeMatterCount,
            icon: ClipboardList,
            to: '/matters?filter=active',
        },
        {
            label: PAGE_TEXT.dashboard.stats.completedClosed,
            value: snapshot.completedMatterCount,
            icon: CheckCircle2,
            to: '/matters?filter=completed',
        },
        {
            label: PAGE_TEXT.dashboard.stats.pastTargetDate,
            value: snapshot.overdueMatterCount,
            icon: AlertTriangle,
            to: '/matters?filter=active',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.dashboard.title}</h1>
                    <p className="text-muted-foreground text-sm">{PAGE_TEXT.dashboard.subtitle}</p>
                </div>
                <Link
                    to="/matters"
                    className="hover:bg-accent inline-flex items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium md:text-sm"
                >
                    {PAGE_TEXT.dashboard.quickLinks} <ArrowRight className="size-4" />
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {statCards.map((card) => (
                    <Link key={card.label} to={card.to}>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-4 p-5">
                                <span className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                                    <card.icon className="text-primary size-5" />
                                </span>
                                <span>
                                    <span className="block text-2xl font-semibold">{card.value}</span>
                                    <span className="text-muted-foreground block text-sm">{card.label}</span>
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{PAGE_TEXT.dashboard.cards.byStatus}</CardTitle>
                        <CardDescription>{PAGE_TEXT.dashboard.cards.byStatusDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={snapshot.statusCounts.map((entry) => ({ ...entry, label: matterStatusLabels[entry.status] }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={24} />
                                    <ChartTooltip cursor={{ fill: 'var(--muted)' }} />
                                    <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{PAGE_TEXT.dashboard.cards.byPriority}</CardTitle>
                        <CardDescription>{PAGE_TEXT.dashboard.cards.byPriorityDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {snapshot.priorityCounts.map((entry) => (
                            <div key={entry.priority} className="flex items-center justify-between gap-3">
                                <Badge variant="outline" className={priorityBadgeClass[entry.priority]}>
                                    {priorityLabels[entry.priority]}
                                </Badge>
                                <div className="flex flex-1 items-center gap-3">
                                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{
                                                width: `${snapshot.activeMatterCount ? (entry.count / snapshot.activeMatterCount) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="w-6 text-right text-sm font-medium tabular-nums">{entry.count}</span>
                                </div>
                            </div>
                        ))}
                        <div className="border-t pt-3">
                            <p className="mb-2 text-sm font-medium">{PAGE_TEXT.dashboard.cards.pendingActions}</p>
                            <ul className="space-y-1.5">
                                {snapshot.pendingActions.map((action) => (
                                    <li key={action.id} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{action.label}</span>
                                        <span className="font-medium tabular-nums">{action.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{PAGE_TEXT.dashboard.cards.upcomingInterviews}</CardTitle>
                        <CardDescription>{PAGE_TEXT.dashboard.cards.upcomingInterviewsDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {snapshot.upcomingInterviews.length === 0 && (
                            <p className="text-muted-foreground text-sm">{PAGE_TEXT.dashboard.cards.noUpcomingInterviews}</p>
                        )}
                        {snapshot.upcomingInterviews.map((interview) => (
                            <Link
                                key={interview.id}
                                to={`/matters/${interview.investigationId}/interviews`}
                                className="hover:bg-accent flex items-start gap-3 rounded-lg border p-3 transition-colors"
                            >
                                <CalendarClock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{interview.witnessName}</p>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {interview.investigationReference} · {formatDate(interview.scheduledAt)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{PAGE_TEXT.dashboard.cards.recentActivity}</CardTitle>
                        <CardDescription>{PAGE_TEXT.dashboard.cards.recentActivityDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {snapshot.recentActivity.map(({ event, investigationReference }) => (
                            <Link
                                key={event.id}
                                to={`/matters/${event.investigationId}`}
                                className="hover:bg-accent block rounded-lg border p-3 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-sm font-medium">{event.title}</p>
                                    <span className="text-muted-foreground shrink-0 text-xs">{formatDate(event.date)}</span>
                                </div>
                                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                    {investigationReference} · {event.type.replace('_', ' ')}
                                </p>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{PAGE_TEXT.dashboard.cards.statusSummary}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {snapshot.statusCounts.map((entry) => (
                        <Badge key={entry.status} variant="outline" className={matterStatusBadgeClass[entry.status]}>
                            {matterStatusLabels[entry.status]}: {entry.count}
                        </Badge>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
