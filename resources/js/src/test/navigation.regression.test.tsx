import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { createTestRouter } from '~/routes';

afterEach(() => {
    cleanup();
});

describe('regression: matter navigation from the investigations list', () => {
    it('opens the workspace instead of an error when a matter row is clicked', async () => {
        const user = userEvent.setup();
        const router = createTestRouter('/investigations');
        render(<RouterProvider router={router} />);

        // List renders the seeded matters
        const row = await screen.findByText('Harassment allegations — Engineering department');
        expect(row).toBeInTheDocument();

        // Click through to the matter — this crashed before the AiAssistant context fix
        await user.click(row);
        expect(await screen.findByText('Target completion')).toBeInTheDocument();
        expect(screen.queryByText('Matter not found.')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/investigations/inv-001/overview');
    });

    it('navigates between workspace tabs without crashing', async () => {
        const user = userEvent.setup();
        const router = createTestRouter('/investigations/inv-001');
        render(<RouterProvider router={router} />);

        await screen.findByText('Target completion');

        await user.click(screen.getByRole('link', { name: 'Timeline' }));
        expect(await screen.findAllByText('Complaint received')).not.toHaveLength(0);
        expect(router.state.location.pathname).toBe('/investigations/inv-001/timeline');

        await user.click(screen.getByRole('link', { name: 'Findings' }));
        expect((await screen.findAllByText('Supporting evidence')).length).toBeGreaterThan(0);

        await user.click(screen.getByRole('link', { name: 'Reports' }));
        expect(await screen.findByText('Draft')).toBeInTheDocument();
    });
});
