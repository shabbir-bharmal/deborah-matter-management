import { FilePlus2, Flag, FolderOpen, Mail, Mic, Pencil, Plus, SearchCheck, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<TimelineEvent | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<TimelineEvent | null>(null);

    const canCreate = useCan('timeline.create');
    const canUpdate = useCan('timeline.update');
    const canDelete = useCan('timeline.delete');

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
        <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
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
            <CardContent>
                {!events && <TabSkeleton />}
                {events && events.length === 0 && <p className="text-muted-foreground text-sm">{PAGE_TEXT.workspace.timeline.empty}</p>}
                {events && events.length > 0 && (
                    <ol className="relative space-y-3 border-l pl-4">
                        {events.map((event) => (
                            <li key={event.id} className="relative">
                                <span className="border-background bg-primary absolute top-6 -left-[21px] size-2 rounded-full border-2" />
                                <div className="group relative rounded-lg border transition-colors hover:bg-accent/50">
                                    <EventDialog event={event} />
                                    {(canUpdate || canDelete) && (
                                        <div className="mt-1 flex items-center justify-end gap-1 border-t px-3 py-2 md:hidden">
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
                                        <div className="absolute right-2 bottom-2 hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 md:flex">
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
