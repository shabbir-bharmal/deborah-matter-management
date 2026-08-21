import { Link } from 'react-router-dom';

import { cn } from '~/lib/utils';

interface RelatedChipProps {
    to: string;
    label: string;
    hint?: string;
}

export default function RelatedChip({ to, label, hint }: RelatedChipProps) {
    return (
        <Link
            to={to}
            title={hint}
            className={cn(
                'bg-card inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                'text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            )}
        >
            <span className="truncate">{label}</span>
        </Link>
    );
}
