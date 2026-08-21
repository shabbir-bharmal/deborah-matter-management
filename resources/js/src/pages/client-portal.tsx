import { ArrowLeft, CalendarClock, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { getClientPortal } from '~/data/selectors';
import { investigationStatusBadgeClass, investigationStatusLabels } from '~/lib/status';
import type { ClientPortal } from '~/types';

const stages = ['Intake', 'Planning', 'Fieldwork', 'Findings & report', 'Completed'];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Milestones({ stageIndex }: { stageIndex: number }) {
    return (
        <ol className="flex flex-wrap items-start gap-x-2 gap-y-3">
            {stages.map((stage, index) => (
                <li key={stage} className="flex items-center gap-2">
                    <span className="flex flex-col items-center gap-1">
                        <span
                            className={
                                index <= stageIndex ? 'bg-primary size-3 rounded-full' : 'border-muted size-3 rounded-full border-2 bg-transparent'
                            }
                        />
                        <span className={index <= stageIndex ? 'text-xs font-medium' : 'text-muted-foreground text-xs'}>{stage}</span>
                    </span>
                    {index < stages.length - 1 && <span className="bg-border mt-1.5 h-px w-6" aria-hidden />}
                </li>
            ))}
        </ol>
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
                            <Milestones stageIndex={matter.stageIndex} />

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
