# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: overview-details.spec.ts >> overview allegations and witnesses dialogs >> renders allegation and witness summary rows in the overview
- Location: e2e\overview-details.spec.ts:8:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('overview allegations and witnesses dialogs', () => {
> 4  |     test.beforeEach(async ({ page }) => {
     |          ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  5  |         await page.goto('/investigations/inv-001');
  6  |     });
  7  | 
  8  |     test('renders allegation and witness summary rows in the overview', async ({ page }) => {
  9  |         await expect(page.getByTestId('overview-allegation-alg-001')).toBeVisible();
  10 |         await expect(page.getByTestId('overview-witness-wit-001')).toBeVisible();
  11 |         await expect(page.getByText('Repeated demeaning comments in stand-ups')).toBeVisible();
  12 |         await expect(page.getByText('Sarah Okafor')).toBeVisible();
  13 |     });
  14 | 
  15 |     test('opens the allegation detail dialog with related witnesses and evidence links', async ({ page }) => {
  16 |         await page.getByTestId('overview-allegation-alg-001').click();
  17 | 
  18 |         const dialog = page.getByRole('dialog');
  19 |         await expect(dialog).toBeVisible();
  20 |         await expect(dialog.getByText('Repeated demeaning comments in stand-ups')).toBeVisible();
  21 |         await expect(page.getByText(/Related witnesses/i)).toBeVisible();
  22 | 
  23 |         const evidenceChip = dialog.getByRole('link', { name: /Stand-up meeting recording/i }).first();
  24 |         await expect(evidenceChip).toHaveAttribute('href', '/investigations/inv-001/evidence?focus=evd-001');
  25 |     });
  26 | 
  27 |     test('chains between dialogs: allegation → witness via related witness chip', async ({ page }) => {
  28 |         await page.getByTestId('overview-allegation-alg-001').click();
  29 | 
  30 |         const allegationDialog = page.getByRole('dialog');
  31 |         await expect(allegationDialog.getByText(/Related witnesses/i)).toBeVisible();
  32 | 
  33 |         // Click the related witness chip — the dialog switches to that witness.
  34 |         await allegationDialog.getByRole('button', { name: 'Sarah Okafor' }).click();
  35 | 
  36 |         const witnessDialog = page.getByRole('dialog');
  37 |         await expect(witnessDialog.getByRole('heading', { name: 'Sarah Okafor' })).toBeVisible();
  38 |         await expect(witnessDialog.getByText('Interview status')).toBeVisible();
  39 |         // The allegation body is no longer shown.
  40 |         await expect(witnessDialog.getByText('Team lead allegedly made belittling remarks')).toHaveCount(0);
  41 |     });
  42 | 
  43 |     test('opens the witness detail dialog with notes and related allegations', async ({ page }) => {
  44 |         await page.getByTestId('overview-witness-wit-001').click();
  45 | 
  46 |         const dialog = page.getByRole('dialog');
  47 |         await expect(dialog.getByText('Sarah Okafor')).toBeVisible();
  48 |         await expect(dialog.getByText(/Related allegations/i)).toBeVisible();
  49 |     });
  50 | 
  51 |     test('closes the dialog on dismiss', async ({ page }) => {
  52 |         await page.getByTestId('overview-witness-wit-002').click();
  53 |         await expect(page.getByRole('dialog')).toBeVisible();
  54 |         await page.getByRole('button', { name: 'Close' }).click();
  55 |         await expect(page.getByRole('dialog')).toHaveCount(0);
  56 |     });
  57 | });
  58 | 
```