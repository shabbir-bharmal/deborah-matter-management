# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: e2e\auth.setup.ts:9:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Dashboard' })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Dashboard' })
  - Test timeout of 30000ms exceeded.

```

```yaml
- banner:
  - link "Go to dashboard":
    - /url: /
    - img
    - text: Investigation Management
  - button "Switch to dark mode":
    - img
  - button "Notifications":
    - img
  - button "AM Alex Mercer Administrator":
    - text: AM Alex Mercer Administrator
    - img
  - navigation "Main navigation":
    - link "Dashboard":
      - /url: /
      - img
      - text: Dashboard
    - link "Investigations":
      - /url: /investigations
      - img
      - text: Investigations
    - link "Clients":
      - /url: /clients
      - img
      - text: Clients
    - link "Calendar":
      - /url: /calendar
      - img
      - text: Calendar
    - link "Display Calendar":
      - /url: /display-calendar
      - img
      - text: Display Calendar
    - link "Administration":
      - /url: /admin
      - img
      - text: Administration
    - link "Settings":
      - /url: /settings
      - img
      - text: Settings
- main:
  - navigation "breadcrumb":
    - list:
      - listitem: Dashboard
- contentinfo:
  - img
  - text: Investigation Management
  - paragraph: Workplace investigation management for modern teams.
  - navigation "Navigate":
    - heading "Navigate" [level=3]
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /
      - listitem:
        - link "Investigations":
          - /url: /investigations
      - listitem:
        - link "Clients":
          - /url: /clients
      - listitem:
        - link "Calendar":
          - /url: /calendar
      - listitem:
        - link "Display Calendar":
          - /url: /display-calendar
      - listitem:
        - link "Administration":
          - /url: /admin
      - listitem:
        - link "Settings":
          - /url: /settings
  - heading "Contact" [level=3]
  - list:
    - listitem:
      - link "compliance@prototype.local":
        - /url: mailto:compliance@prototype.local
    - listitem: Workplace investigation workspace
  - text: © 2026 Investigation Management. All rights reserved. Confidential — for authorised investigators only.
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { expect, test as setup } from '@playwright/test';
  2  | 
  3  | const AUTH_STATE = 'e2e/.auth/investigator.json';
  4  | 
  5  | /**
  6  |  * Signs in once and stores the session cookies for every other spec. Requires
  7  |  * the Laravel API to be running and seeded (`php artisan migrate:fresh --seed`).
  8  |  */
  9  | setup('authenticate', async ({ page }) => {
  10 |     await page.goto('/login');
  11 |     await page.getByLabel('Email address').fill('admin@investigations.test');
  12 |     await page.getByLabel('Password').fill('password');
  13 |     await page.getByRole('button', { name: 'Sign in' }).click();
  14 | 
> 15 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  16 | 
  17 |     await page.context().storageState({ path: AUTH_STATE });
  18 | });
  19 | 
```