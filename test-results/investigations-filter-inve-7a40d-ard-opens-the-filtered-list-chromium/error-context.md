# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investigations-filter.spec.ts >> investigations filter via dashboard widgets >> clicking the Active matters widget on the dashboard opens the filtered list
- Location: e2e\investigations-filter.spec.ts:24:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5174/", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('investigations filter via dashboard widgets', () => {
  4  |     test('shows only active matters when arriving with ?filter=active', async ({ page }) => {
  5  |         await page.goto('/investigations?filter=active');
  6  | 
  7  |         const activeButton = page.getByRole('button', { name: 'Active', exact: true });
  8  |         await expect(activeButton).toHaveClass(/bg-primary/);
  9  | 
  10 |         await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();
  11 |         await expect(page.getByText('Expense report misconduct — regional sales')).toHaveCount(0);
  12 |     });
  13 | 
  14 |     test('shows only completed and closed matters with ?filter=completed', async ({ page }) => {
  15 |         await page.goto('/investigations?filter=completed');
  16 | 
  17 |         const completedButton = page.getByRole('button', { name: 'Completed', exact: true });
  18 |         await expect(completedButton).toHaveClass(/bg-primary/);
  19 | 
  20 |         await expect(page.getByText('Expense report misconduct — regional sales')).toBeVisible();
  21 |         await expect(page.getByText('Harassment allegations — Engineering department')).toHaveCount(0);
  22 |     });
  23 | 
  24 |     test('clicking the Active matters widget on the dashboard opens the filtered list', async ({ page }) => {
> 25 |         await page.goto('/');
     |                    ^ Error: page.goto: Test timeout of 30000ms exceeded.
  26 |         await page.getByRole('link', { name: /Active matters/ }).click();
  27 | 
  28 |         await expect(page).toHaveURL(/\/investigations\?filter=active$/);
  29 |         await expect(page.getByRole('button', { name: 'Active', exact: true })).toHaveClass(/bg-primary/);
  30 |         await expect(page.getByText('Expense report misconduct — regional sales')).toHaveCount(0);
  31 |     });
  32 | 
  33 |     test('clicking the Completed / closed widget opens the completed list', async ({ page }) => {
  34 |         await page.goto('/');
  35 |         await page.getByRole('link', { name: /Completed \/ closed/ }).click();
  36 | 
  37 |         await expect(page).toHaveURL(/\/investigations\?filter=completed$/);
  38 |         await expect(page.getByRole('button', { name: 'Completed', exact: true })).toHaveClass(/bg-primary/);
  39 |         await expect(page.getByText('Harassment allegations — Engineering department')).toHaveCount(0);
  40 |     });
  41 | 
  42 |     test('switching filters updates the URL param', async ({ page }) => {
  43 |         await page.goto('/investigations?filter=active');
  44 |         await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();
  45 | 
  46 |         await page.getByRole('button', { name: 'All Matters' }).click();
  47 |         await expect(page).not.toHaveURL(/filter=/);
  48 |         await expect(page.getByText('Harassment allegations — Engineering department')).toBeVisible();
  49 |         await expect(page.getByText('Expense report misconduct — regional sales')).toBeVisible();
  50 |     });
  51 | });
  52 | 
```