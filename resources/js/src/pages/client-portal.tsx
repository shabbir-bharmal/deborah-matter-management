import { ArrowLeft, CalendarClock, Check, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { getClientPortal } from '~/data/selectors';
import { investigationStatusBadgeClass, investigationStatusLabels } from '~/lib/status';
import { cn } from '~/lib/utils';
import type { ClientPortal } from '~/types';

const stages = PAGE_TEXT.clientPortal.milestones;

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const DOT_SIZE = 16;
const CONNECTOR_GAP = 8;

function Milestones({ stageIndex }: { stageIndex: number }) {
    const connectorInset = `calc(50% + ${DOT_SIZE / 2 + CONNECTOR_GAP}px)`;
    return (
        <div className="-mx-1 overflow-x-auto pb-1">
            <ol aria-label="Matter milestones" className="flex min-w-md items-start px-1">
                {stages.map((stage, index) => {
                    const isComplete = index < stageIndex;
                    const isCurrent = index === stageIndex;
                    return (
                        <li
                            key={stage}
                            aria-current={isCurrent ? 'step' : undefined}
                            className="relative flex flex-1 flex-col items-center gap-1.5 px-1 text-center"
                        >
                            {index < stages.length - 1 && (
                                <span
                                    aria-hidden
                                    style={{ height: 2, left: connectorInset, right: `calc(-50% + ${DOT_SIZE / 2 + CONNECTOR_GAP}px)` }}
                                    className={cn('absolute rounded-full', isComplete ? 'bg-primary' : 'bg-border')}
                                />
                            )}
                            <span
                                style={{ width: DOT_SIZE }}
                                className={cn(
                                    'relative z-10 flex items-center justify-center rounded-full border-2',
                                    isComplete && 'bg-primary border-primary',
                                    isCurrent && 'border-primary bg-background',
                                    !isComplete && !isCurrent && 'bg-muted/40',
                                )}
                            >
                                {isComplete ? (
                                    <Check className="text-primary-foreground size-2.5" />
                                ) : isCurrent ? (
                                    <span className="bg-primary size-1.5 rounded-full" />
                                ) : null}
                            </span>
                            <span
                                className={cn(
                                    'max-w-28 text-xs leading-tight',
                                    isCurrent && 'text-foreground font-semibold',
                                    isComplete && 'text-foreground',
                                    !isComplete && !isCurrent && 'text-muted-foreground',
                                )}
                            >
                                {isCurrent && <span className="sr-only">Current stage: </span>}
                                {stage}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

export default function ClientPortal() {
    const { clientId } = useParams<{ clientId: string }>();
    const [portal, setPortal] = useState<ClientPortal | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        getClientPortal(clientId ?? '').then((result) => {
            if (!cancelled) {
                setPortal(result ?? null);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [clientId]);

    if (portal === undefined) {
        return <p className="text-muted-foreground text-sm">Loading client portal…</p>;
    }

    if (portal === null) {
        return (
            <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Client not found.</p>
                <Link to="/clients" className="text-sm font-medium underline">
                    Back to clients
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Link to="/clients" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
                <ArrowLeft className="size-4" /> All clients
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">{portal.name}</h1>
                <Badge variant="outline">Client portal concept</Badge>
            </div>
            <p className="text-muted-foreground max-w-3xl text-sm">
                What the client would see: matter status, milestones, upcoming steps, and client-visible documents only.
            </p>

            <div className="space-y-4">
                {portal.matters.map((matter) => (
                    <Card key={matter.id}>
                        <CardHeader>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <span className="text-muted-foreground font-mono text-xs">{matter.referenceNumber}</span>
                                <CardTitle className="text-base">{matter.title}</CardTitle>
                                <Badge variant="outline" className={investigationStatusBadgeClass[matter.status]}>
                                    {investigationStatusLabels[matter.status]}
                                </Badge>
                            </div>
                            <CardDescription>
                                Opened {formatDate(matter.openedAt)} · Target {formatDate(matter.targetCompletionDate)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">Milestones</p>
                                <Milestones stageIndex={matter.stageIndex} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Upcoming steps</p>
                                    {matter.upcomingInterviews.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No upcoming steps scheduled.</p>
                                    ) : (
                                        <ul className="space-y-1.5">
                                            {matter.upcomingInterviews.map((interview) => (
                                                <li key={interview.id} className="flex items-center gap-2 text-sm">
                                                    <CalendarClock className="text-muted-foreground size-3.5 shrink-0" />
                                                    Interview — {formatDate(interview.scheduledAt)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Latest update</p>
                                    {matter.latestEvent ? (
                                        <p className="text-muted-foreground text-sm">
                                            {formatDate(matter.latestEvent.date)} — {matter.latestEvent.title}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">—</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                                        Client-visible documents
                                    </p>
                                    {matter.sharedDocuments.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No documents shared yet.</p>
                                    ) : (
                                        <ul className="space-y-1.5">
                                            {matter.sharedDocuments.map((document) => (
                                                <li key={document.id} className="flex items-center gap-2 text-sm">
                                                    <FileText className="text-muted-foreground size-3.5 shrink-0" />
                                                    <span className="truncate">{document.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
