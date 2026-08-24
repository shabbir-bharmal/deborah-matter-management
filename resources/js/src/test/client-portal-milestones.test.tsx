import { cleanup, render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { investigations } from '~/data/investigations';
import { createTestRouter } from '~/routes';

function renderAt(url: string) {
    const router = createTestRouter(url);
    render(<RouterProvider router={router} />);
    return router;
}

afterEach(() => {
    cleanup();
});

describe('client portal milestones', () => {
    it('renders all five milestone stages for each matter', async () => {
        renderAt('/clients/northwind-logistics');
        expect(await screen.findByRole('heading', { name: 'Northwind Logistics' })).toBeInTheDocument();
        const northwindMatters = investigations.filter((matter) => matter.client === 'Northwind Logistics');
        for (const stage of ['Intake', 'Planning', 'Fieldwork', 'Findings & report', 'Completed']) {
            expect(screen.getAllByText(stage).length).toBe(northwindMatters.length);
        }
    });

    it('marks exactly one stage as the current step per matter', async () => {
        renderAt('/clients/northwind-logistics');
        await screen.findByRole('heading', { name: 'Northwind Logistics' });
        const northwindMatters = investigations.filter((matter) => matter.client === 'Northwind Logistics');
        expect(screen.getAllByRole('listitem', { current: 'step' })).toHaveLength(northwindMatters.length);
    });

    it('labels the current stage for screen readers', async () => {
        renderAt('/clients/northwind-logistics');
        await screen.findByRole('heading', { name: 'Northwind Logistics' });
        const currentLabels = screen.getAllByText(/Current stage:/);
        expect(currentLabels.length).toBeGreaterThan(0);
    });
});
