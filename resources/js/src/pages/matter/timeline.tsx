import { FilePlus2, Flag, FolderOpen, Mail, Mic, SearchCheck, Users } from 'lucide-react';
import { useState } from 'react';

import { useEffect } from 'react';
import TabSkeleton from '~/components/matter/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getTimelineEventsByMatter } from '~/data/selectors';
import { useInvestigation } from '~/hooks/use-investigation';
import type { TimelineEvent, TimelineEventType } from '~/types';

const typeIcons: Record<TimelineEventType, typeof Flag> = {
    intake: FilePlus2,
    meeting: Users,
    interview: Mic,
    evidence: FolderOpen,
    review: SearchCheck,
    milestone: Flag,
    correspondence: Mail,
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventDialog({ event }: { event: TimelineEvent }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="hover:bg-accent/50 w-full rounded-lg text-left transition-colors">
                    <EventBody event={event} />
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                    <DialogDescription>
                        {formatDate(event.date)} · {event.type.replace('_', ' ')}
                    </DialogDescription>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">{event.description}</p>
                {event.relatedEntity && (
                    <div className="bg-muted/40 rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs tracking-wide uppercase">Related {event.relatedEntity.type}</p>
                        <p className="mt-1 text-sm font-medium">{event.relatedEntity.label}</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function EventBody({ event }: { event: TimelineEvent }) {
    const Icon = typeIcons[event.type];
    return (
        <div className="flex gap-3 p-3">
            <span className="bg-card mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border">
                <Icon className="text-muted-foreground size-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3">
                    <p className="font-medium">{event.title}</p>
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                        {formatDate(event.date)}
                    </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">{event.description}</p>
                {event.relatedEntity && (
                    <p className="text-muted-foreground mt-1.5 truncate text-xs">
                        Related {event.relatedEntity.type}: {event.relatedEntity.label}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function Timeline() {
    const matter = useInvestigation();
    const [events, setEvents] = useState<TimelineEvent[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        getTimelineEventsByMatter(matter.id).then((result) => {
            if (!cancelled) {
                setEvents(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{PAGE_TEXT.workspace.timeline.title}</CardTitle>
                <CardDescription>{PAGE_TEXT.workspace.timeline.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {!events && <TabSkeleton />}
                {events && events.length === 0 && <p className="text-muted-foreground text-sm">{PAGE_TEXT.workspace.timeline.empty}</p>}
                {events && events.length > 0 && (
                    <ol className="relative space-y-1 border-l pl-4">
                        {events.map((event) => (
                            <li key={event.id} className="relative">
                                <span className="border-background bg-primary absolute top-6 -left-[21px] size-2 rounded-full border-2" />
                                <EventDialog event={event} />
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>
        </Card>
    );
}
