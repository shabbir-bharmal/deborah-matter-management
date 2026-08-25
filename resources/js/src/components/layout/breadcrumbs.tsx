import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { NAV_ITEMS, WORKSPACE_TABS } from '~/constants/menuData';
import { getClients, getInvestigation } from '~/data/selectors';

interface Crumb {
    label: string;
    href?: string;
}

const labelForSegment = (segment: string) => {
    const navItem = NAV_ITEMS.find((item) => item.href === `/${segment}`);
    if (navItem) {
        return navItem.label;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export default function Breadcrumbs() {
    const { pathname } = useLocation();
    const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

    const matterId = segments[0] === 'investigations' && segments[1] ? segments[1] : null;
    const clientSlug = segments[0] === 'clients' && segments[1] ? segments[1] : null;

    const [matterTitle, setMatterTitle] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string | null>(null);

    useEffect(() => {
        if (!matterId) {
            setMatterTitle(null);
            return;
        }
        let cancelled = false;
        setMatterTitle(null);
        getInvestigation(matterId).then((matter) => {
            if (!cancelled) {
                setMatterTitle(matter?.title ?? matterId);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [matterId]);

    useEffect(() => {
        if (!clientSlug) {
            setClientName(null);
            return;
        }
        let cancelled = false;
        setClientName(null);
        getClients().then((clients) => {
            if (!cancelled) {
                setClientName(clients.find((client) => client.id === clientSlug)?.name ?? clientSlug);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [clientSlug]);

    const ready = (matterId === null || matterTitle !== null) && (clientSlug === null || clientName !== null);
    if (!ready) {
        return null;
    }

    const crumbs: Crumb[] = [{ label: 'Dashboard', href: segments.length > 0 ? '/' : undefined }];

    for (let index = 0; index < segments.length; index += 1) {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        if (index === 0) {
            crumbs.push({ label: labelForSegment(segments[index]), href: segments.length > 1 ? href : undefined });
            continue;
        }
        if (segments[0] === 'investigations' && index === 1) {
            crumbs.push({ label: matterTitle ?? segments[index], href: segments.length > 2 ? href : undefined });
            continue;
        }
        if (segments[0] === 'clients' && index === 1) {
            crumbs.push({ label: clientName ?? segments[index], href: segments.length > 2 ? href : undefined });
            continue;
        }
        if (segments[0] === 'investigations' && index === 2) {
            const tab = WORKSPACE_TABS.find((entry) => entry.id === segments[index]);
            crumbs.push({ label: tab?.label ?? segments[index] });
            continue;
        }
        crumbs.push({ label: labelForSegment(segments[index]) });
    }

    return (
        <div className="mb-6">
            <Breadcrumb>
                <BreadcrumbList>
                    {crumbs.map((crumb, index) => (
                        <Fragment key={`${crumb.href ?? crumb.label}-${index}`}>
                            <BreadcrumbItem>
                                {crumb.href && index < crumbs.length - 1 ? (
                                    <BreadcrumbLink asChild>
                                        <Link to={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span aria-current="page" className="text-foreground font-normal">
                                        {crumb.label}
                                    </span>
                                )}
                            </BreadcrumbItem>
                            {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
