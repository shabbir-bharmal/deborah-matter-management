import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import RelatedChip from '~/components/investigation/related-chip';
import TabSkeleton from '~/components/investigation/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByInvestigation, getInterviewsByInvestigation } from '~/data/selectors';
import { useInvestigation } from '~/hooks/use-investigation';
import { allegationStatusLabels, interviewStatusBadgeClass, interviewStatusLabels } from '~/lib/status';
import type { Allegation, InterviewWithWitness } from '~/types';

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Interviews() {
    const matter = useInvestigation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [interviews, setInterviews] = useState<InterviewWithWitness[] | null>(null);
    const [allegations, setAllegations] = useState<Allegation[]>([]);
    const [selected, setSelected] = useState<InterviewWithWitness | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getInterviewsByInvestigation(matter.id), getAllegationsByInvestigation(matter.id)]).then(([interviewList, allegationList]) => {
            if (cancelled) {
                return;
            }
            setInterviews(interviewList);
            setAllegations(allegationList);
        });
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

    return (
        <div className="space-y-3">
            {!interviews && <TabSkeleton />}
            {interviews && interviews.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.interviews.empty}</CardContent>
                </Card>
            )}
            {interviews?.map((interview) => (
                <Card key={interview.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                        <button type="button" onClick={() => setSelected(interview)} className="w-full text-left">
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
                                            to={`/investigations/${matter.id}`}
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
        </div>
    );
}
