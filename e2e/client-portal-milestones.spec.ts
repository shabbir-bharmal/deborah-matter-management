import { expect, test } from '@playwright/test';

test.describe('client portal milestones', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/clients/northwind-logistics');
    });

    async function getStepperCount(page: import('@playwright/test').Page): Promise<number> {
        const steppers = page.locator('ol[aria-label="Matter milestones"]');
        // Matters load asynchronously — wait for at least one stepper to attach.
        await expect(steppers.first()).toBeAttached();
        return steppers.count();
    }

    test('renders a five-stage milestone stepper for every displayed matter', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Northwind Logistics' })).toBeVisible();

        // One labelled stepper <ol> per matter card.
        const stepperCount = await getStepperCount(page);
        expect(stepperCount).toBeGreaterThan(0);

        for (let index = 0; index < stepperCount; index += 1) {
            const steps = steppers(index, page).locator(':scope > li');
            await expect(steps).toHaveCount(5);
            await expect(steps.nth(0).getByText('Intake')).toBeVisible();
            await expect(steps.nth(4).getByText('Completed')).toBeVisible();
        }
    });

    test('marks exactly one stage as the current step per matter', async ({ page }) => {
        const stepperCount = await getStepperCount(page);
        expect(await page.locator('li[aria-current="step"]').count()).toBe(stepperCount);
    });

    test('labels the current stage for screen readers', async ({ page }) => {
        const stepperCount = await getStepperCount(page);
        expect(await page.getByText(/Current stage:/).count()).toBe(stepperCount);
    });
});

function steppers(index: number, page: import('@playwright/test').Page) {
    return page.locator('ol[aria-label="Matter milestones"]').nth(index);
}
