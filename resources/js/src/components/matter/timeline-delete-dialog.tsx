import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteTimelineEvent } from '~/data/selectors';
import type { TimelineEvent } from '~/types';

const TEXT = PAGE_TEXT.workspace.timeline.deleteDialog;

interface TimelineDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    event?: TimelineEvent | null;
    onDeleted: (event: TimelineEvent) => void;
}

export default function TimelineDeleteDialog({ open, onOpenChange, matterId, event, onDeleted }: TimelineDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!event) {
            return;
        }
        setDeleting(true);
        try {
            await deleteTimelineEvent(matterId, event.id);
            onDeleted(event);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onOpenChange(false);
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{TEXT.title}</DialogTitle>
                    <DialogDescription>{TEXT.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
                        {TEXT.cancel}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? TEXT.deleting : TEXT.confirm}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
