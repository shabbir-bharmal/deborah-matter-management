import { expect, test } from '@playwright/test';

const SHOWING = /^Showing \d+-\d+ of \d+$/;

function totalFrom(label: string): number {
    return Number(label.match(/of (\d+)$/)?.[1]);
}

test.describe('investigations pagination', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/matters');
    });

    function rows(page: import('@playwright/test').Page) {
        return page.getByTestId('matter-row');
    }

    async function showingText(page: import('@playwright/test').Page): Promise<string> {
        return (await page.getByText(SHOWING).textContent()) ?? '';
    }

    test('defaults to 10 rows per page with a correct range label', async ({ page }) => {
        await expect(rows(page).first()).toBeVisible();
        expect(await rows(page).count()).toBeLessThanOrEqual(10);

        const total = totalFrom(await showingText(page));
        if (total > 10) {
            await expect(page.getByText('Showing 1-10 of')).toBeVisible();
            await expect(page.getByRole('link', { name: 'Go to page 2' })).toBeVisible();
        } else {
            await expect(page.getByText(`Showing 1-${total} of ${total}`)).toBeVisible();
        }
    });

    test('changing the page size to 100 shows every matter on one page', async ({ page }) => {
        const total = totalFrom(await showingText(page));

        await page.getByLabel('Per page').selectOption('100');
        await expect(rows(page)).toHaveCount(total);
        await expect(page.getByText(`Showing 1-${total} of ${total}`)).toBeVisible();
        await expect(page).toHaveURL(/pageSize=100/);
    });

    test('numbered pager buttons navigate and update the URL', async ({ page }) => {
        const total = totalFrom(await showingText(page));
        test.skip(total <= 20, 'needs more than two pages of data');

        await page.getByRole('link', { name: 'Go to page 2' }).click();
        await expect(page).toHaveURL(/[?&]page=2/);
        await expect(page.getByText('Showing 11-')).toBeVisible();
        await expect(rows(page).first()).not.toHaveCount(0);

        await page.getByRole('link', { name: 'Go to previous page' }).click();
        await expect(page.getByText('Showing 1-10 of')).toBeVisible();

        await page.getByRole('link', { name: 'Go to page 2' }).click();
        await page.getByRole('link', { name: 'Go to next page' }).click();
        await expect(page.getByText('Showing 21-')).toBeVisible();
    });

    test('the current page button is marked with aria-current', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page');
    });

    test('the active page appears in the pager when navigating past it', async ({ page }) => {
        const total = totalFrom(await showingText(page));
        const totalPages = Math.max(1, Math.ceil(total / 10));
        test.skip(totalPages < 3, 'needs at least three pages of data');

        // Walk to page 3 using Next (pages 3+ are hidden behind the ellipsis on load).
        await page.getByRole('link', { name: 'Go to page 2' }).click();
        await page.getByRole('link', { name: 'Go to next page' }).click();

        const page3 = page.getByRole('link', { name: 'Go to page 3' });
        await expect(page3).toBeVisible();
        await expect(page3).toHaveAttribute('aria-current', 'page');
    });

    test('shows a compact pager: first two pages, ellipsis, then the last page', async ({ page }) => {
        const total = totalFrom(await showingText(page));
        const totalPages = Math.max(1, Math.ceil(total / 10));
        test.skip(totalPages <= 3, 'needs more than three pages to hide anything');

        // Exactly three page links plus the ellipsis marker.
        await expect(page.getByRole('link', { name: 'Go to page 1' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Go to page 2' })).toBeVisible();
        await expect(page.getByRole('link', { name: `Go to page ${totalPages}` })).toBeVisible();
        await expect(page.getByText('…')).toHaveCount(1);

        const pageNumberLinks = page.locator('a[data-slot="pagination-link"][aria-label^="Go to page"]');
        expect(await pageNumberLinks.count()).toBe(3);
        expect(await page.getByRole('link', { name: 'Go to page 3' }).count()).toBe(totalPages === 3 ? 1 : 0);
    });

    test('an out-of-range page param falls back to the last available page', async ({ page }) => {
        await page.goto('/matters?page=999');
        const label = await showingText(page);
        // The range must end exactly at the total, never beyond it.
        const end = Number(label.match(/-(\d+) of/)?.[1]);
        expect(end).toBe(totalFrom(label));
    });

    test('applying a filter resets back to page 1', async ({ page }) => {
        const total = totalFrom(await showingText(page));
        test.skip(total <= 20, 'needs more than two pages of data');

        await page.getByRole('link', { name: 'Go to page 2' }).click();
        await expect(page).toHaveURL(/[?&]page=2/);
        await page.getByRole('button', { name: 'Active', exact: true }).click();
        await expect(page).toHaveURL(/filter=active/);
        await expect(page).not.toHaveURL(/page=/);
        await expect(page.getByText('Showing 1-')).toBeVisible();
    });
});

test.describe('clients pagination', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/clients');
    });

    function cards(page: import('@playwright/test').Page) {
        return page.getByTestId('client-grid').locator('a');
    }

    test('shows at most the default page size with a range label', async ({ page }) => {
        await expect(cards(page).first()).toBeVisible();
        expect(await cards(page).count()).toBeLessThanOrEqual(10);
        await expect(page.getByText(SHOWING)).toBeVisible();
    });

    test('changing the page size shows all clients on one page', async ({ page }) => {
        const total = totalFrom((await page.getByText(SHOWING).textContent()) ?? '');

        await page.getByLabel('Per page').selectOption('50');
        await expect(cards(page)).toHaveCount(total);
        await expect(page).toHaveURL(/pageSize=50/);
    });

    test('pager navigation updates the URL and visible slice', async ({ page }) => {
        const total = totalFrom((await page.getByText(SHOWING).textContent()) ?? '');
        test.skip(total <= 20, 'needs more than two pages of data');

        const firstPageFirstClient = await cards(page).first().textContent();
        await page.getByRole('link', { name: 'Go to page 2' }).click();
        await expect(page).toHaveURL(/[?&]page=2/);
        await expect(page.getByText('Showing 11-')).toBeVisible();
        await expect(cards(page).first().textContent()).resolves.not.toBe(firstPageFirstClient);
    });
});
