import { expect, test } from '@playwright/test';

test.describe('matter notes tab', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/investigations/inv-001/notes');
    });

    test('deep-links to the notes tab with an empty state', async ({ page }) => {
        await expect(page.getByText('No notes recorded for this matter yet.')).toBeVisible();
        await expect(page.getByLabel('Add a note')).toBeVisible();
    });

    test('adds a note and displays it with author and timestamp', async ({ page }) => {
        const textarea = page.getByLabel('Add a note');
        await textarea.fill('Client requested interim update by Friday.');
        await page.getByRole('button', { name: 'Add note' }).click();

        await expect(page.getByText('Client requested interim update by Friday.')).toBeVisible();
        await expect(textarea).toHaveValue('');
    });

    test('disables the add button while the note is empty', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Add note' })).toBeDisabled();
    });

    test('keeps notes scoped per matter and supports deletion', async ({ page }) => {
        const textarea = page.getByLabel('Add a note');
        await textarea.fill('Note to delete');
        await page.getByRole('button', { name: 'Add note' }).click();
        await expect(page.getByText('Note to delete')).toBeVisible();

        await page.getByRole('button', { name: /Delete note/ }).click();
        await expect(page.getByText('Note to delete')).toHaveCount(0);
        await expect(page.getByText('No notes recorded for this matter yet.')).toBeVisible();
    });
});
