import { Card, CardContent } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export default function TabSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading">
            {Array.from({ length: rows }).map((_, index) => (
                <Card key={index}>
                    <CardContent className="space-y-3 p-4">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
