import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import InterviewDeleteDialog from '~/components/matter/interview-delete-dialog';
import InterviewFormDialog from '~/components/matter/interview-form-dialog';
import RelatedChip from '~/components/matter/related-chip';
import TabSkeleton from '~/components/matter/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByMatter, getInterviewsByMatter, getWitnessesByMatter } from '~/data/selectors';
import { useCan } from '~/hooks/use-auth';
import { useInvestigation } from '~/hooks/use-investigation';
import { allegationStatusLabels, interviewStatusBadgeClass, interviewStatusLabels } from '~/lib/status';
import type { Allegation, Interview, InterviewWithWitness, Witness } from '~/types';

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Interviews() {
    const matter = useInvestigation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [interviews, setInterviews] = useState<InterviewWithWitness[] | null>(null);
    const [allegations, setAllegations] = useState<Allegation[]>([]);
    const [witnesses, setWitnesses] = useState<Witness[]>([]);
    const [selected, setSelected] = useState<InterviewWithWitness | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<InterviewWithWitness | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<InterviewWithWitness | null>(null);

    const canCreate = useCan('interviews.create');
    const canUpdate = useCan('interviews.update');
    const canDelete = useCan('interviews.delete');

    const reloadInterviews = () => {
        void getInterviewsByMatter(matter.id).then(setInterviews).catch(() => setInterviews([]));
    };

    useEffect(() => {
        let cancelled = false;
        Promise.all([getInterviewsByMatter(matter.id), getAllegationsByMatter(matter.id), getWitnessesByMatter(matter.id)]).then(
            ([interviewList, allegationList, witnessList]) => {
                if (cancelled) {
                    return;
                }
                setInterviews(interviewList);
                setAllegations(allegationList);
                setWitnesses(witnessList);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    useEffect(() => {
        if (interviews && searchParams.get('focus')) {
            setSelected(interviews.find((interview) => interview.id === searchParams.get('focus')) ?? null);
        }
    }, [interviews, searchParams]);

    const closeDialog = (open: boolean) => {
        if (!open) {
            setSelected(null);
            if (searchParams.get('focus')) {
                setSearchParams({});
            }
        }
    };

    const relatedAllegations = (interview: InterviewWithWitness) =>
        allegations.filter((allegation) => interview.relatedAllegationIds.includes(allegation.id));

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (interview: InterviewWithWitness) => {
        setEditing(interview);
        setFormOpen(true);
    };

    const openDelete = (interview: InterviewWithWitness) => {
        setDeleting(interview);
        setDeleteOpen(true);
    };

    const handleSaved = () => {
        setFormOpen(false);
        reloadInterviews();
        toast.success(editing ? PAGE_TEXT.workspace.interviews.form.updated : PAGE_TEXT.workspace.interviews.form.created);
    };

    const handleDeleted = (interview: Interview) => {
        setDeleteOpen(false);
        if (selected?.id === interview.id) {
            setSelected(null);
        }
        reloadInterviews();
        toast.success(PAGE_TEXT.workspace.interviews.deleteDialog.deleted);
    };

    return (
        <div className="space-y-3">
            {canCreate && (
                <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={openCreate} className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8">
                        <Plus />
                        {PAGE_TEXT.workspace.interviews.add}
                    </Button>
                </div>
            )}
            {!interviews && <TabSkeleton />}
            {interviews && interviews.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.interviews.empty}</CardContent>
                </Card>
            )}
            {interviews?.map((interview) => (
                <Card key={interview.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <button type="button" onClick={() => setSelected(interview)} className="min-w-0 text-left">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="font-medium">{interview.witnessName}</span>
                                    <Badge variant="outline" className={interviewStatusBadgeClass[interview.status]}>
                                        {interviewStatusLabels[interview.status]}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {formatDateTime(interview.scheduledAt)} · Interviewer: {interview.interviewer}
                                </p>
                            </button>
                            {(canUpdate || canDelete) && (
                                <span className="ml-auto flex items-center gap-1">
                                    {canUpdate && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(interview)}
                                            aria-label={`${PAGE_TEXT.workspace.interviews.actions.edit}: ${interview.witnessName}`}
                                        >
                                            <Pencil />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDelete(interview)}
                                            aria-label={`${PAGE_TEXT.workspace.interviews.actions.delete}: ${interview.witnessName}`}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 />
                                        </Button>
                                    )}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Dialog open={!!selected} onOpenChange={closeDialog}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Interview — {selected.witnessName}</DialogTitle>
                                <DialogDescription>
                                    {formatDateTime(selected.scheduledAt)} · {selected.witnessRole}
                                </DialogDescription>
                            </DialogHeader>
                            <dl className="grid grid-cols-2 gap-3">
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">Status</dt>
                                    <dd className="mt-0.5">
                                        <Badge variant="outline" className={interviewStatusBadgeClass[selected.status]}>
                                            {interviewStatusLabels[selected.status]}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.interviews.interviewer}
                                    </dt>
                                    <dd className="text-sm font-medium">{selected.interviewer}</dd>
                                </div>
                            </dl>
                            {selected.notes && (
                                <div className="bg-muted/40 rounded-lg border p-3">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.interviews.notes}
                                    </p>
                                    <p className="mt-1 text-sm">{selected.notes}</p>
                                </div>
                            )}
                            {selected.transcriptExcerpt && selected.transcriptExcerpt.length > 0 && (
                                <div className="rounded-lg border p-3">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.interviews.transcriptExcerpt}
                                    </p>
                                    <div className="mt-2 space-y-1.5">
                                        {selected.transcriptExcerpt.map((line, index) => (
                                            <p key={index} className="font-mono text-xs leading-relaxed">
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Related allegations</p>
                                {relatedAllegations(selected).length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                <div className="flex flex-wrap gap-1.5">
                                    {relatedAllegations(selected).map((allegation) => (
                                        <RelatedChip
                                            key={allegation.id}
                                            to={`/matters/${matter.id}`}
                                            label={`${allegation.title} (${allegationStatusLabels[allegation.status]})`}
                                            hint={`View allegation ${allegation.title} in the overview`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <InterviewFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                matterId={matter.id}
                interview={editing}
                witnesses={witnesses}
                onSaved={handleSaved}
            />

            <InterviewDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                matterId={matter.id}
                interview={deleting}
                onDeleted={handleDeleted}
            />
        </div>
    );
}
