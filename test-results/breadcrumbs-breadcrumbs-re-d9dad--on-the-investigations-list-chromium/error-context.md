# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: breadcrumbs.spec.ts >> breadcrumbs >> renders Dashboard > Investigations on the investigations list
- Location: e2e\breadcrumbs.spec.ts:14:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5174/investigations", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | function breadcrumb(page: import('@playwright/test').Page) {
  4  |     return page.getByRole('navigation', { name: 'breadcrumb' });
  5  | }
  6  | 
  7  | test.describe('breadcrumbs', () => {
  8  |     test('renders a single crumb on the dashboard', async ({ page }) => {
  9  |         await page.goto('/');
  10 |         await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  11 |         await expect(breadcrumb(page).getByText('Dashboard')).toBeVisible();
  12 |     });
  13 | 
  14 |     test('renders Dashboard > Investigations on the investigations list', async ({ page }) => {
> 15 |         await page.goto('/investigations');
     |                    ^ Error: page.goto: Test timeout of 30000ms exceeded.
  16 |         await expect(page.getByRole('heading', { name: 'Investigations' })).toBeVisible();
  17 |         const nav = breadcrumb(page);
  18 |         await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
  19 |         await expect(nav.getByText('Investigations')).toBeVisible();
  20 |     });
  21 | 
  22 |     test('renders matter title and tab inside the workspace', async ({ page }) => {
  23 |         await page.goto('/investigations/inv-001/interviews');
  24 |         const nav = breadcrumb(page);
  25 |         await expect(nav.getByRole('link', { name: 'Investigations' })).toHaveAttribute('href', '/investigations');
  26 |         await expect(nav.getByText('Harassment allegations — Engineering department')).toBeVisible();
  27 |         await expect(nav.getByText('Interviews')).toBeVisible();
  28 |     });
  29 | 
  30 |     test('renders client name in the client portal breadcrumb', async ({ page }) => {
  31 |         await page.goto('/clients/northwind-logistics');
  32 |         const nav = breadcrumb(page);
  33 |         await expect(nav.getByRole('link', { name: 'Clients' })).toHaveAttribute('href', '/clients');
  34 |         await expect(nav.getByText('Northwind Logistics')).toBeVisible();
  35 |     });
  36 | 
  37 |     test('renders crumbs for standalone pages', async ({ page }) => {
  38 |         await page.goto('/display-calendar');
  39 |         await expect(page.getByRole('heading', { name: 'Display Calendar' })).toBeVisible();
  40 |         const nav = breadcrumb(page);
  41 |         await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
  42 |         await expect(nav.getByText('Display Calendar')).toBeVisible();
  43 |     });
  44 | });
  45 | 
```