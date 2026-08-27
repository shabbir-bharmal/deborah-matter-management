import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteWitness } from '~/data/selectors';
import type { Witness } from '~/types';

const TEXT = PAGE_TEXT.workspace.witnesses.deleteDialog;

interface WitnessDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    witness?: Witness | null;
    onDeleted: (witness: Witness) => void;
}

export default function WitnessDeleteDialog({ open, onOpenChange, matterId, witness, onDeleted }: WitnessDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!witness) {
            return;
        }
        setDeleting(true);
        try {
            await deleteWitness(matterId, witness.id);
            onDeleted(witness);
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
