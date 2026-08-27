import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { deleteEvidence } from '~/data/selectors';
import type { Evidence } from '~/types';

const TEXT = PAGE_TEXT.workspace.evidence.deleteDialog;

interface EvidenceDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    matterId: string;
    evidence?: Evidence | null;
    onDeleted: (evidence: Evidence) => void;
}

export default function EvidenceDeleteDialog({ open, onOpenChange, matterId, evidence, onDeleted }: EvidenceDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!evidence) {
            return;
        }
        setDeleting(true);
        setError(null);
        try {
            await deleteEvidence(matterId, evidence.id);
            onDeleted(evidence);
        } catch {
            setError(TEXT.deleteError);
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
                {error && <p className="text-destructive text-sm">{error}</p>}
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
