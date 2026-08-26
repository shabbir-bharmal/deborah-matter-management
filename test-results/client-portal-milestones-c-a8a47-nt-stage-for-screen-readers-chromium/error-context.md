# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client-portal-milestones.spec.ts >> client portal milestones >> labels the current stage for screen readers
- Location: e2e\client-portal-milestones.spec.ts:35:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('client portal milestones', () => {
> 4  |     test.beforeEach(async ({ page }) => {
     |          ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  5  |         await page.goto('/clients/northwind-logistics');
  6  |     });
  7  | 
  8  |     async function getStepperCount(page: import('@playwright/test').Page): Promise<number> {
  9  |         const steppers = page.locator('ol[aria-label="Matter milestones"]');
  10 |         // Matters load asynchronously — wait for at least one stepper to attach.
  11 |         await expect(steppers.first()).toBeAttached();
  12 |         return steppers.count();
  13 |     }
  14 | 
  15 |     test('renders a five-stage milestone stepper for every displayed matter', async ({ page }) => {
  16 |         await expect(page.getByRole('heading', { name: 'Northwind Logistics' })).toBeVisible();
  17 | 
  18 |         // One labelled stepper <ol> per matter card.
  19 |         const stepperCount = await getStepperCount(page);
  20 |         expect(stepperCount).toBeGreaterThan(0);
  21 | 
  22 |         for (let index = 0; index < stepperCount; index += 1) {
  23 |             const steps = steppers(index, page).locator(':scope > li');
  24 |             await expect(steps).toHaveCount(5);
  25 |             await expect(steps.nth(0).getByText('Intake')).toBeVisible();
  26 |             await expect(steps.nth(4).getByText('Completed')).toBeVisible();
  27 |         }
  28 |     });
  29 | 
  30 |     test('marks exactly one stage as the current step per matter', async ({ page }) => {
  31 |         const stepperCount = await getStepperCount(page);
  32 |         expect(await page.locator('li[aria-current="step"]').count()).toBe(stepperCount);
  33 |     });
  34 | 
  35 |     test('labels the current stage for screen readers', async ({ page }) => {
  36 |         const stepperCount = await getStepperCount(page);
  37 |         expect(await page.getByText(/Current stage:/).count()).toBe(stepperCount);
  38 |     });
  39 | });
  40 | 
  41 | function steppers(index: number, page: import('@playwright/test').Page) {
  42 |     return page.locator('ol[aria-label="Matter milestones"]').nth(index);
  43 | }
  44 | 
```