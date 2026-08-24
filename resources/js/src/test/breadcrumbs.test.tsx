import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { createTestRouter } from '~/routes';

function renderAt(url: string) {
    const router = createTestRouter(url);
    render(<RouterProvider router={router} />);
    return router;
}

function breadcrumb() {
    return within(screen.getByRole('navigation', { name: 'breadcrumb' }));
}

afterEach(() => {
    cleanup();
});

describe('breadcrumbs', () => {
    it('renders a single crumb on the dashboard', async () => {
        renderAt('/');
        await screen.findByRole('heading', { name: 'Dashboard' });
        expect(breadcrumb().getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders Dashboard > Investigations on the investigations list', async () => {
        renderAt('/investigations');
        await screen.findByRole('heading', { name: 'Investigations' });
        const nav = breadcrumb();
        expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
        expect(nav.getByText('Investigations')).toBeInTheDocument();
    });

    it('renders matter title and tab inside the workspace', async () => {
        renderAt('/investigations/inv-001/interviews');
        await waitFor(() => {
            expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
        });
        const nav = breadcrumb();
        expect(nav.getByRole('link', { name: 'Investigations' })).toHaveAttribute('href', '/investigations');
        expect(await nav.findByText('Harassment allegations — Engineering department')).toBeInTheDocument();
        expect(nav.getByText('Interviews')).toBeInTheDocument();
    });

    it('renders client name in the client portal breadcrumb', async () => {
        renderAt('/clients/northwind-logistics');
        await waitFor(() => {
            expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
        });
        const nav = breadcrumb();
        expect(nav.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
        expect(await nav.findByText('Northwind Logistics')).toBeInTheDocument();
    });

    it('renders crumbs for standalone pages', async () => {
        renderAt('/display-calendar');
        await screen.findByRole('heading', { name: 'Display Calendar' });
        const nav = breadcrumb();
        expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
        expect(nav.getByText('Display Calendar')).toBeInTheDocument();
    });
});
