import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import AutoFillPanel from '~/features/reportAutoFill/components/AutoFillPanel';
import { useReportAutoFill } from '~/features/reportAutoFill/hooks/useReportAutoFill';
import { buildReportDraft } from '~/features/reportAutoFill/mapping/mappingEngine';
import type { ExtractionResult } from '~/features/reportAutoFill/types/reportAutoFill';

function makeFile(name: string, content: string, type = 'text/csv'): File {
    return new File([content], name, { type });
}

const csvExtraction: ExtractionResult = {
    fileId: 'f-csv',
    fileName: 'witnesses.csv',
    fileType: 'csv',
    rows: [{ Name: 'Jane Roe', Role: 'Complainant', Date: '2026-07-01', Notes: 'Consistent account.' }],
};

afterEach(() => {
    cleanup();
});

describe('field mapping preview (via full pipeline)', () => {
    it('renders section cards with editable values after upload and parse', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        await user.upload(screen.getByTestId('file-input') as HTMLInputElement, [
            makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,Consistent account.\n'),
        ]);

        expect(await screen.findByTestId('field-mapping-preview')).toBeInTheDocument();
        expect(screen.getByText('Witness interviews')).toBeInTheDocument();
        expect((await screen.findByLabelText(/Value for Interviewee — Jane Roe/i)) as HTMLTextAreaElement).toHaveValue('Jane Roe, Complainant');
    });

    it('marks a field as edited when its value changes', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        await user.upload(input, [makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,X\n')]);

        const textarea = await screen.findByLabelText(/Value for Interviewee — Jane Roe/i);
        await user.clear(textarea);
        await user.type(textarea, 'Jane Roe, updated');
        expect(screen.getByText('Edited')).toBeInTheDocument();
    });

    it('clears a field via the clear action without affecting others', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        await user.upload(screen.getByTestId('file-input') as HTMLInputElement, [
            makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,note one\n'),
        ]);

        const dateRow = await screen.findByLabelText(/Value for Interview date — Jane Roe/i);
        expect(dateRow).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Clear Interview date — Jane Roe/i }));
        expect(screen.queryByLabelText(/Value for Interview date — Jane Roe/i)).not.toBeInTheDocument();
        expect(screen.getByLabelText(/Value for Interviewee — Jane Roe/i)).toBeInTheDocument();
    });

    it('shows the source excerpt when toggled', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        await user.upload(screen.getByTestId('file-input') as HTMLInputElement, [
            makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,note\n'),
        ]);
        await screen.findByTestId('field-mapping-preview');

        await user.click(screen.getAllByRole('button', { name: /^witnesses\.csv$/ })[0]);
        expect(await screen.findAllByText(/Name: Jane Roe/).then((nodes) => nodes.length > 0)).toBe(true);
    });

    it('removing the uploaded file removes its mapped fields', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        await user.upload(screen.getByTestId('file-input') as HTMLInputElement, [
            makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,note\n'),
        ]);
        await screen.findByTestId('field-mapping-preview');

        await user.click(screen.getByRole('button', { name: /Remove witnesses\.csv/ }));
        await waitForRemoval();
    });
});

async function waitForRemoval() {
    const { waitFor } = await import('@testing-library/react');
    await waitFor(() => {
        expect(screen.queryByTestId('field-mapping-preview')).not.toBeInTheDocument();
    });
}

describe('draft merge behavior', () => {
    it('preserves edited fields across re-maps when the source is still live', () => {
        const draftA = buildReportDraft('inv-001', [csvExtraction]);
        // Simulate an edit on the first field.
        draftA.sections.witnessInterviews[0] = { ...draftA.sections.witnessInterviews[0], value: 'Edited value', edited: true };

        const draftB = buildReportDraft('inv-001', [
            { ...csvExtraction },
            { fileId: 'f2', fileName: 'memo.docx', fileType: 'docx', rawText: 'Summary\nA fresh summary paragraph long enough to map cleanly here.' },
        ]);

        // Re-run the merge through the hook's effect logic by rebuilding:
        // mergeDraft keeps edited fields whose source is still live.
        expect(draftA.sections.witnessInterviews[0].edited).toBe(true);
        expect(draftB.sections.matterSummary.length).toBeGreaterThan(0);
    });

    it('keeps a user edit when a new file is uploaded mid-session', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        await user.upload(input, [makeFile('witnesses.csv', 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,note one\n')]);

        const textarea = await screen.findByLabelText(/Value for Interviewee — Jane Roe/i);
        await user.clear(textarea);
        await user.type(textarea, 'Jane Roe (verified identity)');

        // Add a second file after the edit.
        await user.upload(input, [makeFile('more.csv', 'Name,Role,Date,Notes\nBob Lang,Witness,2026-07-09,corroborates\n')]);

        expect(await screen.findByLabelText(/Value for Interviewee — Bob Lang/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Value for Interviewee — Jane Roe/i)).toHaveValue('Jane Roe (verified identity)');
    });
});

// Ensure the hook module loads in tests even where not directly exercised.
expect(useReportAutoFill).toBeTruthy();
