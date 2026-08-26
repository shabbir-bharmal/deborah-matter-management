import { expect, test } from '@playwright/test';

const WITNESS_CSV = 'Name,Role,Date,Notes\nJane Roe,Complainant,2026-07-01,Consistent account.\n';

test.beforeEach(async ({ page }) => {
    await page.goto('/matters/inv-001/reports');
    await page.getByTestId('file-input').setInputFiles([{ name: 'witnesses.csv', mimeType: 'text/csv', buffer: Buffer.from(WITNESS_CSV) }]);
    await expect(page.getByTestId('field-mapping-preview')).toBeVisible();
});

test.describe('field mapping preview (via full pipeline)', () => {
    test('renders section cards with editable values after upload and parse', async ({ page }) => {
        await expect(page.getByTestId('report-section-witnessInterviews')).toBeVisible();
        const textarea = page.getByLabel(/Value for Interviewee — Jane Roe/i);
        await expect(textarea).toHaveValue('Jane Roe, Complainant');
    });

    test('marks a field as edited when its value changes', async ({ page }) => {
        const textarea = page.getByLabel(/Value for Interviewee — Jane Roe/i);
        await textarea.fill('Jane Roe, updated by investigator');
        await expect(page.getByText('Edited')).toBeVisible();
    });

    test('clears a field via the clear action without affecting others', async ({ page }) => {
        await page.getByRole('button', { name: /Clear Interview date — Jane Roe/i }).click();
        await expect(page.getByLabel(/Value for Interview date — Jane Roe/i)).toHaveCount(0);
        await expect(page.getByLabel(/Value for Interviewee — Jane Roe/i)).toBeVisible();
    });

    test('shows the source excerpt when toggled', async ({ page }) => {
        await page.getByRole('button', { name: 'witnesses.csv', exact: true }).first().click();
        await expect(page.getByText(/Name: Jane Roe/).first()).toBeVisible();
    });

    test('removing the uploaded file removes its mapped fields', async ({ page }) => {
        await page.getByRole('button', { name: /Remove witnesses\.csv/ }).click();
        await expect(page.getByTestId('field-mapping-preview')).toHaveCount(0);
    });

    test('keeps a user edit when a new file is uploaded mid-session', async ({ page }) => {
        const textarea = page.getByLabel(/Value for Interviewee — Jane Roe/i);
        await textarea.fill('Jane Roe (verified identity)');

        await page
            .getByTestId('file-input')
            .setInputFiles([
                { name: 'more.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Role,Date,Notes\nBob Lang,Witness,2026-07-09,corroborates\n') },
            ]);

        await expect(page.getByLabel(/Value for Interviewee — Bob Lang/i)).toBeVisible();
        await expect(page.getByLabel(/Value for Interviewee — Jane Roe/i)).toHaveValue('Jane Roe (verified identity)');
    });

    test('"Accept & generate report" appends mapped content to the generated report', async ({ page }) => {
        await page.getByRole('button', { name: /Accept & generate report/i }).click();
        await expect(page.getByText(/Auto-fill accepted/)).toBeVisible();

        // The generated report preview now carries the mapped interview line.
        await expect(page.locator('.print-area').getByText(/Jane Roe, Complainant/)).toBeVisible();
    });
});
