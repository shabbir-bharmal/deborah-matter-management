import { expect, test } from '@playwright/test';

test.describe('site footer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders brand, tagline, and copyright on every page', async ({ page }) => {
        const footer = page.getByRole('contentinfo');
        await expect(footer).toBeVisible();
        await expect(footer.getByText('Investigation Management', { exact: true })).toBeVisible();
        await expect(footer.getByText(/Workplace investigation management/)).toBeVisible();
        await expect(footer.getByText(/All rights reserved/)).toBeVisible();
        await expect(footer.getByText(/Confidential/)).toBeVisible();
    });

    test('appears on inner pages too, not just the dashboard', async ({ page }) => {
        for (const url of ['/investigations', '/clients', '/calendar', '/display-calendar', '/settings']) {
            await page.goto(url);
            await expect(page.getByRole('contentinfo')).toBeVisible();
        }
        await page.goto('/investigations/inv-001');
        await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('footer navigation links work', async ({ page }) => {
        const footer = page.getByRole('contentinfo');
        await footer.getByRole('link', { name: 'Clients' }).click();
        await expect(page).toHaveURL(/\/clients$/);
        await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
    });

    test('contact email is a mailto link', async ({ page }) => {
        await expect(page.getByRole('contentinfo').getByRole('link', { name: /compliance@prototype\.local/ })).toHaveAttribute(
            'href',
            'mailto:compliance@prototype.local',
        );
    });
});
