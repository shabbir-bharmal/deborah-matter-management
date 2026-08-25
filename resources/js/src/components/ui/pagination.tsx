import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { buttonVariants } from '~/components/ui/button';
import { PAGE_TEXT } from '~/constants/menuData';
import { cn } from '~/lib/utils';

/* ---------------------------------------------------------------------------
 * shadcn/ui pagination primitives
 * (https://ui.shadcn.com/docs/components/base/pagination)
 *
 * Adapted from the official component: links render as buttons when no href
 * is provided, because our lists navigate through callbacks instead of URLs.
 * ------------------------------------------------------------------------- */

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return <ul data-slot="pagination-content" className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" className={cn('', className)} {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
} & Omit<React.ComponentProps<'a'>, 'href'> & { href?: string };

function PaginationLink({ className, isActive, size = 'default', onClick, disabled, ...props }: PaginationLinkProps) {
    const classes = cn(
        buttonVariants({
            variant: isActive ? 'outline' : 'ghost',
            size,
        }),
        className,
    );

    if (!props.href) {
        return (
            <a
                aria-current={isActive ? 'page' : undefined}
                data-slot="pagination-link"
                data-active={isActive}
                role="link"
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                className={cn(classes, disabled && 'pointer-events-none opacity-50')}
                onClick={(event) => {
                    event.preventDefault();
                    if (!disabled) {
                        onClick?.(event);
                    }
                }}
                {...props}
            />
        );
    }

    return (
        <a
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            aria-disabled={disabled || undefined}
            className={cn(classes, disabled && 'pointer-events-none opacity-50')}
            onClick={(event) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                onClick?.(event);
            }}
            {...props}
        />
    );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink aria-label="Go to previous page" size="default" className={cn('gap-1 px-2.5 sm:pl-2.5', className)} {...props}>
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:block">{PAGE_TEXT.pagination.previous}</span>
        </PaginationLink>
    );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink aria-label="Go to next page" size="default" className={cn('gap-1 px-2.5 sm:pr-2.5', className)} {...props}>
            <span className="hidden sm:block">{PAGE_TEXT.pagination.next}</span>
            <ChevronRightIcon className="size-4" />
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden="true"
            data-slot="pagination-ellipsis"
            className={cn('text-muted-foreground flex size-9 items-center justify-center', className)}
            {...props}
        >
            &hellip;
        </span>
    );
}

/* ---------------------------------------------------------------------------
 * Composite bar used by list pages: rows-per-page selector (left) plus the
 * shadcn pager (right), pinned to the bottom-right of the page.
 * ------------------------------------------------------------------------- */

const PAGE_SIZES = [10, 20, 50, 100];

export interface PaginationBarProps {
    page: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

/**
 * Compact pager: the first two pages plus the last page are always shown,
 * and the ACTIVE page is always inserted so users can see where they are.
 * A single ellipsis marks hidden ranges.
 */
export function buildPageList(current: number, totalPages: number): (number | 'ellipsis-l')[] {
    // Everything is visible when there is nothing hidden behind an ellipsis.
    if (totalPages <= 3) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const safeCurrent = Math.min(Math.max(current, 1), totalPages);
    const pages = new Set<number>([1, 2, safeCurrent, totalPages]);
    const sorted = [...pages].sort((a, b) => a - b);

    const out: (number | 'ellipsis-l')[] = [];
    let previous = 0;
    for (const pageNumber of sorted) {
        if (pageNumber - previous > 1) {
            out.push('ellipsis-l');
        }
        out.push(pageNumber);
        previous = pageNumber;
    }
    return out;
}

export default function PaginationBar({ page, pageSize, totalCount, onPageChange, onPageSizeChange }: PaginationBarProps) {
    if (totalCount === 0) {
        return null;
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);
    const pages = buildPageList(page, totalPages);

    return (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
                <select
                    aria-label={PAGE_TEXT.pagination.rowsPerPage}
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                    className="border-input bg-background h-9 rounded-md border px-2 py-1.5 text-sm"
                >
                    {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
                <span className="text-muted-foreground">
                    {PAGE_TEXT.pagination.showing} {from}-{to} {PAGE_TEXT.pagination.of} {totalCount}
                </span>
            </div>

            {/* Bottom-right pager built from the shadcn pagination primitives. */}
            <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            aria-disabled={page <= 1}
                            className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                            onClick={() => onPageChange(page - 1)}
                        />
                    </PaginationItem>

                    {pages.map((entry, index) =>
                        typeof entry !== 'number' ? (
                            <PaginationItem key={`${entry}-${index}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={entry}>
                                <PaginationLink
                                    isActive={entry === page}
                                    aria-label={`Go to page ${entry}`}
                                    size="icon"
                                    className="min-w-9 tabular-nums"
                                    onClick={() => onPageChange(entry)}
                                >
                                    {entry}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                        <PaginationNext
                            aria-disabled={page >= totalPages}
                            className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                            onClick={() => onPageChange(page + 1)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export { PAGE_SIZES };
