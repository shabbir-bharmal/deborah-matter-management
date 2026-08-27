import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteMatter } from '~/data/selectors';
import type { Investigation } from '~/types';

const TEXT = PAGE_TEXT.matters.deleteDialog;

interface MatterDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matter?: Investigation | null;
    onDeleted: (matter: Investigation) => void;
}

export default function MatterDeleteDialog({ open, onOpenChange, matter, onDeleted }: MatterDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!matter) {
            return;
        }
        setDeleting(true);
        try {
            await deleteMatter(matter.id);
            onDeleted(matter);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
