import { expect, test } from '@playwright/test';

test.describe('overview allegations and witnesses dialogs', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/investigations/inv-001');
    });

    test('renders allegation and witness summary rows in the overview', async ({ page }) => {
        await expect(page.getByTestId('overview-allegation-alg-001')).toBeVisible();
        await expect(page.getByTestId('overview-witness-wit-001')).toBeVisible();
        await expect(page.getByText('Repeated demeaning comments in stand-ups')).toBeVisible();
        await expect(page.getByText('Sarah Okafor')).toBeVisible();
    });

    test('opens the allegation detail dialog with related witnesses and evidence links', async ({ page }) => {
        await page.getByTestId('overview-allegation-alg-001').click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('Repeated demeaning comments in stand-ups')).toBeVisible();
        await expect(page.getByText(/Related witnesses/i)).toBeVisible();

        const evidenceChip = dialog.getByRole('link', { name: /Stand-up meeting recording/i }).first();
        await expect(evidenceChip).toHaveAttribute('href', '/investigations/inv-001/evidence?focus=evd-001');
    });

    test('chains between dialogs: allegation → witness via related witness chip', async ({ page }) => {
        await page.getByTestId('overview-allegation-alg-001').click();

        const allegationDialog = page.getByRole('dialog');
        await expect(allegationDialog.getByText(/Related witnesses/i)).toBeVisible();

        // Click the related witness chip — the dialog switches to that witness.
        await allegationDialog.getByRole('button', { name: 'Sarah Okafor' }).click();

        const witnessDialog = page.getByRole('dialog');
        await expect(witnessDialog.getByRole('heading', { name: 'Sarah Okafor' })).toBeVisible();
        await expect(witnessDialog.getByText('Interview status')).toBeVisible();
        // The allegation body is no longer shown.
        await expect(witnessDialog.getByText('Team lead allegedly made belittling remarks')).toHaveCount(0);
    });

    test('opens the witness detail dialog with notes and related allegations', async ({ page }) => {
        await page.getByTestId('overview-witness-wit-001').click();

        const dialog = page.getByRole('dialog');
        await expect(dialog.getByText('Sarah Okafor')).toBeVisible();
        await expect(dialog.getByText(/Related allegations/i)).toBeVisible();
    });

    test('closes the dialog on dismiss', async ({ page }) => {
        await page.getByTestId('overview-witness-wit-002').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: 'Close' }).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });
});
