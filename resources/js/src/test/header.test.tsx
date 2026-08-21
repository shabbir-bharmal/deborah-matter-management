import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useNotificationsStore } from '~/hooks/use-notifications-store';
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

beforeEach(() => {
    useNotificationsStore.setState({ readIds: {} });
    document.documentElement.classList.remove('dark');
});

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('header', () => {
    it('shows the signed-in profile avatar with name and role', async () => {
        renderAt();
        expect(await screen.findByText('Deborah Whitfield')).toBeInTheDocument();
        expect(screen.getByText('Lead Investigator')).toBeInTheDocument();
        expect(screen.getByText('DW')).toBeInTheDocument();
    });

    it('opens the profile menu with mock sign-out', async () => {
        const user = userEvent.setup();
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Deborah Whitfield/i }));
        expect(await screen.findByText('deborah.whitfield@prototype.local')).toBeInTheDocument();

        await user.click(screen.getByText('Sign out'));
        expect(await screen.findByText(/Sign-out is disabled in the prototype/i)).toBeInTheDocument();
    });

    it('toggles dark mode on and off', async () => {
        const user = userEvent.setup();
        renderAt();
        const toggle = screen.getByRole('button', { name: /switch to dark mode/i });

        await user.click(toggle);
        expect(document.documentElement).toHaveClass('dark');
        expect(localStorage.getItem('spa-theme')).toBe('dark');

        await user.click(screen.getByRole('button', { name: /switch to light mode/i }));
        expect(document.documentElement).not.toHaveClass('dark');
    });

    it('shows unread notification count derived from system data and supports mark all read', async () => {
        const user = userEvent.setup();
        renderAt();

        const bell = await screen.findByRole('button', { name: /notifications \(\d+ unread\)/i });
        expect(bell).toHaveTextContent(/\d+/);

        await user.click(bell);
        expect((await screen.findAllByText(/Interview (scheduled|rescheduled) —/)).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/New evidence awaiting review|Evidence review in progress/).length).toBeGreaterThan(0);

        await user.click(screen.getByRole('button', { name: 'Mark all read' }));
        expect(useNotificationsStore.getState().readIds['interview-int-003']).toBe(true);
        expect(screen.queryByRole('button', { name: 'Mark all read' })).not.toBeInTheDocument();
    });
});
