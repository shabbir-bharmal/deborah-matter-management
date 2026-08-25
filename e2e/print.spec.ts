import { expect, test } from '@playwright/test';

async function stubPrintDialog(page: import('@playwright/test').Page) {
    await page.addInitScript(() => {
        (window as unknown as { __printCalls: number }).__printCalls = 0;
        window.print = () => {
            (window as unknown as { __printCalls: number }).__printCalls += 1;
        };
    });
}

const printCalls = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls);

test.describe('report print / PDF functionality', () => {
    test.beforeEach(async ({ page }) => {
        await stubPrintDialog(page);
        await page.goto('/investigations/inv-001/reports');
    });

    test('calls window.print() when the Print / PDF button is clicked', async ({ page }) => {
        await page.getByRole('button', { name: /Print \/ PDF/i }).click();
        await expect.poll(() => printCalls(page)).toBe(1);
    });

    test('marks the report card as the print area containing the report content', async ({ page }) => {
        const printArea = page.locator('.print-area');
        await expect(printArea).toBeVisible();
        await expect(printArea.getByText(/1\. Matter summary/i)).toBeVisible();
    });

    test('keeps the toolbar and app chrome out of the printed output', async ({ page }) => {
        // Toolbar and layout chrome carry the print:hidden utility.
        await expect(page.locator('.print-area').locator('xpath=ancestor-or-self::*[contains(@class,"space-y-4")][1]')).toBeVisible();
        const hiddenChrome = page.locator('.print\\:hidden');
        expect(await hiddenChrome.count()).toBeGreaterThan(0);
    });

    test('keeps the print area through the mock final view', async ({ page }) => {
        await page.getByRole('button', { name: 'Preview final view' }).click();
        await expect(page.locator('.print-area')).toBeVisible();
        await expect(page.locator('.print-area').getByText(/Final investigation report/i)).toBeVisible();
    });

    test('relies on print CSS that scopes output to .print-area', async ({ page }) => {
        const found = await page.evaluate(() => {
            for (const sheet of Array.from(document.styleSheets)) {
                let rules: CSSRuleList;
                try {
                    rules = sheet.cssRules;
                } catch {
                    continue;
                }
                const scan = (list: CSSRuleList): boolean => {
                    for (const rule of Array.from(list)) {
                        if (rule instanceof CSSMediaRule && rule.conditionText.includes('print')) {
                            return true;
                        }
                        if (rule.cssText.includes('.print-area')) {
                            return true;
                        }
                    }
                    return false;
                };
                if (scan(rules)) {
                    return true;
                }
            }
            return false;
        });
        expect(found).toBe(true);
    });
});
