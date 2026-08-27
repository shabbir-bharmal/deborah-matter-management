import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import DocumentDeleteDialog from '~/components/matter/document-delete-dialog';
import DocumentFormDialog from '~/components/matter/document-form-dialog';
import TabSkeleton from '~/components/matter/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { getDocumentsByMatter } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import { useInvestigation } from '~/hooks/use-investigation';
import { documentStatusBadgeClass, documentStatusLabels, documentTypeLabels } from '~/lib/status';
import type { InvestigationDocument } from '~/types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Documents() {
    const matter = useInvestigation();
    const [documents, setDocuments] = useState<InvestigationDocument[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<InvestigationDocument | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<InvestigationDocument | null>(null);

    const canCreate = useCan('documents.create');
    const canUpdate = useCan('documents.update');
    const canDelete = useCan('documents.delete');

    const reload = () => {
        void getDocumentsByMatter(matter.id).then(setDocuments).catch(() => setDocuments([]));
    };

    useEffect(() => {
        let cancelled = false;
        getDocumentsByMatter(matter.id).then((result) => {
            if (!cancelled) {
                setDocuments(result);
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

    const openEdit = (document: InvestigationDocument) => {
        setEditing(document);
        setFormOpen(true);
    };

    const openDelete = (document: InvestigationDocument) => {
        setDeleting(document);
        setDeleteOpen(true);
    };

    const handleSaved = () => {
        setFormOpen(false);
        reload();
        toast.success(editing ? PAGE_TEXT.workspace.documents.form.updated : PAGE_TEXT.workspace.documents.form.created);
    };

    const handleDeleted = () => {
        setDeleteOpen(false);
        reload();
        toast.success(PAGE_TEXT.workspace.documents.deleteDialog.deleted);
    };

    return (
        <div className="space-y-3">
            {canCreate && (
                <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={openCreate} className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8">
                        <Plus />
                        {PAGE_TEXT.workspace.documents.add}
                    </Button>
                </div>
            )}
            {!documents && <TabSkeleton />}
            {documents && documents.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.documents.empty}</CardContent>
                </Card>
            )}
            {documents?.map((document) => (
                <Card key={document.id}>
                    <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-2 p-4">
                        <span className="font-medium">{document.name}</span>
                        <Badge variant="outline">{documentTypeLabels[document.type]}</Badge>
                        <Badge variant="outline" className={documentStatusBadgeClass[document.status]}>
                            {documentStatusLabels[document.status]}
                        </Badge>
                        <span className="text-muted-foreground ml-auto text-xs">
                            {PAGE_TEXT.workspace.documents.created} {formatDate(document.createdAt)}
                        </span>
                        {(canUpdate || canDelete) && (
                            <span className="flex items-center gap-1">
                                {canUpdate && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEdit(document)}
                                        aria-label={`${PAGE_TEXT.workspace.documents.actions.edit}: ${document.name}`}
                                    >
                                        <Pencil />
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openDelete(document)}
                                        aria-label={`${PAGE_TEXT.workspace.documents.actions.delete}: ${document.name}`}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 />
                                    </Button>
                                )}
                            </span>
                        )}
                    </CardContent>
                </Card>
            ))}

            <DocumentFormDialog open={formOpen} onOpenChange={setFormOpen} matterId={matter.id} document={editing} onSaved={handleSaved} />

            <DocumentDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                matterId={matter.id}
                document={deleting}
                onDeleted={handleDeleted}
            />
        </div>
    );
}
