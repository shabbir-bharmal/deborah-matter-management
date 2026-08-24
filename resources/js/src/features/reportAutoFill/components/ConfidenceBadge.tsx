import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { FieldConfidence } from '../types/reportAutoFill';

const confidenceBadgeClass: Record<FieldConfidence, string> = {
    high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    low: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    unmapped: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
};

export default function ConfidenceBadge({ confidence, edited }: { confidence: FieldConfidence; edited: boolean }) {
    if (edited) {
        return (
            <Badge variant="outline" className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Edited
            </Badge>
        );
    }
    const label =
        confidence === 'high' ? 'High confidence' : confidence === 'low' ? 'Low confidence' : confidence === 'medium' ? 'Medium' : 'Unmapped';
    return (
        <Badge variant="outline" className={cn(confidenceBadgeClass[confidence])}>
            {label}
        </Badge>
    );
}
