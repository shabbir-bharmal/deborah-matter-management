import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import AutoFillPanel from '~/features/reportAutoFill/components/AutoFillPanel';

function makeFile(name: string, type: string, size = 1024): File {
    return new File(['a'.repeat(size)], name, { type });
}

afterEach(() => {
    cleanup();
});

describe('report auto-fill upload UI', () => {
    it('accepts supported files and lists them with type badges', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        await user.upload(input, [
            new File(['report'], 'interview-notes.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }),
            new File(['a,b'], 'witnesses.csv', { type: 'text/csv' }),
            new File(['%PDF-'], 'memo.pdf', { type: 'application/pdf' }),
        ]);

        const list = await screen.findByTestId('uploaded-file-list');
        expect(list).toBeInTheDocument();
        expect(screen.getByText('interview-notes.docx')).toBeInTheDocument();
        expect(screen.getByText('witnesses.csv')).toBeInTheDocument();
        expect(screen.getByText('memo.pdf')).toBeInTheDocument();
        expect(screen.getAllByText('DOCX').length).toBe(1);
        expect(screen.getAllByText('CSV').length).toBe(1);
        expect(screen.getAllByText('PDF').length).toBe(1);
    });

    it('rejects unsupported file types with an inline error and no crash', async () => {
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [makeFile('photo.png', 'image/png')] } });

        const rejections = await screen.findByTestId('upload-rejections');
        expect(rejections).toHaveTextContent(/Unsupported file type/);
        expect(screen.queryByTestId('uploaded-file-list')).not.toBeInTheDocument();
    });

    it('rejects files above the 10 MB client-side limit', async () => {
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [makeFile('huge.csv', 'text/csv', 11 * 1024 * 1024)] } });

        await waitFor(() => {
            expect(screen.getByTestId('upload-rejections')).toHaveTextContent(/10 MB/);
        });
    });

    it('allows duplicate file names as distinct entries and supports removal', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        await user.upload(input, [makeFile('notes.csv', 'text/csv'), makeFile('notes.csv', 'text/csv')]);

        await screen.findByTestId('uploaded-file-list');
        expect(screen.getAllByText('notes.csv')).toHaveLength(2);

        await user.click(screen.getAllByRole('button', { name: /Remove notes\.csv/ })[0]);
        expect(screen.getAllByText('notes.csv')).toHaveLength(1);
    });

    it('dismisses rejection messages', async () => {
        const user = userEvent.setup();
        render(<AutoFillPanel matterId="inv-001" />);

        const input = screen.getByTestId('file-input') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [makeFile('image.jpg', 'image/jpeg')] } });
        await screen.findByTestId('upload-rejections');

        await user.click(screen.getByRole('button', { name: 'Dismiss' }));
        expect(screen.queryByTestId('upload-rejections')).not.toBeInTheDocument();
    });
});
