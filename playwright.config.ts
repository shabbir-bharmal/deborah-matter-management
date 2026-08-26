import { defineConfig, devices } from '@playwright/test';

/** Session captured by e2e/auth.setup.ts and reused by every spec. */
const AUTH_STATE = 'e2e/.auth/investigator.json';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5174',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: AUTH_STATE },
            dependencies: ['setup'],
        },
    ],
    webServer: {
        command: 'npm run dev:spa',
        url: 'http://localhost:5174',
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
