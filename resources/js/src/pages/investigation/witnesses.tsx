import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import RelatedChip from '~/components/investigation/related-chip';
import TabSkeleton from '~/components/investigation/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByInvestigation, getWitnessesByInvestigation } from '~/data/selectors';
import { useInvestigation } from '~/hooks/use-investigation';
import { interviewStatusBadgeClass, interviewStatusLabels, relationshipLabels } from '~/lib/status';
import type { Allegation, Witness } from '~/types';

function formatDate(iso?: string) {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Witnesses() {
    const matter = useInvestigation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [witnesses, setWitnesses] = useState<Witness[] | null>(null);
    const [allegations, setAllegations] = useState<Allegation[]>([]);
    const [selected, setSelected] = useState<Witness | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getWitnessesByInvestigation(matter.id), getAllegationsByInvestigation(matter.id)]).then(([witnessList, allegationList]) => {
            if (cancelled) {
                return;
            }
            setWitnesses(witnessList);
            setAllegations(allegationList);
        });
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    useEffect(() => {
        if (witnesses && searchParams.get('focus')) {
            setSelected(witnesses.find((witness) => witness.id === searchParams.get('focus')) ?? null);
        }
    }, [witnesses, searchParams]);

    const closeDialog = (open: boolean) => {
        if (!open) {
            setSelected(null);
            if (searchParams.get('focus')) {
                setSearchParams({});
            }
        }
    };

    const relatedAllegations = (witness: Witness) => allegations.filter((allegation) => allegation.relatedWitnessIds.includes(witness.id));

    return (
        <div className="space-y-3">
            {!witnesses && <TabSkeleton />}
            {witnesses && witnesses.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.witnesses.empty}</CardContent>
                </Card>
            )}
            <div className="grid gap-3 md:grid-cols-2">
                {witnesses?.map((witness) => (
                    <Card key={witness.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                            <button type="button" onClick={() => setSelected(witness)} className="w-full text-left">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="font-medium">{witness.name}</span>
                                    <Badge variant="outline">{relationshipLabels[witness.relationship]}</Badge>
                                    <Badge variant="outline" className={interviewStatusBadgeClass[witness.interviewStatus]}>
                                        {interviewStatusLabels[witness.interviewStatus]}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">{witness.role}</p>
                                <p className="text-muted-foreground mt-2 text-xs">Interview date: {formatDate(witness.interviewDate)}</p>
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selected} onOpenChange={closeDialog}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selected.name}</DialogTitle>
                                <DialogDescription>
                                    {selected.role} · {relationshipLabels[selected.relationship]}
                                </DialogDescription>
                            </DialogHeader>
                            <dl className="grid grid-cols-2 gap-3">
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">Interview status</dt>
                                    <dd className="mt-0.5">
                                        <Badge variant="outline" className={interviewStatusBadgeClass[selected.interviewStatus]}>
                                            {interviewStatusLabels[selected.interviewStatus]}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">Interview date</dt>
                                    <dd className="text-sm font-medium">{formatDate(selected.interviewDate)}</dd>
                                </div>
                            </dl>
                            {selected.notes && (
                                <div className="bg-muted/40 rounded-lg border p-3">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.witnesses.notes}
                                    </p>
                                    <p className="mt-1 text-sm">{selected.notes}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Related allegations</p>
                                {relatedAllegations(selected).length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                <div className="flex flex-wrap gap-1.5">
                                    {relatedAllegations(selected).map((allegation) => (
                                        <RelatedChip
                                            key={allegation.id}
                                            to={`/investigations/${matter.id}/allegations?focus=${allegation.id}`}
                                            label={allegation.title}
                                            hint={`Open allegation ${allegation.title}`}
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
