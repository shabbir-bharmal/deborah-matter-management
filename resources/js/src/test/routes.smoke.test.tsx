import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { createTestRouter } from '~/routes';

function renderAt(url: string) {
    const router = createTestRouter(url);
    render(<RouterProvider router={router} />);
    return router;
}

afterEach(() => {
    cleanup();
});

describe('route smoke tests', () => {
    it.each([
        ['/', 'Dashboard'],
        ['/investigations', 'Investigations'],
        ['/clients', 'Clients'],
        ['/calendar', 'Calendar'],
        ['/display-calendar', 'Display Calendar'],
        ['/settings', 'Settings'],
    ])('renders %s', async (url, heading) => {
        renderAt(url);
        expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    });

    it('renders a 404 page for unknown routes', async () => {
        renderAt('/this-route-does-not-exist');
        expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    });

    it.each([
        ['/investigations/inv-001', 'Harassment allegations — Engineering department'],
        ['/investigations/inv-002', 'Discrimination claim — promotion process'],
        ['/investigations/inv-003', 'Expense report misconduct — regional sales'],
    ])('deep-links to matter workspace %s without crashing', async (url, title) => {
        renderAt(url);
        expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
        expect(await screen.findByText('Target completion')).toBeInTheDocument();
    });

    it('redirects bare matter URLs to the overview tab', async () => {
        renderAt('/investigations/inv-001');
        await waitFor(() => {
            expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
        });
    });

    it.each([
        ['/investigations/inv-001/timeline', 'Complaint received'],
        ['/investigations/inv-001/interviews', 'Sarah Okafor'],
        ['/investigations/inv-001/evidence', 'Stand-up meeting recording — 12 May 2026'],
        ['/investigations/inv-001/findings', 'Supporting evidence'],
        ['/investigations/inv-001/documents', 'Interview transcript — Sarah Okafor'],
        ['/investigations/inv-001/reports', /1\. Matter summary/i],
    ])('deep-links to workspace tab %s with real content', async (url, content) => {
        renderAt(url);
        if (typeof content === 'string') {
            expect(await screen.findAllByText(content)).not.toHaveLength(0);
        } else {
            expect(await screen.findByText(content)).toBeInTheDocument();
        }
    });

    it('shows matter not found for an unknown investigation id', async () => {
        renderAt('/investigations/does-not-exist');
        expect(await screen.findByText('Matter not found.')).toBeInTheDocument();
    });

    it('renders the client portal for a known client', async () => {
        renderAt('/clients/northwind-logistics');
        expect(await screen.findByRole('heading', { name: 'Northwind Logistics' })).toBeInTheDocument();
        expect(await screen.findAllByText(/Client-visible documents/i)).not.toHaveLength(0);
    });

    it('shows client not found for an unknown client', async () => {
        renderAt('/clients/unknown-corp');
        expect(await screen.findByText('Client not found.')).toBeInTheDocument();
    });
});
