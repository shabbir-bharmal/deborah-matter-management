import { CalendarClock, CalendarDays, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { PAGE_TEXT } from '~/constants/menuData';
import { getDashboardSnapshot, getMatters } from '~/data/selectors';
import { interviewStatusBadgeClass, interviewStatusLabels, matterStatusBadgeClass, matterStatusLabels } from '~/lib/status';
import type { DashboardSnapshot, Investigation } from '~/types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Calendar() {
    const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
    const [matters, setMatters] = useState<Investigation[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getDashboardSnapshot(), getMatters()]).then(([snapshotResult, mattersResult]) => {
            if (!cancelled) {
                setSnapshot(snapshotResult);
                setMatters(mattersResult);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!snapshot || !matters) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Loading calendar">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const deadlines = matters
        .filter((matter) => ['open', 'in_progress', 'review'].includes(matter.status))
        .sort((a, b) => a.targetCompletionDate.localeCompare(b.targetCompletionDate));

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.calendar.title}</h1>
                <p className="text-muted-foreground text-sm">{PAGE_TEXT.calendar.subtitle}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarClock className="size-4" /> {PAGE_TEXT.calendar.interviewsCard.title}
                    </CardTitle>
                    <CardDescription>{PAGE_TEXT.calendar.interviewsCard.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {snapshot.upcomingInterviews.length === 0 && (
                        <p className="text-muted-foreground text-sm">{PAGE_TEXT.calendar.interviewsCard.empty}</p>
                    )}
                    {snapshot.upcomingInterviews.map((interview) => (
                        <Link
                            key={interview.id}
                            to={`/matters/${interview.investigationId}/interviews`}
                            className="hover:bg-accent flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 transition-colors"
                        >
                            <span className="w-28 shrink-0 text-sm font-medium tabular-nums">{formatDate(interview.scheduledAt)}</span>
                            <span className="text-sm">{interview.witnessName}</span>
                            <Badge variant="outline" className={interviewStatusBadgeClass[interview.status]}>
                                {interviewStatusLabels[interview.status]}
                            </Badge>
                            <span className="text-muted-foreground ml-auto font-mono text-xs">{interview.investigationReference}</span>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="size-4" /> {PAGE_TEXT.calendar.deadlinesCard.title}
                    </CardTitle>
                    <CardDescription>{PAGE_TEXT.calendar.deadlinesCard.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {deadlines.map((matter) => {
                        const overdue = matter.targetCompletionDate < today;
                        return (
                            <Link
                                key={matter.id}
                                to={`/matters/${matter.id}`}
                                className="hover:bg-accent flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 transition-colors"
                            >
                                <CalendarDays className="text-muted-foreground size-4 shrink-0" />
                                <span className="w-28 shrink-0 text-sm font-medium tabular-nums">{formatDate(matter.targetCompletionDate)}</span>
                                <span className="truncate text-sm">{matter.title}</span>
                                {overdue && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                        {PAGE_TEXT.calendar.deadlinesCard.pastDue}
                                    </Badge>
                                )}
                                <Badge variant="outline" className={`ml-auto ${matterStatusBadgeClass[matter.status]}`}>
                                    {matterStatusLabels[matter.status]}
                                </Badge>
                            </Link>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
