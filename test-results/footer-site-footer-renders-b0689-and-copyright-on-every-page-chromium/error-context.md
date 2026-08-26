# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: footer.spec.ts >> site footer >> renders brand, tagline, and copyright on every page
- Location: e2e\footer.spec.ts:8:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('site footer', () => {
> 4  |     test.beforeEach(async ({ page }) => {
     |          ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  5  |         await page.goto('/');
  6  |     });
  7  | 
  8  |     test('renders brand, tagline, and copyright on every page', async ({ page }) => {
  9  |         const footer = page.getByRole('contentinfo');
  10 |         await expect(footer).toBeVisible();
  11 |         await expect(footer.getByText('Investigation Management', { exact: true })).toBeVisible();
  12 |         await expect(footer.getByText(/Workplace investigation management/)).toBeVisible();
  13 |         await expect(footer.getByText(/All rights reserved/)).toBeVisible();
  14 |         await expect(footer.getByText(/Confidential/)).toBeVisible();
  15 |     });
  16 | 
  17 |     test('appears on inner pages too, not just the dashboard', async ({ page }) => {
  18 |         for (const url of ['/investigations', '/clients', '/calendar', '/display-calendar', '/settings']) {
  19 |             await page.goto(url);
  20 |             await expect(page.getByRole('contentinfo')).toBeVisible();
  21 |         }
  22 |         await page.goto('/investigations/inv-001');
  23 |         await expect(page.getByRole('contentinfo')).toBeVisible();
  24 |     });
  25 | 
  26 |     test('footer navigation links work', async ({ page }) => {
  27 |         const footer = page.getByRole('contentinfo');
  28 |         await footer.getByRole('link', { name: 'Clients' }).click();
  29 |         await expect(page).toHaveURL(/\/clients$/);
  30 |         await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
  31 |     });
  32 | 
  33 |     test('contact email is a mailto link', async ({ page }) => {
  34 |         await expect(page.getByRole('contentinfo').getByRole('link', { name: /compliance@prototype\.local/ })).toHaveAttribute(
  35 |             'href',
  36 |             'mailto:compliance@prototype.local',
  37 |         );
  38 |     });
  39 | });
  40 | 
```