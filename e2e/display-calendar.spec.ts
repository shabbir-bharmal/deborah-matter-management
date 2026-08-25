import { expect, test } from '@playwright/test';

const MONTH_NAME = /January|February|March|April|May|June|July|August|September|October|November|December/;

test.describe('display calendar', () => {
    test('renders the month grid with weekday headers', async ({ page }) => {
        await page.goto('/display-calendar');
        await expect(page.getByRole('heading', { name: 'Display Calendar' })).toBeVisible();
        for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
            await expect(page.getByText(day, { exact: true })).toBeVisible();
        }
        await expect(page.getByText(MONTH_NAME)).toBeVisible();
    });

    test('lists upcoming interviews and matter deadlines in the upcoming events section', async ({ page }) => {
        await page.goto('/display-calendar');
        await expect(page.getByText(/Interview — /).first()).toBeVisible();
        await expect(page.getByText(/Deadline — /).first()).toBeVisible();
    });

    test('filters the upcoming events list by kind', async ({ page }) => {
        await page.goto('/display-calendar');
        const filter = page.getByTestId('upcoming-kind-filter');

        // Interviews only.
        await filter.selectOption('interview');
        await expect(page.getByText(/Interview — /).first()).toBeVisible();
        await expect(page.getByText(/Deadline — /)).toHaveCount(0);

        // Deadlines only.
        await filter.selectOption('deadline');
        await expect(page.getByText(/Deadline — /).first()).toBeVisible();
        await expect(page.getByText(/Interview — /)).toHaveCount(0);

        // Back to all.
        await filter.selectOption('all');
        await expect(page.getByText(/Interview — /).first()).toBeVisible();
        await expect(page.getByText(/Deadline — /).first()).toBeVisible();
    });

    test('navigates between months with the previous and next controls', async ({ page }) => {
        await page.goto('/display-calendar');
        const label = page.getByText(MONTH_NAME);
        const initial = await label.textContent();
        await page.getByRole('button', { name: 'Previous month' }).click();
        await expect(page.getByText(MONTH_NAME)).not.toHaveText(initial ?? '');
        await page.getByRole('button', { name: 'Next month' }).click();
        await expect(page.getByText(MONTH_NAME)).toHaveText(initial ?? '');
    });

    test('opens the selected-day list when Today is clicked', async ({ page }) => {
        await page.goto('/display-calendar');
        await page.getByRole('button', { name: 'Today' }).click();
        await expect(page.getByText(/Events on/)).toBeVisible();
    });
});

test.describe('display calendar — mobile', () => {
    test.use({ viewport: { width: 480, height: 900 } });

    test('keeps the month grid inside a horizontally scrollable wrapper for small screens', async ({ page }) => {
        await page.goto('/display-calendar');

        const wrapper = page.getByTestId('calendar-grid-scroll');
        await expect(wrapper).toBeVisible();

        const grid = wrapper.locator('div').first();
        await expect(grid).toHaveClass(/min-w-\[640px\]/);
        await expect(grid).toHaveClass(/grid-cols-7/);

        // The wrapper actually scrolls instead of stretching the page.
        const metrics = await wrapper.evaluate((element) => {
            const grid = element.firstElementChild as HTMLElement;
            return {
                viewport: window.innerWidth,
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
                minWidth: getComputedStyle(grid).minWidth,
            };
        });
        expect(metrics.viewport).toBe(480);
        expect(metrics.minWidth).toBe('640px');
        expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    });
});

test.describe('display calendar — desktop', () => {
    test.use({ viewport: { width: 1440, height: 800 } });

    test('caps and scrolls the upcoming events card on desktop', async ({ page }) => {
        await page.goto('/display-calendar');

        const card = page.getByTestId('upcoming-card');
        await expect(card).toBeVisible();

        // The scroll area is an internal overflow container...
        const list = page.getByTestId('upcoming-list-scroll');
        await expect(list).toHaveClass(/overflow-y-auto/);

        // ...and the card itself is capped to the viewport on desktop so long
        // lists scroll inside instead of stretching the page.
        const maxHeight = await card.evaluate((element) => getComputedStyle(element).maxHeight);
        expect(maxHeight).not.toBe('none');
        expect(Number.parseFloat(maxHeight)).toBeLessThanOrEqual(800);

        const box = await card.boundingBox();
        expect(box?.height ?? 0).toBeLessThanOrEqual(800);
    });
});
