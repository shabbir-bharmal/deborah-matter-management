# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notes-tab.spec.ts >> matter notes tab >> deep-links to the notes tab with an empty state
- Location: e2e\notes-tab.spec.ts:8:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('matter notes tab', () => {
> 4  |     test.beforeEach(async ({ page }) => {
     |          ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  5  |         await page.goto('/investigations/inv-001/notes');
  6  |     });
  7  | 
  8  |     test('deep-links to the notes tab with an empty state', async ({ page }) => {
  9  |         await expect(page.getByText('No notes recorded for this matter yet.')).toBeVisible();
  10 |         await expect(page.getByLabel('Add a note')).toBeVisible();
  11 |     });
  12 | 
  13 |     test('adds a note and displays it with author and timestamp', async ({ page }) => {
  14 |         const textarea = page.getByLabel('Add a note');
  15 |         await textarea.fill('Client requested interim update by Friday.');
  16 |         await page.getByRole('button', { name: 'Add note' }).click();
  17 | 
  18 |         await expect(page.getByText('Client requested interim update by Friday.')).toBeVisible();
  19 |         await expect(textarea).toHaveValue('');
  20 |     });
  21 | 
  22 |     test('disables the add button while the note is empty', async ({ page }) => {
  23 |         await expect(page.getByRole('button', { name: 'Add note' })).toBeDisabled();
  24 |     });
  25 | 
  26 |     test('keeps notes scoped per matter and supports deletion', async ({ page }) => {
  27 |         const textarea = page.getByLabel('Add a note');
  28 |         await textarea.fill('Note to delete');
  29 |         await page.getByRole('button', { name: 'Add note' }).click();
  30 |         await expect(page.getByText('Note to delete')).toBeVisible();
  31 | 
  32 |         await page.getByRole('button', { name: /Delete note/ }).click();
  33 |         await expect(page.getByText('Note to delete')).toHaveCount(0);
  34 |         await expect(page.getByText('No notes recorded for this matter yet.')).toBeVisible();
  35 |     });
  36 | });
  37 | 
```