import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import RelatedChip from '~/components/investigation/related-chip';
import TabSkeleton from '~/components/investigation/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByInvestigation, getEvidenceByInvestigation, getWitnessesByInvestigation } from '~/data/selectors';
import { useInvestigationFindings } from '~/hooks/use-findings-store';
import { useInvestigation } from '~/hooks/use-investigation';
import { allegationCategoryLabels, allegationStatusBadgeClass, allegationStatusLabels, findingOutcomeLabels } from '~/lib/status';
import type { Allegation, Evidence, FindingOutcome, Witness } from '~/types';

export default function Allegations() {
    const matter = useInvestigation();
    const savedFindings = useInvestigationFindings(matter.id).findings;
    const [searchParams, setSearchParams] = useSearchParams();
    const [allegations, setAllegations] = useState<Allegation[] | null>(null);
    const [witnesses, setWitnesses] = useState<Witness[]>([]);
    const [evidenceItems, setEvidenceItems] = useState<Evidence[]>([]);
    const [selected, setSelected] = useState<Allegation | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getAllegationsByInvestigation(matter.id), getWitnessesByInvestigation(matter.id), getEvidenceByInvestigation(matter.id)]).then(
            ([allegationList, witnessList, evidenceList]) => {
                if (cancelled) {
                    return;
                }
                setAllegations(allegationList);
                setWitnesses(witnessList);
                setEvidenceItems(evidenceList);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    useEffect(() => {
        if (allegations && searchParams.get('focus')) {
            setSelected(allegations.find((allegation) => allegation.id === searchParams.get('focus')) ?? null);
        }
    }, [allegations, searchParams]);

    const closeDialog = (open: boolean) => {
        if (!open) {
            setSelected(null);
            if (searchParams.get('focus')) {
                setSearchParams({});
            }
        }
    };

    const witnessName = (id: string) => witnesses.find((witness) => witness.id === id)?.name ?? id;
    const evidenceTitle = (id: string) => evidenceItems.find((item) => item.id === id)?.title ?? id;

    return (
        <div className="space-y-3">
            {!allegations && <TabSkeleton />}
            {allegations && allegations.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.allegations.empty}</CardContent>
                </Card>
            )}
            {allegations?.map((allegation) => {
                const currentFinding = savedFindings[allegation.id] ?? allegation.finding;
                return (
                    <Card key={allegation.id} className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                            <button type="button" onClick={() => setSelected(allegation)} className="w-full text-left">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="font-medium">{allegation.title}</span>
                                    <Badge variant="outline">{allegationCategoryLabels[allegation.category]}</Badge>
                                    <Badge variant="outline" className={allegationStatusBadgeClass[allegation.status]}>
                                        {allegationStatusLabels[allegation.status]}
                                    </Badge>
                                    {currentFinding && <Badge variant="secondary">Finding: {findingOutcomeLabels[currentFinding]}</Badge>}
                                </div>
                                <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">{allegation.description}</p>
                                <p className="text-muted-foreground mt-2 text-xs">
                                    {allegation.relatedWitnessIds.length} related witness(es) · {allegation.relatedEvidenceIds.length} related
                                    evidence item(s)
                                </p>
                            </button>
                        </CardContent>
                    </Card>
                );
            })}

            <Dialog open={!!selected} onOpenChange={closeDialog}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selected.title}</DialogTitle>
                                <DialogDescription>
                                    {allegationCategoryLabels[selected.category]} · {allegationStatusLabels[selected.status]}
                                    {(savedFindings[selected.id] ?? selected.finding)
                                        ? ` · Finding: ${findingOutcomeLabels[savedFindings[selected.id] ?? (selected.finding as FindingOutcome)]}`
                                        : ''}
                                </DialogDescription>
                            </DialogHeader>
                            <p className="text-muted-foreground text-sm">{selected.description}</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.allegations.relatedWitnesses}
                                    </p>
                                    {selected.relatedWitnessIds.length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.relatedWitnessIds.map((id) => (
                                            <RelatedChip
                                                key={id}
                                                to={`/investigations/${matter.id}/witnesses?focus=${id}`}
                                                label={witnessName(id)}
                                                hint={`Open witness ${witnessName(id)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Related evidence</p>
                                    {selected.relatedEvidenceIds.length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.relatedEvidenceIds.map((id) => (
                                            <RelatedChip
                                                key={id}
                                                to={`/investigations/${matter.id}/evidence?focus=${id}`}
                                                label={evidenceTitle(id)}
                                                hint={`Open evidence ${evidenceTitle(id)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Link
                                    to={`/investigations/${matter.id}/findings`}
                                    className="inline-block text-sm font-medium underline-offset-2 hover:underline"
                                >
                                    Review finding in Findings tab →
                                </Link>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
