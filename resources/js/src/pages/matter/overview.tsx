import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import RelatedChip from '~/components/matter/related-chip';
import TabSkeleton from '~/components/matter/tab-skeleton';
import AllegationDeleteDialog from '~/components/matter/allegation-delete-dialog';
import AllegationFormDialog from '~/components/matter/allegation-form-dialog';
import WitnessDeleteDialog from '~/components/matter/witness-delete-dialog';
import WitnessFormDialog from '~/components/matter/witness-form-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByMatter, getEvidenceByMatter, getWitnessesByMatter } from '~/data/selectors';
import { useInvestigationFindings } from '~/hooks/use-findings-store';
import { useInvestigation } from '~/hooks/use-investigation';
import { useCan } from '~/hooks/use-auth';
import {
    allegationCategoryLabels,
    allegationStatusBadgeClass,
    allegationStatusLabels,
    findingOutcomeLabels,
    interviewStatusBadgeClass,
    interviewStatusLabels,
    matterTypeLabels,
    relationshipLabels,
} from '~/lib/status';
import type { Allegation, Evidence, FindingOutcome, Witness } from '~/types';

function formatDate(iso?: string) {
    if (!iso) {
        return '—';
    }
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Overview() {
    const matter = useInvestigation();
    const savedFindings = useInvestigationFindings(matter.id).findings;
    const [allegations, setAllegations] = useState<Allegation[] | null>(null);
    const [witnesses, setWitnesses] = useState<Witness[] | null>(null);
    const [evidenceItems, setEvidenceItems] = useState<Evidence[]>([]);
    const [selectedAllegation, setSelectedAllegation] = useState<Allegation | null>(null);
    const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingWitness, setDeletingWitness] = useState<Witness | null>(null);
    const [allegationFormOpen, setAllegationFormOpen] = useState(false);
    const [editingAllegation, setEditingAllegation] = useState<Allegation | null>(null);
    const [allegationDeleteOpen, setAllegationDeleteOpen] = useState(false);
    const [deletingAllegation, setDeletingAllegation] = useState<Allegation | null>(null);

    const canCreateWitness = useCan('witnesses.create');
    const canUpdateWitness = useCan('witnesses.update');
    const canDeleteWitness = useCan('witnesses.delete');
    const canCreateAllegation = useCan('allegations.create');
    const canUpdateAllegation = useCan('allegations.update');
    const canDeleteAllegation = useCan('allegations.delete');

    const reloadWitnesses = () => {
        void getWitnessesByMatter(matter.id)
            .then(setWitnesses)
            .catch(() => setWitnesses([]));
    };

    const reloadAllegations = () => {
        void getAllegationsByMatter(matter.id)
            .then(setAllegations)
            .catch(() => setAllegations([]));
    };

    useEffect(() => {
        let cancelled = false;
        Promise.all([getAllegationsByMatter(matter.id), getWitnessesByMatter(matter.id), getEvidenceByMatter(matter.id)]).then(
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

    const openCreateWitness = () => {
        setEditingWitness(null);
        setFormDialogOpen(true);
    };

    const openEditWitness = (witness: Witness) => {
        setEditingWitness(witness);
        setFormDialogOpen(true);
    };

    const openDeleteWitness = (witness: Witness) => {
        setDeletingWitness(witness);
        setDeleteDialogOpen(true);
    };

    const handleWitnessSaved = () => {
        setFormDialogOpen(false);
        reloadWitnesses();
        toast.success(editingWitness ? PAGE_TEXT.workspace.witnesses.form.updated : PAGE_TEXT.workspace.witnesses.form.created);
    };

    const handleWitnessDeleted = (witness: Witness) => {
        setDeleteDialogOpen(false);
        if (selectedWitness?.id === witness.id) {
            setSelectedWitness(null);
        }
        reloadWitnesses();
        toast.success(PAGE_TEXT.workspace.witnesses.deleteDialog.deleted);
    };

    const handleAllegationSaved = () => {
        setAllegationFormOpen(false);
        reloadAllegations();
        toast.success(
            editingAllegation ? PAGE_TEXT.workspace.allegations.form.updated : PAGE_TEXT.workspace.allegations.form.created,
        );
    };

    const handleAllegationDeleted = (allegation: Allegation) => {
        setAllegationDeleteOpen(false);
        if (selectedAllegation?.id === allegation.id) {
            setSelectedAllegation(null);
        }
        reloadAllegations();
        toast.success(PAGE_TEXT.workspace.allegations.deleteDialog.deleted);
    };

    const witnessName = (id: string) => witnesses?.find((witness) => witness.id === id)?.name ?? id;
    const evidenceTitle = (id: string) => evidenceItems.find((item) => item.id === id)?.title ?? id;

    const fields = PAGE_TEXT.workspace.overview.fields;
    const details = [
        { label: fields.client, value: matter.client },
        { label: fields.type, value: matterTypeLabels[matter.type] },
        { label: fields.investigator, value: matter.investigator },
        { label: fields.opened, value: formatDate(matter.openedAt) },
        { label: fields.targetCompletion, value: formatDate(matter.targetCompletionDate) },
        ...(matter.completedAt ? [{ label: fields.completed, value: formatDate(matter.completedAt) }] : []),
    ];

    const loading = allegations === null || witnesses === null;
    const currentFindingFor = (allegation: Allegation): FindingOutcome | undefined => savedFindings[allegation.id] ?? allegation.finding ?? undefined;
    const relatedAllegationsOf = (witness: Witness) => (allegations ?? []).filter((allegation) => allegation.relatedWitnessIds.includes(witness.id));

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{PAGE_TEXT.workspace.overview.title}</CardTitle>
                    <CardDescription>{PAGE_TEXT.workspace.overview.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{matter.description}</p>
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                        {details.map((detail) => (
                            <div key={detail.label}>
                                <dt className="text-muted-foreground text-xs tracking-wide uppercase">{detail.label}</dt>
                                <dd className="text-sm font-medium">{detail.value}</dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">{PAGE_TEXT.workspace.overview.allegationsSummaryTitle}</CardTitle>
                            <CardDescription>{allegations ? `${allegations.length} recorded for this matter.` : undefined}</CardDescription>
                        </div>
                        {canCreateAllegation && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingAllegation(null);
                                    setAllegationFormOpen(true);
                                }}
                                className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8"
                            >
                                <Plus />
                                {PAGE_TEXT.workspace.allegations.add}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {allegations?.length === 0 && <p className="text-muted-foreground text-sm">{PAGE_TEXT.workspace.allegations.empty}</p>}
                        {allegations?.map((allegation) => (
                            <div
                                key={allegation.id}
                                className="hover:bg-accent/50 group relative block w-full rounded-lg border p-3 text-left transition-colors"
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedAllegation(allegation)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            setSelectedAllegation(allegation);
                                        }
                                    }}
                                    aria-label={`Open details for ${allegation.title}`}
                                    data-testid={`overview-allegation-${allegation.id}`}
                                    className="cursor-pointer md:pr-24"
                                >
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        <span className="text-sm font-medium">{allegation.title}</span>
                                        <Badge variant="outline">{allegationCategoryLabels[allegation.category]}</Badge>
                                        <Badge variant="outline" className={allegationStatusBadgeClass[allegation.status]}>
                                            {allegationStatusLabels[allegation.status]}
                                        </Badge>
                                        {currentFindingFor(allegation) && (
                                            <Badge variant="secondary">
                                                Finding: {findingOutcomeLabels[currentFindingFor(allegation) as FindingOutcome]}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">{allegation.description}</p>
                                </div>
                                {(canUpdateAllegation || canDeleteAllegation) && (
                                    <div className="mt-3 flex items-center justify-end gap-1 border-t pt-2 md:hidden">
                                        {canUpdateAllegation && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setEditingAllegation(allegation);
                                                    setAllegationFormOpen(true);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.allegations.actions.edit}: ${allegation.title}`}
                                                className="h-8 px-3"
                                            >
                                                <Pencil />
                                            </Button>
                                        )}
                                        {canDeleteAllegation && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setDeletingAllegation(allegation);
                                                    setAllegationDeleteOpen(true);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.allegations.actions.delete}: ${allegation.title}`}
                                                className="h-8 px-3 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {(canUpdateAllegation || canDeleteAllegation) && (
                                    <div className="absolute right-2 bottom-2 hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 md:flex">
                                        {canUpdateAllegation && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setEditingAllegation(allegation);
                                                    setAllegationFormOpen(true);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.allegations.actions.edit}: ${allegation.title}`}
                                            >
                                                <Pencil />
                                            </Button>
                                        )}
                                        {canDeleteAllegation && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setDeletingAllegation(allegation);
                                                    setAllegationDeleteOpen(true);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.allegations.actions.delete}: ${allegation.title}`}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                        <div className="space-y-1.5">
                            <CardTitle className="text-base">{PAGE_TEXT.workspace.overview.witnessesSummaryTitle}</CardTitle>
                            <CardDescription>{witnesses ? `${witnesses.length} recorded for this matter.` : undefined}</CardDescription>
                        </div>
                        {canCreateWitness && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={openCreateWitness}
                                className="h-9 px-3 md:h-10 md:px-4 lg:h-11 lg:px-8"
                            >
                                <Plus />
                                {PAGE_TEXT.workspace.witnesses.add}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {witnesses?.length === 0 && <p className="text-muted-foreground text-sm">{PAGE_TEXT.workspace.witnesses.empty}</p>}
                        {witnesses?.map((witness) => (
                            <div
                                key={witness.id}
                                className="hover:bg-accent/50 group relative block w-full rounded-lg border p-3 text-left transition-colors"
                                >
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedWitness(witness)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            setSelectedWitness(witness);
                                        }
                                    }}
                                    aria-label={`Open details for ${witness.name}`}
                                    data-testid={`overview-witness-${witness.id}`}
                                    className="cursor-pointer md:pr-24"
                                >
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        <span className="text-sm font-medium">{witness.name}</span>
                                        <span className="text-muted-foreground text-sm">{witness.role}</span>
                                        <Badge variant="outline">{relationshipLabels[witness.relationship]}</Badge>
                                        <Badge variant="outline" className={interviewStatusBadgeClass[witness.interviewStatus]}>
                                            {interviewStatusLabels[witness.interviewStatus]}
                                        </Badge>
                                        <span className="text-muted-foreground ml-auto text-xs">
                                            Interview date: {formatDate(witness.interviewDate)}
                                        </span>
                                    </div>
                                </div>
                                {(canUpdateWitness || canDeleteWitness) && (
                                    <div className="mt-3 flex items-center justify-end gap-1 border-t pt-2 md:hidden">
                                        {canUpdateWitness && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openEditWitness(witness);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.witnesses.actions.edit}: ${witness.name}`}
                                                className="h-8 px-3"
                                            >
                                                <Pencil />
                                            </Button>
                                        )}
                                        {canDeleteWitness && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openDeleteWitness(witness);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.witnesses.actions.delete}: ${witness.name}`}
                                                className="h-8 px-3 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {(canUpdateWitness || canDeleteWitness) && (
                                    <div className="absolute right-2 bottom-2 hidden items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-md transition-opacity group-hover:opacity-100 md:flex">
                                        {canUpdateWitness && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openEditWitness(witness);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.witnesses.actions.edit}: ${witness.name}`}
                                            >
                                                <Pencil />
                                            </Button>
                                        )}
                                        {canDeleteWitness && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openDeleteWitness(witness);
                                                }}
                                                aria-label={`${PAGE_TEXT.workspace.witnesses.actions.delete}: ${witness.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {loading && <TabSkeleton />}

            {/* Allegation detail dialog — same content as the former Allegations tab. */}
            <Dialog open={!!selectedAllegation} onOpenChange={(open) => !open && setSelectedAllegation(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selectedAllegation && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedAllegation.title}</DialogTitle>
                                <DialogDescription>
                                    {allegationCategoryLabels[selectedAllegation.category]} · {allegationStatusLabels[selectedAllegation.status]}
                                    {currentFindingFor(selectedAllegation)
                                        ? ` · Finding: ${findingOutcomeLabels[currentFindingFor(selectedAllegation) as FindingOutcome]}`
                                        : ''}
                                </DialogDescription>
                            </DialogHeader>
                            <p className="text-muted-foreground text-sm">{selectedAllegation.description}</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.allegations.relatedWitnesses}
                                    </p>
                                    {selectedAllegation.relatedWitnessIds.length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedAllegation.relatedWitnessIds.map((id) => (
                                            <RelatedChip
                                                key={id}
                                                label={witnessName(id)}
                                                hint={`View witness ${witnessName(id)}`}
                                                onClick={() => {
                                                    const witness = witnesses?.find((entry) => entry.id === id);
                                                    if (witness) {
                                                        setSelectedAllegation(null);
                                                        setSelectedWitness(witness);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Related evidence</p>
                                    {selectedAllegation.relatedEvidenceIds.length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedAllegation.relatedEvidenceIds.map((id) => (
                                            <RelatedChip
                                                key={id}
                                                to={`/matters/${matter.id}/evidence?focus=${id}`}
                                                label={evidenceTitle(id)}
                                                hint={`Open evidence ${evidenceTitle(id)}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Link
                                    to={`/matters/${matter.id}/findings`}
                                    className="inline-block text-sm font-medium underline-offset-2 hover:underline"
                                >
                                    Review finding in Findings tab →
                                </Link>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Witness detail dialog — same content as the former Witnesses tab. */}
            <Dialog open={!!selectedWitness} onOpenChange={(open) => !open && setSelectedWitness(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selectedWitness && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedWitness.name}</DialogTitle>
                                <DialogDescription>
                                    {selectedWitness.role} · {relationshipLabels[selectedWitness.relationship]}
                                </DialogDescription>
                            </DialogHeader>
                            <dl className="grid grid-cols-2 gap-3">
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">Interview status</dt>
                                    <dd className="mt-0.5">
                                        <Badge variant="outline" className={interviewStatusBadgeClass[selectedWitness.interviewStatus]}>
                                            {interviewStatusLabels[selectedWitness.interviewStatus]}
                                        </Badge>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground text-xs tracking-wide uppercase">Interview date</dt>
                                    <dd className="text-sm font-medium">{formatDate(selectedWitness.interviewDate)}</dd>
                                </div>
                            </dl>
                            {selectedWitness.notes && (
                                <div className="bg-muted/40 rounded-lg border p-3">
                                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                        {PAGE_TEXT.workspace.witnesses.notes}
                                    </p>
                                    <p className="mt-1 text-sm">{selectedWitness.notes}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Related allegations</p>
                                {relatedAllegationsOf(selectedWitness).length === 0 && <p className="text-muted-foreground text-sm">None</p>}
                                <div className="flex flex-wrap gap-1.5">
                                    {relatedAllegationsOf(selectedWitness).map((allegation) => (
                                        <RelatedChip
                                            key={allegation.id}
                                            label={allegation.title}
                                            hint={`View allegation ${allegation.title}`}
                                            onClick={() => {
                                                setSelectedWitness(null);
                                                setSelectedAllegation(allegation);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Witness create/edit dialog. */}
            <WitnessFormDialog
                open={formDialogOpen}
                onOpenChange={setFormDialogOpen}
                matterId={matter.id}
                witness={editingWitness}
                onSaved={handleWitnessSaved}
            />

            {/* Witness delete dialog. */}
            <WitnessDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                matterId={matter.id}
                witness={deletingWitness}
                onDeleted={handleWitnessDeleted}
            />

            {/* Allegation create/edit dialog. */}
            <AllegationFormDialog
                open={allegationFormOpen}
                onOpenChange={setAllegationFormOpen}
                matterId={matter.id}
                allegation={editingAllegation}
                onSaved={handleAllegationSaved}
            />

            {/* Allegation delete dialog. */}
            <AllegationDeleteDialog
                open={allegationDeleteOpen}
                onOpenChange={setAllegationDeleteOpen}
                matterId={matter.id}
                allegation={deletingAllegation}
                onDeleted={handleAllegationDeleted}
            />
        </div>
    );
}
