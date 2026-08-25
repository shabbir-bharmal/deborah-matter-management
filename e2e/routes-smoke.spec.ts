import { expect, test } from '@playwright/test';

test.describe('route smoke tests', () => {
    for (const [url, heading] of [
        ['/', 'Dashboard'],
        ['/investigations', 'Investigations'],
        ['/clients', 'Clients'],
        ['/calendar', 'Calendar'],
        ['/display-calendar', 'Display Calendar'],
        ['/settings', 'Settings'],
    ] as const) {
        test(`renders ${url}`, async ({ page }) => {
            await page.goto(url);
            await expect(page.getByRole('heading', { name: heading })).toBeVisible();
        });
    }

    test('renders a 404 page for unknown routes', async ({ page }) => {
        await page.goto('/this-route-does-not-exist');
        await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    });

    for (const [url, title] of [
        ['/investigations/inv-001', 'Harassment allegations — Engineering department'],
        ['/investigations/inv-002', 'Discrimination claim — promotion process'],
        ['/investigations/inv-003', 'Expense report misconduct — regional sales'],
    ] as const) {
        test(`deep-links to matter workspace ${url} without crashing`, async ({ page }) => {
            await page.goto(url);
            await expect(page.getByRole('heading', { name: title })).toBeVisible();
            await expect(page.getByText('Target completion')).toBeVisible();
        });
    }

    test('redirects bare matter URLs to the overview tab', async ({ page }) => {
        await page.goto('/investigations/inv-001');
        const overviewTab = page.getByRole('link', { name: 'Overview' }).first();
        await expect(overviewTab).toHaveAttribute('aria-current', 'page');
    });

    test('deep-links to workspace tab /investigations/inv-001/timeline with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/timeline');
        await expect(page.getByText('Complaint received').first()).toBeVisible();
    });

    test('deep-links to workspace tab /investigations/inv-001/interviews with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/interviews');
        await expect(page.getByText('Sarah Okafor').first()).toBeVisible();
    });

    test('deep-links to workspace tab /investigations/inv-001/evidence with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/evidence');
        await expect(page.getByText(/Stand-up meeting recording/i).first()).toBeVisible();
    });

    test('deep-links to workspace tab /investigations/inv-001/findings with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/findings');
        await expect(page.getByText('Supporting evidence').first()).toBeVisible();
    });

    test('deep-links to workspace tab /investigations/inv-001/documents with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/documents');
        await expect(page.getByText('Interview transcript — Sarah Okafor')).toBeVisible();
    });

    test('deep-links to workspace tab /investigations/inv-001/reports with real content', async ({ page }) => {
        await page.goto('/investigations/inv-001/reports');
        await expect(page.getByText(/1\. Matter summary/i)).toBeVisible();
    });

    test('shows matter not found for an unknown investigation id', async ({ page }) => {
        await page.goto('/investigations/does-not-exist');
        await expect(page.getByText('Matter not found.')).toBeVisible();
    });

    test('renders the client portal for a known client', async ({ page }) => {
        await page.goto('/clients/northwind-logistics');
        await expect(page.getByRole('heading', { name: 'Northwind Logistics' })).toBeVisible();
        await expect(page.getByText(/Client-visible documents/i).first()).toBeVisible();
    });

    test('shows client not found for an unknown client', async ({ page }) => {
        await page.goto('/clients/unknown-corp');
        await expect(page.getByText('Client not found.')).toBeVisible();
    });
});
