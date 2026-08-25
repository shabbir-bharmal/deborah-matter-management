import { Building2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import Pagination, { PAGE_SIZES } from '~/components/ui/pagination';
import { PAGE_TEXT } from '~/constants/menuData';
import { getClients } from '~/data/selectors';
import type { ClientSummary } from '~/types';

export default function Clients() {
    const [clients, setClients] = useState<ClientSummary[] | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const sizeParam = Number(searchParams.get('pageSize'));
    const pageSize: number = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

    useEffect(() => {
        let cancelled = false;
        getClients().then((result) => {
            if (!cancelled) {
                setClients(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const totalCount = clients?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const requestedPage = Number(searchParams.get('page')) || 1;
    const page = Math.min(Math.max(1, requestedPage), totalPages);

    const setPage = (value: number) => {
        const params = new URLSearchParams(searchParams);
        if (value > 1) {
            params.set('page', String(value));
        } else {
            params.delete('page');
        }
        setSearchParams(params);
    };

    const setPageSize = (size: number) => {
        const params = new URLSearchParams(searchParams);
        // Changing the page size always returns to the first page.
        params.delete('page');
        if (size !== 10) {
            params.set('pageSize', String(size));
        } else {
            params.delete('pageSize');
        }
        setSearchParams(params);
    };

    const pagedClients = useMemo(() => (clients ?? []).slice((page - 1) * pageSize, page * pageSize), [clients, page, pageSize]);

    return (
        <div className="space-y-4">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">{PAGE_TEXT.clients.title}</h1>
                <p className="text-muted-foreground text-sm">{PAGE_TEXT.clients.subtitle}</p>
            </div>

            {!clients && <p className="text-muted-foreground text-sm">Loading clients…</p>}
            {clients && clients.length === 0 && (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">{PAGE_TEXT.clients.empty}</CardContent>
                </Card>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="client-grid">
                {pagedClients.map((client) => (
                    <Link key={client.id} to={`/clients/${client.id}`} className="block">
                        <Card className="hover:bg-accent/50 h-full transition-colors">
                            <CardContent className="flex h-full items-start gap-3 p-5">
                                <span className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                                    <Building2 className="text-primary size-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{client.name}</span>
                                    <span className="text-muted-foreground mt-1 block text-xs">
                                        {client.matterCount} matter{client.matterCount === 1 ? '' : 's'} · {client.activeCount} active
                                    </span>
                                    <Badge variant="outline" className="mt-2">
                                        {PAGE_TEXT.clients.portalBadge}
                                    </Badge>
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {clients && totalCount > 0 && (
                <Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
        </div>
    );
}
