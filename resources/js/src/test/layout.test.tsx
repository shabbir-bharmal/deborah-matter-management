import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { afterEach, describe, expect, it } from 'vitest';

import { createTestRouter } from '~/routes';

function renderAt(url = '/') {
    const router = createTestRouter(url);
    render(
        <>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
        </>,
    );
    return router;
}

afterEach(() => {
    cleanup();
});

describe('responsive layout', () => {
    it('opens the hamburger drawer and navigates to a section', async () => {
        const user = userEvent.setup();
        const router = renderAt('/');

        await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));

        const drawer = await screen.findByRole('dialog');
        expect(within(drawer).getAllByText('Investigations').length).toBeGreaterThan(0);

        await user.click(within(drawer).getByText('Investigations'));
        expect(await screen.findByRole('heading', { name: 'Investigations' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/investigations');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hamburger menu reaches every section', async () => {
        const user = userEvent.setup();
        const router = renderAt('/');

        for (const [name, path] of [
            ['Clients', '/clients'],
            ['Calendar', '/calendar'],
            ['Settings', '/settings'],
            ['Dashboard', '/'],
        ] as const) {
            await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
            const drawer = await screen.findByRole('dialog');
            await user.click(within(drawer).getByText(name));
            await screen.findByRole('heading', { name });
            expect(router.state.location.pathname).toBe(path);
        }
    });

    it('renders the brand link in the header on small screens', () => {
        renderAt('/');
        expect(screen.getByRole('link', { name: 'Go to dashboard' })).toBeInTheDocument();
    });
});
