import { expect, test as setup } from '@playwright/test';

const AUTH_STATE = 'e2e/.auth/investigator.json';

/**
 * Signs in once and stores the session cookies for every other spec. Requires
 * the Laravel API to be running and seeded (`php artisan migrate:fresh --seed`).
 */
setup('authenticate', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('admin@investigations.test');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.context().storageState({ path: AUTH_STATE });
});
