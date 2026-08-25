import { expect, test } from '@playwright/test';

function breadcrumb(page: import('@playwright/test').Page) {
    return page.getByRole('navigation', { name: 'breadcrumb' });
}

test.describe('breadcrumbs', () => {
    test('renders a single crumb on the dashboard', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        await expect(breadcrumb(page).getByText('Dashboard')).toBeVisible();
    });

    test('renders Dashboard > Investigations on the investigations list', async ({ page }) => {
        await page.goto('/investigations');
        await expect(page.getByRole('heading', { name: 'Investigations' })).toBeVisible();
        const nav = breadcrumb(page);
        await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
        await expect(nav.getByText('Investigations')).toBeVisible();
    });

    test('renders matter title and tab inside the workspace', async ({ page }) => {
        await page.goto('/investigations/inv-001/interviews');
        const nav = breadcrumb(page);
        await expect(nav.getByRole('link', { name: 'Investigations' })).toHaveAttribute('href', '/investigations');
        await expect(nav.getByText('Harassment allegations — Engineering department')).toBeVisible();
        await expect(nav.getByText('Interviews')).toBeVisible();
    });

    test('renders client name in the client portal breadcrumb', async ({ page }) => {
        await page.goto('/clients/northwind-logistics');
        const nav = breadcrumb(page);
        await expect(nav.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
        await expect(nav.getByText('Northwind Logistics')).toBeVisible();
    });

    test('renders crumbs for standalone pages', async ({ page }) => {
        await page.goto('/display-calendar');
        await expect(page.getByRole('heading', { name: 'Display Calendar' })).toBeVisible();
        const nav = breadcrumb(page);
        await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
        await expect(nav.getByText('Display Calendar')).toBeVisible();
    });
});
