import { useEffect, useState } from 'react';

import TabSkeleton from '~/components/matter/tab-skeleton';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { getDocumentsByMatter } from '~/data/selectors';
import { useInvestigation } from '~/hooks/use-investigation';
import { documentStatusBadgeClass, documentStatusLabels, documentTypeLabels } from '~/lib/status';
import type { InvestigationDocument } from '~/types';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Documents() {
    const matter = useInvestigation();
    const [documents, setDocuments] = useState<InvestigationDocument[] | null>(null);

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

    return (
        <div className="space-y-3">
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
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
