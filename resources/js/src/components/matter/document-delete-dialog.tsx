import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteDocument } from '~/data/selectors';
import type { InvestigationDocument } from '~/types';

const TEXT = PAGE_TEXT.workspace.documents.deleteDialog;

interface DocumentDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    document?: InvestigationDocument | null;
    onDeleted: (document: InvestigationDocument) => void;
}

export default function DocumentDeleteDialog({ open, onOpenChange, matterId, document, onDeleted }: DocumentDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!document) {
            return;
        }
        setDeleting(true);
        try {
            await deleteDocument(matterId, document.id);
            onDeleted(document);
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
