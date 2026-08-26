# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout-header.spec.ts >> header >> shows the signed-in profile avatar with name and role
- Location: e2e\layout-header.spec.ts:48:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('Deborah Whitfield')
Expected: visible
Received: undefined

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Deborah Whitfield')
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | test.describe('responsive layout and header', () => {
  4   |     test.use({ viewport: { width: 480, height: 900 } });
  5   | 
  6   |     test('opens the hamburger drawer and navigates to a section', async ({ page }) => {
  7   |         await page.goto('/');
  8   | 
  9   |         await page.getByRole('button', { name: 'Open navigation menu' }).click();
  10  |         const drawer = page.getByRole('dialog');
  11  |         await expect(drawer.getByText('Investigations')).toBeVisible();
  12  | 
  13  |         await drawer.getByText('Investigations').click();
  14  |         await expect(page.getByRole('heading', { name: 'Investigations' })).toBeVisible();
  15  |         await expect(page).toHaveURL(/\/investigations$/);
  16  |         await expect(page.getByRole('dialog')).toHaveCount(0);
  17  |     });
  18  | 
  19  |     test('hamburger menu reaches every section', async ({ page }) => {
  20  |         await page.goto('/');
  21  | 
  22  |         for (const [name, path] of [
  23  |             ['Clients', '/clients'],
  24  |             ['Calendar', '/calendar'],
  25  |             ['Settings', '/settings'],
  26  |             ['Dashboard', '/'],
  27  |         ] as const) {
  28  |             await page.getByRole('button', { name: 'Open navigation menu' }).click();
  29  |             const drawer = page.getByRole('dialog');
  30  |             await drawer.getByText(name, { exact: true }).click();
  31  |             await expect(page.getByRole('heading', { name })).toBeVisible();
  32  |             if (path === '/') {
  33  |                 await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  34  |             } else {
  35  |                 await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
  36  |             }
  37  |         }
  38  |     });
  39  | 
  40  |     test('renders the brand link in the header on small screens', async ({ page }) => {
  41  |         await page.setViewportSize({ width: 480, height: 800 });
  42  |         await page.goto('/');
  43  |         await expect(page.getByRole('link', { name: 'Go to dashboard' })).toBeVisible();
  44  |     });
  45  | });
  46  | 
  47  | test.describe('header', () => {
  48  |     test('shows the signed-in profile avatar with name and role', async ({ page }) => {
  49  |         await page.goto('/');
> 50  |         await expect(page.getByText('Deborah Whitfield')).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  51  |         await expect(page.getByText('Lead Investigator')).toBeVisible();
  52  |         await expect(page.getByText('DW', { exact: true })).toBeVisible();
  53  |     });
  54  | 
  55  |     test('opens the profile menu with mock sign-out', async ({ page }) => {
  56  |         await page.goto('/');
  57  |         await page.getByRole('button', { name: /Deborah Whitfield/i }).click();
  58  |         await expect(page.getByText('deborah.whitfield@prototype.local')).toBeVisible();
  59  | 
  60  |         await page.getByText('Sign out').click();
  61  |         await expect(page.getByText(/Sign-out is disabled in the prototype/i)).toBeVisible();
  62  |     });
  63  | 
  64  |     test('toggles dark mode on and off', async ({ page }) => {
  65  |         await page.goto('/');
  66  |         await page.getByRole('button', { name: /switch to dark mode/i }).click();
  67  | 
  68  |         await expect(page.locator('html')).toHaveClass(/dark/);
  69  |         await expect.poll(() => page.evaluate(() => localStorage.getItem('spa-theme'))).toBe('dark');
  70  | 
  71  |         await page.getByRole('button', { name: /switch to light mode/i }).click();
  72  |         await expect(page.locator('html')).not.toHaveClass(/dark/);
  73  |     });
  74  | 
  75  |     test('shows unread notification count derived from system data and supports mark all read', async ({ page }) => {
  76  |         await page.goto('/');
  77  | 
  78  |         const bell = page.locator('button[aria-label^="Notifications"]');
  79  |         await expect(bell).toHaveAttribute('aria-label', /notifications \(\d+ unread\)/i);
  80  | 
  81  |         await bell.click();
  82  |         await expect(page.getByText(/Interview (scheduled|rescheduled) —/).first()).toBeVisible();
  83  |         await expect(page.getByText(/New evidence awaiting review|Evidence review in progress/).first()).toBeVisible();
  84  | 
  85  |         await page.getByRole('button', { name: 'Mark all read' }).click();
  86  |         // With zero unread, the "(N unread)" suffix drops from the aria-label.
  87  |         await expect(bell).toHaveAttribute('aria-label', 'Notifications', { timeout: 5000 });
  88  |     });
  89  | });
  90  | 
  91  | test.describe('regression: matter navigation from the investigations list', () => {
  92  |     test('opens the workspace instead of an error when a matter row is clicked', async ({ page }) => {
  93  |         await page.goto('/investigations');
  94  | 
  95  |         const row = page.getByText('Harassment allegations — Engineering department');
  96  |         await expect(row).toBeVisible();
  97  | 
  98  |         await row.click();
  99  |         await expect(page.getByText('Target completion')).toBeVisible();
  100 |         await expect(page.getByText('Matter not found.')).toHaveCount(0);
  101 |         await expect(page).toHaveURL(/\/investigations\/inv-001\/overview$/);
  102 |     });
  103 | 
  104 |     test('navigates between workspace tabs without crashing', async ({ page }) => {
  105 |         await page.goto('/investigations/inv-001');
  106 |         await expect(page.getByText('Target completion')).toBeVisible();
  107 | 
  108 |         await page.getByRole('link', { name: 'Timeline' }).click();
  109 |         await expect(page.getByText('Complaint received').first()).toBeVisible();
  110 |         await expect(page).toHaveURL(/\/investigations\/inv-001\/timeline$/);
  111 | 
  112 |         await page.getByRole('link', { name: 'Findings' }).click();
  113 |         await expect(page.getByText('Supporting evidence').first()).toBeVisible();
  114 | 
  115 |         await page.getByRole('link', { name: 'Reports' }).click();
  116 |         await expect(page.getByText('Draft').first()).toBeVisible();
  117 |     });
  118 | });
  119 | 
```