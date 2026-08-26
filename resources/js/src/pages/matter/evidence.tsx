import { FileAudio2, FileImage, FileText, Mail, MessageSquare, ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import RelatedChip from '~/components/matter/related-chip';
import TabSkeleton from '~/components/matter/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { PAGE_TEXT } from '~/constants/menuData';
import { getAllegationsByMatter, getEvidenceByMatter } from '~/data/selectors';
import { useInvestigation } from '~/hooks/use-investigation';
import { allegationStatusLabels, evidenceStatusBadgeClass, evidenceStatusLabels, evidenceTypeLabels } from '~/lib/status';
import type { Allegation, Evidence as EvidenceItem, EvidenceType } from '~/types';

const typeIcons: Record<EvidenceType, typeof FileText> = {
    email: Mail,
    document: FileText,
    chat_log: MessageSquare,
    recording: FileAudio2,
    photo: FileImage,
    system_report: ScrollText,
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Evidence() {
    const matter = useInvestigation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<EvidenceItem[] | null>(null);
    const [allegations, setAllegations] = useState<Allegation[]>([]);
    const [selected, setSelected] = useState<EvidenceItem | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getEvidenceByMatter(matter.id), getAllegationsByMatter(matter.id)]).then(([evidenceList, allegationList]) => {
            if (cancelled) {
                return;
            }
            setItems(evidenceList);
            setAllegations(allegationList);
        });
        return () => {
            cancelled = true;
        };
    }, [matter.id]);

    useEffect(() => {
        if (items && searchParams.get('focus')) {
            setSelected(items.find((item) => item.id === searchParams.get('focus')) ?? null);
        }
    }, [items, searchParams]);

    const closeDialog = (open: boolean) => {
        if (!open) {
            setSelected(null);
            if (searchParams.get('focus')) {
                setSearchParams({});
            }
        }
    };

    const relatedAllegations = (item: EvidenceItem) => allegations.filter((allegation) => item.relatedAllegationIds.includes(allegation.id));

    return (
        <div className="space-y-3">
            {!items && <TabSkeleton />}
            {items && items.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.workspace.evidence.empty}</CardContent>
                </Card>
            )}
            <div className="grid gap-3 md:grid-cols-2">
                {items?.map((item) => {
                    const Icon = typeIcons[item.type];
                    return (
                        <Card key={item.id} className="hover:bg-accent/50 transition-colors">
                            <CardContent className="p-4">
                                <button type="button" onClick={() => setSelected(item)} className="w-full text-left">
                                    <div className="flex items-start gap-3">
                                        <span className="bg-muted/40 flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                            <Icon className="text-muted-foreground size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                <span className="font-medium">{item.title}</span>
                                                <Badge variant="outline" className={evidenceStatusBadgeClass[item.status]}>
                                                    {evidenceStatusLabels[item.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {evidenceTypeLabels[item.type]} · {item.source} · {formatDate(item.date)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!selected} onOpenChange={closeDialog}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selected.title}</DialogTitle>
                                <DialogDescription>
                                    {evidenceTypeLabels[selected.type]} · {formatDate(selected.date)}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-muted/30 flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center">
                                {(() => {
                                    const Icon = typeIcons[selected.type];
                                    return <Icon className="text-muted-foreground size-8" />;
                                })()}
                                <p className="text-sm font-medium">{selected.title}</p>
                                <p className="text-muted-foreground text-xs">{PAGE_TEXT.workspace.evidence.staticPreviewNote}</p>
                            </div>
                            <p className="text-muted-foreground text-sm">{selected.description}</p>
                            <div>
                                <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
                                    {PAGE_TEXT.workspace.evidence.metadata}
                                </p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-3 sm:grid-cols-3">
                                    {Object.entries(selected.metadata).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-muted-foreground text-xs">{key}</dt>
                                            <dd className="text-sm font-medium">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    {PAGE_TEXT.workspace.evidence.reviewStatus}
                                </span>
                                <Badge variant="outline" className={evidenceStatusBadgeClass[selected.status]}>
                                    {evidenceStatusLabels[selected.status]}
                                </Badge>
                            </div>
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
        </div>
    );
}
