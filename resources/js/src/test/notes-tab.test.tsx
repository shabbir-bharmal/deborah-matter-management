import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { useNotesStore } from '~/hooks/use-notes-store';
import { createTestRouter } from '~/routes';

function renderAt(url: string) {
    const router = createTestRouter(url);
    render(<RouterProvider router={router} />);
    return router;
}

afterEach(() => {
    cleanup();
    useNotesStore.setState({ byInvestigation: {} });
});

describe('matter notes tab', () => {
    it('deep-links to the notes tab with an empty state', async () => {
        renderAt('/investigations/inv-001/notes');
        expect(await screen.findByText('No notes recorded for this matter yet.')).toBeInTheDocument();
        expect(screen.getByLabelText('Add a note')).toBeInTheDocument();
    });

    it('adds a note and displays it with author and timestamp', async () => {
        const user = userEvent.setup();
        renderAt('/investigations/inv-001/notes');
        const textarea = await screen.findByLabelText('Add a note');
        await user.type(textarea, 'Client requested interim update by Friday.');
        await user.click(screen.getByRole('button', { name: 'Add note' }));

        expect(await screen.findByText('Client requested interim update by Friday.')).toBeInTheDocument();
        expect(screen.getAllByText('Deborah Whitfield').length).toBeGreaterThan(0);
        expect(useNotesStore.getState().byInvestigation['inv-001']).toHaveLength(1);
        expect(textarea).toHaveValue('');
    });

    it('keeps notes scoped per matter', async () => {
        renderAt('/investigations/inv-002/notes');
        const textarea = await screen.findByLabelText('Add a note');
        const user = userEvent.setup();
        await user.type(textarea, 'Note for inv-002 only.');
        await user.click(screen.getByRole('button', { name: 'Add note' }));

        await waitFor(() => {
            expect(useNotesStore.getState().byInvestigation['inv-002']).toHaveLength(1);
        });
        expect(useNotesStore.getState().byInvestigation['inv-001']).toBeUndefined();
    });

    it('deletes an existing note', async () => {
        useNotesStore.getState().addNote('inv-001', 'Note to delete');
        renderAt('/investigations/inv-001/notes');
        expect(await screen.findByText('Note to delete')).toBeInTheDocument();

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /Delete note/ }));
        expect(screen.queryByText('Note to delete')).not.toBeInTheDocument();
        expect(useNotesStore.getState().byInvestigation['inv-001']).toHaveLength(0);
    });

    it('disables the add button while the note is empty', async () => {
        renderAt('/investigations/inv-001/notes');
        expect(await screen.findByRole('button', { name: 'Add note' })).toBeDisabled();
    });
});
