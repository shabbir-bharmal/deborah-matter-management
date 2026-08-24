import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('overview allegations and witnesses dialogs', () => {
    it('renders allegation and witness summary rows in the overview', async () => {
        renderAt('/investigations/inv-001');
        expect(await screen.findByTestId('overview-allegation-alg-001')).toBeInTheDocument();
        expect(await screen.findByTestId('overview-witness-wit-001')).toBeInTheDocument();
        expect(screen.getByText('Repeated demeaning comments in stand-ups')).toBeInTheDocument();
        expect(screen.getByText('Sarah Okafor')).toBeInTheDocument();
    });

    it('opens the allegation detail dialog with related witnesses when a row is clicked', async () => {
        const user = userEvent.setup();
        renderAt('/investigations/inv-001');

        await user.click(await screen.findByTestId('overview-allegation-alg-001'));

        const { within } = await import('@testing-library/react');
        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getAllByText('Repeated demeaning comments in stand-ups').length).toBeGreaterThan(0);
        expect(screen.getByText(/Related witnesses/i)).toBeInTheDocument();

        // Related evidence chips still navigate to the Evidence tab.
        const evidenceChip = within(dialog).getAllByRole('link', { name: /Stand-up meeting recording/i })[0];
        expect(evidenceChip).toHaveAttribute('href', '/investigations/inv-001/evidence?focus=evd-001');
    });

    it('chains between dialogs: allegation → witness via related witness chip', async () => {
        const user = userEvent.setup();
        renderAt('/investigations/inv-001');

        await user.click(await screen.findByTestId('overview-allegation-alg-001'));
        const dialog = await screen.findByRole('dialog');

        const { within } = await import('@testing-library/react');
        // Chip accessible name is the witness label; hint is only a title attribute.
        const chip = within(dialog).getByRole('button', { name: 'Sarah Okafor' });
        await user.click(chip);

        // Witness dialog replaces the allegation dialog without leaving Overview.
        expect(await screen.findByText('Interview status')).toBeInTheDocument();
        expect(within(screen.getByRole('dialog')).getAllByText(/Complainant/).length).toBeGreaterThan(0);
    });

    it('opens the witness detail dialog with notes and related allegations', async () => {
        const user = userEvent.setup();
        renderAt('/investigations/inv-001');

        await user.click(await screen.findByTestId('overview-witness-wit-001'));

        const dialog = await screen.findByRole('dialog');
        const { within } = await import('@testing-library/react');
        expect(within(dialog).getByText('Sarah Okafor')).toBeInTheDocument();
        expect(within(dialog).getAllByText(/Related allegations/i).length).toBeGreaterThan(0);
    });

    it('closes the dialog on dismiss', async () => {
        const user = userEvent.setup();
        renderAt('/investigations/inv-001');

        await user.click(await screen.findByTestId('overview-witness-wit-002'));
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Close' }));
        await waitForDialogClosed();
    });
});

async function waitForDialogClosed() {
    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
}
