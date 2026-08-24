import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { interviews } from '~/data/interviews';
import { investigations } from '~/data/investigations';
import { witnesses } from '~/data/witnesses';
import { createTestRouter } from '~/routes';

function renderAt(url: string) {
    const router = createTestRouter(url);
    render(<RouterProvider router={router} />);
    return router;
}

afterEach(() => {
    cleanup();
});

const today = new Date().toISOString().slice(0, 10);
const scheduledInterviews = interviews.filter(
    (interview) => (interview.status === 'scheduled' || interview.status === 'rescheduled') && interview.scheduledAt.slice(0, 10) >= today,
);
const activeMatters = investigations.filter(
    (matter) => ['open', 'in_progress', 'review'].includes(matter.status) && matter.targetCompletionDate >= today,
);

const MONTH_NAME = /January|February|March|April|May|June|July|August|September|October|November|December/;

describe('display calendar', () => {
    it('renders the month grid with weekday headers', async () => {
        renderAt('/display-calendar');
        expect(await screen.findByRole('heading', { name: 'Display Calendar' })).toBeInTheDocument();
        expect(screen.getByText('Mon')).toBeInTheDocument();
        expect(screen.getByText('Sun')).toBeInTheDocument();
        expect(screen.getByText(MONTH_NAME)).toBeInTheDocument();
    });

    it('lists every scheduled or rescheduled interview in the upcoming events section', async () => {
        renderAt('/display-calendar');
        for (const interview of scheduledInterviews) {
            const witnessName = witnesses.find((witness) => witness.id === interview.witnessId)?.name;
            expect(await screen.findByText(`Interview — ${witnessName}`)).toBeInTheDocument();
        }
    });

    it('lists every active matter deadline in the upcoming events section', async () => {
        renderAt('/display-calendar');
        for (const matter of activeMatters) {
            expect(await screen.findByText(`Deadline — ${matter.title}`)).toBeInTheDocument();
        }
    });

    it('navigates between months with the previous and next controls', async () => {
        const user = userEvent.setup();
        renderAt('/display-calendar');
        const initialLabel = (await screen.findByText(MONTH_NAME)).textContent;
        await user.click(screen.getByRole('button', { name: 'Previous month' }));
        expect(screen.getByText(MONTH_NAME).textContent).not.toBe(initialLabel);
        await user.click(screen.getByRole('button', { name: 'Next month' }));
        expect(screen.getByText(MONTH_NAME).textContent).toBe(initialLabel);
    });

    it('opens the selected-day list when Today is clicked', async () => {
        const user = userEvent.setup();
        renderAt('/display-calendar');
        await screen.findByText(MONTH_NAME);
        await user.click(screen.getByRole('button', { name: 'Today' }));
        expect(await screen.findByText(/Events on/)).toBeInTheDocument();
    });
});
