import { StickyNote, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { COMMON, PAGE_TEXT } from '~/constants/menuData';
import { useAuthUser, useCan } from '~/hooks/use-auth';
import { useInvestigation } from '~/hooks/use-investigation';
import { useInvestigationNotes, useNotesStore } from '~/hooks/use-notes-store';
import { cn } from '~/lib/utils';

const TEXT = PAGE_TEXT.workspace.notes;

interface NoteFormValues {
    body: string;
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Notes() {
    const matter = useInvestigation();
    const notes = useInvestigationNotes(matter.id);
    const user = useAuthUser();
    const canCreate = useCan('notes.create');
    const canDelete = useCan('notes.delete');
    const { register, handleSubmit, reset, watch } = useForm<NoteFormValues>({ defaultValues: { body: '' } });
    const body = watch('body');

    useEffect(() => {
        void useNotesStore.getState().load(matter.id);
    }, [matter.id]);

    const onSubmit = handleSubmit(async (values) => {
        const trimmed = values.body.trim();
        if (!trimmed) {
            return;
        }
        try {
            await useNotesStore.getState().addNote(matter.id, trimmed);
            reset({ body: '' });
        } catch {
            toast.error(COMMON.saveFailed);
        }
    });

    const onDelete = async (noteId: string) => {
        try {
            await useNotesStore.getState().removeNote(matter.id, noteId);
        } catch {
            toast.error(COMMON.saveFailed);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-muted-foreground text-sm">{TEXT.description}</p>

            {canCreate && (
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={onSubmit} className="space-y-3">
                            <label htmlFor="note-body" className="text-sm font-medium">
                                {TEXT.addHeading}
                            </label>
                            <textarea
                                id="note-body"
                                rows={3}
                                placeholder={TEXT.placeholder}
                                {...register('body', { required: true })}
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground text-xs">{user?.name}</span>
                                <Button type="submit" size="sm" disabled={!body?.trim()}>
                                    {TEXT.add}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {notes.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{TEXT.empty}</CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notes.map((note) => (
                        <Card key={note.id}>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <StickyNote className="text-muted-foreground size-4 shrink-0" />
                                    <Badge variant="outline">{note.author}</Badge>
                                    <span className="text-muted-foreground font-mono text-xs">{formatDateTime(note.createdAt)}</span>
                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => void onDelete(note.id)}
                                            aria-label={`${TEXT.delete}: ${note.body.slice(0, 40)}`}
                                            className={cn(
                                                'hover:bg-accent hover:text-destructive ml-auto rounded-md p-1.5 transition-colors',
                                                'text-muted-foreground',
                                            )}
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{note.body}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
