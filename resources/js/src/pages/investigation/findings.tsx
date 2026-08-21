import { Check, Eraser } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import TabSkeleton from '~/components/investigation/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByInvestigation, getEvidenceByInvestigation } from '~/data/selectors';
import { useFindingsStore, useInvestigationFindings } from '~/hooks/use-findings-store';
import { useInvestigation } from '~/hooks/use-investigation';
import { allegationCategoryLabels, allegationStatusBadgeClass, allegationStatusLabels, findingOutcomeLabels } from '~/lib/status';
import { cn } from '~/lib/utils';
import type { Allegation, Evidence as EvidenceItem, FindingOutcome } from '~/types';

const findingOptions: FindingOutcome[] = ['substantiated', 'not_substantiated', 'inconclusive'];

function EvidenceColumn({ title, items }: { title: string; items: EvidenceItem[] }) {
    return (
        <div className="rounded-lg border p-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</p>
            {items.length === 0 && <p className="text-muted-foreground mt-2 text-sm">None</p>}
            <ul className="mt-2 space-y-1.5">
                {items.map((item) => (
                    <li key={item.id}>
                        <Link
                            to={`../evidence?focus=${item.id}`}
                            className="block truncate text-sm underline-offset-2 hover:underline"
                            title={item.title}
                        >
                            {item.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Findings() {
    const matter = useInvestigation();
    const setFinding = useFindingsStore((state) => state.setFinding);
    const setNotes = useFindingsStore((state) => state.setNotes);
    const saved = useInvestigationFindings(matter.id);
    const notesAtFocus = useRef('');
    const [allegations, setAllegations] = useState<Allegation[] | null>(null);
    const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getAllegationsByInvestigation(matter.id), getEvidenceByInvestigation(matter.id)]).then(([allegationList, evidenceList]) => {
            if (cancelled) {
                return;
            }
            setAllegations(allegationList);
            setEvidenceItems(evidenceList);
        });
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    return (
        <div className="space-y-3">
            {!allegations && <TabSkeleton />}
            {allegations && allegations.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.findings.empty}</CardContent>
                </Card>
            )}
            {allegations?.map((allegation) => {
                const related = evidenceItems.filter((item) => item.relatedAllegationIds.includes(allegation.id));
                const supporting = related.filter((item) => item.supportsAllegations.includes(allegation.id));
                const contradicting = related.filter((item) => item.contradictsAllegations.includes(allegation.id));
                const currentFinding = saved.findings[allegation.id] ?? allegation.finding;
                return (
                    <Card key={allegation.id}>
                        <CardHeader>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <CardTitle className="text-base">{allegation.title}</CardTitle>
                                <Badge variant="outline">{allegationCategoryLabels[allegation.category]}</Badge>
                                <Badge variant="outline" className={allegationStatusBadgeClass[allegation.status]}>
                                    {allegationStatusLabels[allegation.status]}
                                </Badge>
                                {currentFinding && <Badge variant="secondary">Finding: {findingOutcomeLabels[currentFinding]}</Badge>}
                            </div>
                            <CardDescription>{allegation.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <EvidenceColumn title={PAGE_TEXT.workspace.findings.supporting} items={supporting} />
                                <EvidenceColumn title={PAGE_TEXT.workspace.findings.contradicting} items={contradicting} />
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                                    {PAGE_TEXT.workspace.findings.finding}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {findingOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setFinding(matter.id, allegation.id, option);
                                                toast.success(`Finding recorded — ${findingOutcomeLabels[option]}`, {
                                                    description: allegation.title,
                                                });
                                            }}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                                                currentFinding === option
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                            )}
                                        >
                                            {currentFinding === option && <Check className="size-3.5" />}
                                            {findingOutcomeLabels[option]}
                                        </button>
                                    ))}
                                    {saved.findings[allegation.id] && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFinding(matter.id, allegation.id, undefined);
                                                toast.info('Finding override cleared', { description: allegation.title });
                                            }}
                                            className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
                                        >
                                            <Eraser className="size-3.5" />
                                            {PAGE_TEXT.workspace.findings.clearOverride}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor={`notes-${allegation.id}`}
                                    className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                                >
                                    {PAGE_TEXT.workspace.findings.notes}
                                </label>
                                <textarea
                                    id={`notes-${allegation.id}`}
                                    value={saved.notes[allegation.id] ?? ''}
                                    onChange={(event) => setNotes(matter.id, allegation.id, event.target.value)}
                                    onFocus={(event) => {
                                        notesAtFocus.current = event.target.value;
                                    }}
                                    onBlur={(event) => {
                                        if (event.target.value !== notesAtFocus.current && event.target.value.trim() !== '') {
                                            toast.success('Notes saved for this session', { description: allegation.title });
                                        }
                                    }}
                                    placeholder={PAGE_TEXT.workspace.findings.notesPlaceholder}
                                    rows={3}
                                    className="placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            <p className="text-muted-foreground text-xs">{PAGE_TEXT.workspace.findings.sessionNote}</p>
        </div>
    );
}
