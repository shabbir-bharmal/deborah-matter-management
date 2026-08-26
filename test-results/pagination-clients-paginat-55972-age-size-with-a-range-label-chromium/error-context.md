# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pagination.spec.ts >> clients pagination >> shows at most the default page size with a range label
- Location: e2e\pagination.spec.ts:125:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  17  | 
  18  |     async function showingText(page: import('@playwright/test').Page): Promise<string> {
  19  |         return (await page.getByText(SHOWING).textContent()) ?? '';
  20  |     }
  21  | 
  22  |     test('defaults to 10 rows per page with a correct range label', async ({ page }) => {
  23  |         await expect(rows(page).first()).toBeVisible();
  24  |         expect(await rows(page).count()).toBeLessThanOrEqual(10);
  25  | 
  26  |         const total = totalFrom(await showingText(page));
  27  |         if (total > 10) {
  28  |             await expect(page.getByText('Showing 1-10 of')).toBeVisible();
  29  |             await expect(page.getByRole('link', { name: 'Go to page 2' })).toBeVisible();
  30  |         } else {
  31  |             await expect(page.getByText(`Showing 1-${total} of ${total}`)).toBeVisible();
  32  |         }
  33  |     });
  34  | 
  35  |     test('changing the page size to 100 shows every matter on one page', async ({ page }) => {
  36  |         const total = totalFrom(await showingText(page));
  37  | 
  38  |         await page.getByLabel('Per page').selectOption('100');
  39  |         await expect(rows(page)).toHaveCount(total);
  40  |         await expect(page.getByText(`Showing 1-${total} of ${total}`)).toBeVisible();
  41  |         await expect(page).toHaveURL(/pageSize=100/);
  42  |     });
  43  | 
  44  |     test('numbered pager buttons navigate and update the URL', async ({ page }) => {
  45  |         const total = totalFrom(await showingText(page));
  46  |         test.skip(total <= 20, 'needs more than two pages of data');
  47  | 
  48  |         await page.getByRole('link', { name: 'Go to page 2' }).click();
  49  |         await expect(page).toHaveURL(/[?&]page=2/);
  50  |         await expect(page.getByText('Showing 11-')).toBeVisible();
  51  |         await expect(rows(page).first()).not.toHaveCount(0);
  52  | 
  53  |         await page.getByRole('link', { name: 'Go to previous page' }).click();
  54  |         await expect(page.getByText('Showing 1-10 of')).toBeVisible();
  55  | 
  56  |         await page.getByRole('link', { name: 'Go to page 2' }).click();
  57  |         await page.getByRole('link', { name: 'Go to next page' }).click();
  58  |         await expect(page.getByText('Showing 21-')).toBeVisible();
  59  |     });
  60  | 
  61  |     test('the current page button is marked with aria-current', async ({ page }) => {
  62  |         await expect(page.getByRole('link', { name: 'Go to page 1' })).toHaveAttribute('aria-current', 'page');
  63  |     });
  64  | 
  65  |     test('the active page appears in the pager when navigating past it', async ({ page }) => {
  66  |         const total = totalFrom(await showingText(page));
  67  |         const totalPages = Math.max(1, Math.ceil(total / 10));
  68  |         test.skip(totalPages < 3, 'needs at least three pages of data');
  69  | 
  70  |         // Walk to page 3 using Next (pages 3+ are hidden behind the ellipsis on load).
  71  |         await page.getByRole('link', { name: 'Go to page 2' }).click();
  72  |         await page.getByRole('link', { name: 'Go to next page' }).click();
  73  | 
  74  |         const page3 = page.getByRole('link', { name: 'Go to page 3' });
  75  |         await expect(page3).toBeVisible();
  76  |         await expect(page3).toHaveAttribute('aria-current', 'page');
  77  |     });
  78  | 
  79  |     test('shows a compact pager: first two pages, ellipsis, then the last page', async ({ page }) => {
  80  |         const total = totalFrom(await showingText(page));
  81  |         const totalPages = Math.max(1, Math.ceil(total / 10));
  82  |         test.skip(totalPages <= 3, 'needs more than three pages to hide anything');
  83  | 
  84  |         // Exactly three page links plus the ellipsis marker.
  85  |         await expect(page.getByRole('link', { name: 'Go to page 1' })).toBeVisible();
  86  |         await expect(page.getByRole('link', { name: 'Go to page 2' })).toBeVisible();
  87  |         await expect(page.getByRole('link', { name: `Go to page ${totalPages}` })).toBeVisible();
  88  |         await expect(page.getByText('…')).toHaveCount(1);
  89  | 
  90  |         const pageNumberLinks = page.locator('a[data-slot="pagination-link"][aria-label^="Go to page"]');
  91  |         expect(await pageNumberLinks.count()).toBe(3);
  92  |         expect(await page.getByRole('link', { name: 'Go to page 3' }).count()).toBe(totalPages === 3 ? 1 : 0);
  93  |     });
  94  | 
  95  |     test('an out-of-range page param falls back to the last available page', async ({ page }) => {
  96  |         await page.goto('/investigations?page=999');
  97  |         const label = await showingText(page);
  98  |         // The range must end exactly at the total, never beyond it.
  99  |         const end = Number(label.match(/-(\d+) of/)?.[1]);
  100 |         expect(end).toBe(totalFrom(label));
  101 |     });
  102 | 
  103 |     test('applying a filter resets back to page 1', async ({ page }) => {
  104 |         const total = totalFrom(await showingText(page));
  105 |         test.skip(total <= 20, 'needs more than two pages of data');
  106 | 
  107 |         await page.getByRole('link', { name: 'Go to page 2' }).click();
  108 |         await expect(page).toHaveURL(/[?&]page=2/);
  109 |         await page.getByRole('button', { name: 'Active', exact: true }).click();
  110 |         await expect(page).toHaveURL(/filter=active/);
  111 |         await expect(page).not.toHaveURL(/page=/);
  112 |         await expect(page.getByText('Showing 1-')).toBeVisible();
  113 |     });
  114 | });
  115 | 
  116 | test.describe('clients pagination', () => {
> 117 |     test.beforeEach(async ({ page }) => {
      |          ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  118 |         await page.goto('/clients');
  119 |     });
  120 | 
  121 |     function cards(page: import('@playwright/test').Page) {
  122 |         return page.getByTestId('client-grid').locator('a');
  123 |     }
  124 | 
  125 |     test('shows at most the default page size with a range label', async ({ page }) => {
  126 |         await expect(cards(page).first()).toBeVisible();
  127 |         expect(await cards(page).count()).toBeLessThanOrEqual(10);
  128 |         await expect(page.getByText(SHOWING)).toBeVisible();
  129 |     });
  130 | 
  131 |     test('changing the page size shows all clients on one page', async ({ page }) => {
  132 |         const total = totalFrom((await page.getByText(SHOWING).textContent()) ?? '');
  133 | 
  134 |         await page.getByLabel('Per page').selectOption('50');
  135 |         await expect(cards(page)).toHaveCount(total);
  136 |         await expect(page).toHaveURL(/pageSize=50/);
  137 |     });
  138 | 
  139 |     test('pager navigation updates the URL and visible slice', async ({ page }) => {
  140 |         const total = totalFrom((await page.getByText(SHOWING).textContent()) ?? '');
  141 |         test.skip(total <= 20, 'needs more than two pages of data');
  142 | 
  143 |         const firstPageFirstClient = await cards(page).first().textContent();
  144 |         await page.getByRole('link', { name: 'Go to page 2' }).click();
  145 |         await expect(page).toHaveURL(/[?&]page=2/);
  146 |         await expect(page.getByText('Showing 11-')).toBeVisible();
  147 |         await expect(cards(page).first().textContent()).resolves.not.toBe(firstPageFirstClient);
  148 |     });
  149 | });
  150 | 
```