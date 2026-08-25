import { expect, test } from '@playwright/test';

test.describe('responsive layout and header', () => {
    test.use({ viewport: { width: 480, height: 900 } });

    test('opens the hamburger drawer and navigates to a section', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        const drawer = page.getByRole('dialog');
        await expect(drawer.getByText('Investigations')).toBeVisible();

        await drawer.getByText('Investigations').click();
        await expect(page.getByRole('heading', { name: 'Investigations' })).toBeVisible();
        await expect(page).toHaveURL(/\/investigations$/);
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    test('hamburger menu reaches every section', async ({ page }) => {
        await page.goto('/');

        for (const [name, path] of [
            ['Clients', '/clients'],
            ['Calendar', '/calendar'],
            ['Settings', '/settings'],
            ['Dashboard', '/'],
        ] as const) {
            await page.getByRole('button', { name: 'Open navigation menu' }).click();
            const drawer = page.getByRole('dialog');
            await drawer.getByText(name, { exact: true }).click();
            await expect(page.getByRole('heading', { name })).toBeVisible();
            if (path === '/') {
                await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
            } else {
                await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
            }
        }
    });

    test('renders the brand link in the header on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 480, height: 800 });
        await page.goto('/');
        await expect(page.getByRole('link', { name: 'Go to dashboard' })).toBeVisible();
    });
});

test.describe('header', () => {
    test('shows the signed-in profile avatar with name and role', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Deborah Whitfield')).toBeVisible();
        await expect(page.getByText('Lead Investigator')).toBeVisible();
        await expect(page.getByText('DW', { exact: true })).toBeVisible();
    });

    test('opens the profile menu with mock sign-out', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /Deborah Whitfield/i }).click();
        await expect(page.getByText('deborah.whitfield@prototype.local')).toBeVisible();

        await page.getByText('Sign out').click();
        await expect(page.getByText(/Sign-out is disabled in the prototype/i)).toBeVisible();
    });

    test('toggles dark mode on and off', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /switch to dark mode/i }).click();

        await expect(page.locator('html')).toHaveClass(/dark/);
        await expect.poll(() => page.evaluate(() => localStorage.getItem('spa-theme'))).toBe('dark');

        await page.getByRole('button', { name: /switch to light mode/i }).click();
        await expect(page.locator('html')).not.toHaveClass(/dark/);
    });

    test('shows unread notification count derived from system data and supports mark all read', async ({ page }) => {
        await page.goto('/');

        const bell = page.locator('button[aria-label^="Notifications"]');
        await expect(bell).toHaveAttribute('aria-label', /notifications \(\d+ unread\)/i);

        await bell.click();
        await expect(page.getByText(/Interview (scheduled|rescheduled) —/).first()).toBeVisible();
        await expect(page.getByText(/New evidence awaiting review|Evidence review in progress/).first()).toBeVisible();

        await page.getByRole('button', { name: 'Mark all read' }).click();
        // With zero unread, the "(N unread)" suffix drops from the aria-label.
        await expect(bell).toHaveAttribute('aria-label', 'Notifications', { timeout: 5000 });
    });
});

test.describe('regression: matter navigation from the investigations list', () => {
    test('opens the workspace instead of an error when a matter row is clicked', async ({ page }) => {
        await page.goto('/investigations');

        const row = page.getByText('Harassment allegations — Engineering department');
        await expect(row).toBeVisible();

        await row.click();
        await expect(page.getByText('Target completion')).toBeVisible();
        await expect(page.getByText('Matter not found.')).toHaveCount(0);
        await expect(page).toHaveURL(/\/investigations\/inv-001\/overview$/);
    });

    test('navigates between workspace tabs without crashing', async ({ page }) => {
        await page.goto('/investigations/inv-001');
        await expect(page.getByText('Target completion')).toBeVisible();

        await page.getByRole('link', { name: 'Timeline' }).click();
        await expect(page.getByText('Complaint received').first()).toBeVisible();
        await expect(page).toHaveURL(/\/investigations\/inv-001\/timeline$/);

        await page.getByRole('link', { name: 'Findings' }).click();
        await expect(page.getByText('Supporting evidence').first()).toBeVisible();

        await page.getByRole('link', { name: 'Reports' }).click();
        await expect(page.getByText('Draft').first()).toBeVisible();
    });
});
