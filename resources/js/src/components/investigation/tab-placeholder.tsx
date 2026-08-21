import { Card, CardContent } from '~/components/ui/card';

export default function TabPlaceholder({ title, phase, message }: { title: string; phase: string; message: string }) {
    return (
        <Card>
            <CardContent className="p-8 text-center">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground mt-1 text-sm">{message}</p>
                <p className="text-muted-foreground mt-3 inline-block rounded-full border px-3 py-1 text-xs">Coming in {phase}</p>
            </CardContent>
        </Card>
    );
}
