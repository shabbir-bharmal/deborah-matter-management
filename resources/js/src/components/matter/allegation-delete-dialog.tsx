import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteAllegation } from '~/data/selectors';
import type { Allegation } from '~/types';

const TEXT = PAGE_TEXT.workspace.allegations.deleteDialog;

interface AllegationDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    allegation?: Allegation | null;
    onDeleted: (allegation: Allegation) => void;
}

export default function AllegationDeleteDialog({ open, onOpenChange, matterId, allegation, onDeleted }: AllegationDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!allegation) {
            return;
        }
        setDeleting(true);
        try {
            await deleteAllegation(matterId, allegation.id);
            onDeleted(allegation);
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
