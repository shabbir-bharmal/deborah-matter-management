import { expect, test } from '@playwright/test';

test.describe('investigations filter via dashboard widgets', () => {
    test('shows only active matters when arriving with ?filter=active', async ({ page }) => {
        await page.goto('/matters?filter=active');

        const activeButton = page.getByRole('button', { name: 'Active', exact: true });
        await expect(activeButton).toHaveClass(/bg-primary/);

        await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();
        await expect(page.getByText('Expense report misconduct — regional sales')).toHaveCount(0);
    });

    test('shows only completed and closed matters with ?filter=completed', async ({ page }) => {
        await page.goto('/matters?filter=completed');

        const completedButton = page.getByRole('button', { name: 'Completed', exact: true });
        await expect(completedButton).toHaveClass(/bg-primary/);

        await expect(page.getByText('Expense report misconduct — regional sales')).toBeVisible();
        await expect(page.getByText('Harassment allegations — Engineering department')).toHaveCount(0);
    });

    test('clicking the Active matters widget on the dashboard opens the filtered list', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Active matters/ }).click();

        await expect(page).toHaveURL(/\/matters\?filter=active$/);
        await expect(page.getByRole('button', { name: 'Active', exact: true })).toHaveClass(/bg-primary/);
        await expect(page.getByText('Expense report misconduct — regional sales')).toHaveCount(0);
    });

    test('clicking the Completed / closed widget opens the completed list', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Completed \/ closed/ }).click();

        await expect(page).toHaveURL(/\/matters\?filter=completed$/);
        await expect(page.getByRole('button', { name: 'Completed', exact: true })).toHaveClass(/bg-primary/);
        await expect(page.getByText('Harassment allegations — Engineering department')).toHaveCount(0);
    });

    test('switching filters updates the URL param', async ({ page }) => {
        await page.goto('/matters?filter=active');
        await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();

        await page.getByRole('button', { name: 'All Matters' }).click();
        await expect(page).not.toHaveURL(/filter=/);
        await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();
        await expect(page.getByText('Expense report misconduct — regional sales')).toBeVisible();
    });
});
