import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestRouter } from '~/routes';

function renderReports() {
    const router = createTestRouter('/investigations/inv-001/reports');
    render(<RouterProvider router={router} />);
    return router;
}

beforeEach(() => {
    vi.spyOn(window, 'print').mockImplementation(() => {});
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('report print / PDF functionality', () => {
    it('calls window.print() when the Print / PDF button is clicked', async () => {
        const user = userEvent.setup();
        renderReports();
        await screen.findByText(/1\. Matter summary/i);

        expect(window.print).not.toHaveBeenCalled();
        await user.click(screen.getByRole('button', { name: /Print \/ PDF/i }));
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('marks the report card as the print area containing the report content', async () => {
        renderReports();
        await screen.findByText(/1\. Matter summary/i);

        const printArea = document.querySelector('.print-area');
        expect(printArea).not.toBeNull();
        expect(printArea).toHaveTextContent('Matter summary');
        expect(printArea).toHaveTextContent('Conclusion');

        // The report title lives inside the printable card
        expect(printArea).toHaveTextContent('Harassment allegations — Engineering department');
    });

    it('keeps the toolbar and app chrome out of the printed output', async () => {
        renderReports();
        await screen.findByText(/1\. Matter summary/i);

        const printArea = document.querySelector('.print-area') as HTMLElement;
        const printButton = screen.getByRole('button', { name: /Print \/ PDF/i });
        expect(printArea.contains(printButton)).toBe(false);
        expect(printButton.closest('div')).toHaveClass('print:hidden');

        // App shell chrome is hidden when printing
        expect(document.querySelector('aside')).toHaveClass('print:hidden');
        expect(document.querySelector('header')).toHaveClass('print:hidden');
    });

    it('keeps the print area through the mock final view', async () => {
        const user = userEvent.setup();
        renderReports();
        await screen.findByText(/1\. Matter summary/i);

        await user.click(screen.getByRole('button', { name: /Preview final view/i }));
        expect(await screen.findByText(/Final investigation report/i)).toBeInTheDocument();

        const printArea = document.querySelector('.print-area');
        expect(printArea).not.toBeNull();
        expect(printArea).toHaveTextContent('Final investigation report');

        await user.click(screen.getByRole('button', { name: /Print \/ PDF/i }));
        expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('relies on print CSS that scopes output to .print-area', async () => {
        // Guard: the stylesheet must keep the @media print scoping rules
        const css = readFileSync('resources/js/src/index.css', 'utf-8');
        expect(css).toMatch(/@media print/);
        expect(css).toMatch(/body \* \{[^}]*visibility: hidden/m);
        expect(css).toMatch(/\.print-area,\s*\.print-area \* \{[^}]*visibility: visible/m);
        expect(css).toMatch(/\.print-area \{[^}]*position: absolute/m);
    });
});
