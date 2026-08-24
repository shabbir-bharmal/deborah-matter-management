import { Link } from 'react-router-dom';

import { cn } from '~/lib/utils';

interface RelatedChipProps {
    to?: string;
    label: string;
    hint?: string;
    onClick?: () => void;
}

export default function RelatedChip({ to, label, hint, onClick }: RelatedChipProps) {
    const className = cn(
        'bg-card inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        'text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
    );

    if (onClick && !to) {
        return (
            <button type="button" onClick={onClick} title={hint} className={className}>
                <span className="truncate">{label}</span>
            </button>
        );
    }

    return (
        <Link to={to ?? '#'} title={hint} onClick={onClick} className={className}>
            <span className="truncate">{label}</span>
        </Link>
    );
}
