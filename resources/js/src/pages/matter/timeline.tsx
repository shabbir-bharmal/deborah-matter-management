import { FilePlus2, Flag, FolderOpen, Mail, Mic, Pencil, Plus, SearchCheck, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import TabSkeleton from '~/components/matter/tab-skeleton';
import TimelineDeleteDialog from '~/components/matter/timeline-delete-dialog';
import TimelineFormDialog from '~/components/matter/timeline-form-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getTimelineEventsByMatter } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
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

const typeStyles: Record<TimelineEventType, { icon: string; badge: string; accent: string; dot: string; rail: string }> = {
    intake: {
        icon: 'text-sky-600 dark:text-sky-400',
        badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
        accent: 'from-sky-500/20 to-sky-500/5 ring-sky-500/10',
        dot: 'bg-sky-500',
        rail: 'bg-sky-500',
    },
    meeting: {
        icon: 'text-violet-600 dark:text-violet-400',
        badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
        accent: 'from-violet-500/20 to-violet-500/5 ring-violet-500/10',
        dot: 'bg-violet-500',
        rail: 'bg-violet-500',
    },
    interview: {
        icon: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        accent: 'from-emerald-500/20 to-emerald-500/5 ring-emerald-500/10',
        dot: 'bg-emerald-500',
        rail: 'bg-emerald-500',
    },
    evidence: {
        icon: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        accent: 'from-amber-500/20 to-amber-500/5 ring-amber-500/10',
        dot: 'bg-amber-500',
        rail: 'bg-amber-500',
    },
    review: {
        icon: 'text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        accent: 'from-rose-500/20 to-rose-500/5 ring-rose-500/10',
        dot: 'bg-rose-500',
        rail: 'bg-rose-500',
    },
    milestone: {
        icon: 'text-indigo-600 dark:text-indigo-400',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
        accent: 'from-indigo-500/20 to-indigo-500/5 ring-indigo-500/10',
        dot: 'bg-indigo-500',
        rail: 'bg-indigo-500',
    },
    correspondence: {
        icon: 'text-cyan-600 dark:text-cyan-400',
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
        accent: 'from-cyan-500/20 to-cyan-500/5 ring-cyan-500/10',
        dot: 'bg-cyan-500',
        rail: 'bg-cyan-500',
    },
};

function formatTimelineType(type: TimelineEventType): string {
    return type.replace('_', ' ');
}

function formatDateTime(iso: string): { date: string; time?: string } {
    const value = new Date(iso);
    const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(value);
    const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00') && !iso.endsWith('T00:00:00Z');

    if (!hasTime) {
        return { date };
    }

    const time = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(value);
    return { date, time };
}

function EventDialog({ event }: { event: TimelineEvent }) {
    const { date, time } = formatDateTime(event.date);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="group/event w-full rounded-2xl border border-border/70 bg-background text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                >
                    <EventBody event={event} />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{event.title}</DialogTitle>
                    <DialogDescription>
                        {date}
                        {time ? ` · ${time}` : ''}
                        {' · '}
                        {formatTimelineType(event.type)}
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
    const { date, time } = formatDateTime(event.date);
    return (
        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:gap-5 sm:p-5">
            <div className="min-w-0">
                <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold leading-5 sm:text-base">{event.title}</p>
                            <Badge
                                variant="secondary"
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${typeStyles[event.type].badge}`}
                            >
                                {formatTimelineType(event.type)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-6">{event.description}</p>
                        {event.relatedEntity && (
                            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-medium">Related</span>
                                <span>{event.relatedEntity.type}</span>
                                <span className="text-muted-foreground/70">·</span>
                                <span className="truncate">{event.relatedEntity.label}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-start gap-1 pt-1 text-right">
                <span className="text-sm font-medium leading-5 text-muted-foreground">{date}</span>
                {time && <span className="text-xs font-medium tracking-wide text-muted-foreground/80">{time}</span>}
            </div>
        </div>
    );
}

/**
 * The rail is its own flex column (fixed width, stretched to the full
 * height of the <li> via the default flex `align-items: stretch`).
 * Because it's a sibling of the card rather than something absolutely
 * positioned *inside* the same box as the card, the icon and the
 * connecting line can never overlap the card's content — they simply
 * sit in the column to its left, exactly like the mockup.
 */
function TimelineRail({ event, isFirst, isLast }: { event: TimelineEvent; isFirst: boolean; isLast: boolean }) {
    const styles = typeStyles[event.type];
    const Icon = typeIcons[event.type];
    return (
        <div className="relative flex w-10 shrink-0 items-center justify-center">
            {!isFirst && <span className="bg-border/70 absolute top-0 bottom-1/2 left-1/2 w-px -translate-x-1/2" />}
            {!isLast && <span className="bg-border/70 absolute top-1/2 bottom-0 left-1/2 w-px -translate-x-1/2" />}
            <span className="border-background relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background shadow-sm">
                <span className={`flex size-8 items-center justify-center rounded-full ${styles.rail}`}>
                    <Icon className="size-4 text-white" />
                </span>
            </span>
        </div>
    );
}

export default function Timeline() {
    const matter = useInvestigation();
    const [events, setEvents] = useState<TimelineEvent[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<TimelineEvent | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<TimelineEvent | null>(null);

    const canCreate = useCan('timeline.create');
    const canUpdate = useCan('timeline.update');
    const canDelete = useCan('timeline.delete');
    const orderedEvents = useMemo(
        () =>
            (events ?? [])
                .slice()
                .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
        [events],
    );

    const reload = () => {
        void getTimelineEventsByMatter(matter.id).then(setEvents).catch(() => setEvents([]));
    };

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

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (event: TimelineEvent) => {
        setEditing(event);
        setFormOpen(true);
    };

    const openDelete = (event: TimelineEvent) => {
        setDeleting(event);
        setDeleteOpen(true);
    };

    const handleSaved = () => {
        setFormOpen(false);
        reload();
        toast.success(editing ? PAGE_TEXT.workspace.timeline.form.updated : PAGE_TEXT.workspace.timeline.form.created);
    };

    const handleDeleted = () => {
        setDeleteOpen(false);
        reload();
        toast.success(PAGE_TEXT.workspace.timeline.deleteDialog.deleted);
    };

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="relative flex-row items-start justify-between space-y-0 overflow-hidden border-b bg-gradient-to-r from-muted/40 via-background to-background">
                {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/70 to-transparent" /> */}
                <div className="space-y-1.5">
                    <CardTitle className="text-base">{PAGE_TEXT.workspace.timeline.title}</CardTitle>
                    <CardDescription>{PAGE_TEXT.workspace.timeline.description}</CardDescription>
                </div>
                {canCreate && (
                    <Button type="button" size="sm" onClick={openCreate} className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8">
                        <Plus />
                        {PAGE_TEXT.workspace.timeline.add}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="bg-gradient-to-b from-background to-muted/20 mt-5">
                {!events && <TabSkeleton />}
                {events && events.length === 0 && <p className="text-muted-foreground text-sm">{PAGE_TEXT.workspace.timeline.empty}</p>}
                {events && events.length > 0 && (
                    <ol className="space-y-4">
                        {orderedEvents.map((event, index) => (
                            <li key={event.id} className="flex items-stretch gap-3">
                                <TimelineRail event={event} isFirst={index === 0} isLast={index === orderedEvents.length - 1} />
                                <div className="group relative min-w-0 flex-1">
                                    <EventDialog event={event} />
                                    {(canUpdate || canDelete) && (
                                        <div className="mt-2 flex items-center justify-end gap-1 px-1 py-1 md:hidden">
                                            {canUpdate && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEdit(event)}
                                                    aria-label={`${PAGE_TEXT.workspace.timeline.actions.edit}: ${event.title}`}
                                                    className="h-8 px-3"
                                                >
                                                    <Pencil />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDelete(event)}
                                                    aria-label={`${PAGE_TEXT.workspace.timeline.actions.delete}: ${event.title}`}
                                                    className="h-8 px-3 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {(canUpdate || canDelete) && (
                                        <div className="absolute right-3 bottom-3 hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1.5 opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:opacity-100 md:flex">
                                            {canUpdate && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(event)}
                                                    aria-label={`${PAGE_TEXT.workspace.timeline.actions.edit}: ${event.title}`}
                                                >
                                                    <Pencil />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDelete(event)}
                                                    aria-label={`${PAGE_TEXT.workspace.timeline.actions.delete}: ${event.title}`}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </CardContent>

            <TimelineFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                matterId={matter.id}
                event={editing}
                onSaved={handleSaved}
            />

            <TimelineDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                matterId={matter.id}
                event={deleting}
                onDeleted={handleDeleted}
            />
        </Card>
    );
}
