import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { PAGE_TEXT } from '~/constants/menuData';
import { useInvestigation } from '~/hooks/use-investigation';
import { investigationTypeLabels } from '~/lib/status';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Overview() {
    const matter = useInvestigation();

    const fields = PAGE_TEXT.workspace.overview.fields;
    const details = [
        { label: fields.client, value: matter.client },
        { label: fields.type, value: investigationTypeLabels[matter.type] },
        { label: fields.investigator, value: matter.investigator },
        { label: fields.opened, value: formatDate(matter.openedAt) },
        { label: fields.targetCompletion, value: formatDate(matter.targetCompletionDate) },
        ...(matter.completedAt ? [{ label: fields.completed, value: formatDate(matter.completedAt) }] : []),
    ];

    return (
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
    );
}
