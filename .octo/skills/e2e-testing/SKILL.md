---
name: e2e-testing
description: Write, fix, and review Playwright end-to-end and integration tests using the Page Object Model. Use when adding or debugging E2E/integration tests, page objects, selectors, or full user-flow tests in apps/webapp/e2e or the web-sdk. Do NOT use for unit or component tests (use test-runner) or for debugging non-test application bugs (use debug).
---

# E2E Testing

**When to use:** Writing, fixing, or reviewing Playwright end-to-end and integration tests — page objects, selectors, full user-flow tests in `apps/webapp/e2e` or the web-sdk.

**Do NOT use for:** Unit or component tests (use the `test-runner` skill) or debugging non-test application bugs (use the `debug` skill).

---

## Stack & commands

- **Framework:** Playwright
- **Config:** `playwright.config.ts` at the repo root
- **Test location:** `apps/webapp/e2e/`
- **Page objects:** `apps/webapp/e2e/pages/`

> `apps/webapp/e2e/` does not exist yet. Create it before writing the first test.
> There is no `test:e2e` script in `apps/webapp/package.json` yet.
> Add `"test:e2e": "playwright test"` when creating the first test.

```bash
# Run all E2E tests
pnpm --filter @genuin/webapp test:e2e

# Run a single file
pnpm --filter @genuin/webapp test:e2e apps/webapp/e2e/auth.spec.ts

# Run headed (visible browser — useful for debugging)
pnpm --filter @genuin/webapp test:e2e --headed

# Interactive UI mode
pnpm --filter @genuin/webapp test:e2e --ui
```

---

## Selector priority

Always pick selectors in this order. Stop at the first one that works.

| Priority | Method                                 | When to use                                      |
| -------- | -------------------------------------- | ------------------------------------------------ |
| 1        | `getByTestId('...')`                   | Default for all interactive elements             |
| 2        | `getByRole('button', { name: '...' })` | Buttons, links, inputs without testid            |
| 3        | `getByLabel('...')`                    | Form inputs                                      |
| 4        | `getByText('...')`                     | Content assertions only — never for interactions |
| 5        | CSS / tag selectors                    | Never use alone                                  |

If a `data-testid` is missing, add it to the component source. That is always the right
fix — never work around it with a fragile CSS selector.

---

## Page Object Model

Use POM for any flow with 3 or more interactions.

### File location

```
apps/webapp/e2e/pages/<PageName>.page.ts
```

### Structure rules

- Named export (not default)
- Constructor receives `page: Page`
- **Actions** — methods that do things: `fillEmail()`, `clickSubmit()`
- **Assertions** — methods that verify things: `expectErrorVisible()`, `expectOnDashboard()`
- Never put `expect()` inside an action method — keep them separate

### Template

```ts
import { type Page, expect } from "@playwright/test";

export class LoginPage {
  private readonly emailInput = this.page.getByTestId("login-email");
  private readonly passwordInput = this.page.getByTestId("login-password");
  private readonly submitButton = this.page.getByTestId("login-submit");
  private readonly errorMessage = this.page.getByTestId("login-error");

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectErrorVisible(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectRedirectedTo(path: string) {
    await expect(this.page).toHaveURL(path);
  }
}
```

---

## Test file structure

```ts
import { test } from "@playwright/test";
import { LoginPage } from "./pages/Login.page";

// What this file covers:
// 1. Successful login redirects to dashboard
// 2. Invalid credentials show error message
// 3. Empty form shows validation errors

test.describe("login flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("redirects to dashboard on valid credentials", async () => {
    await loginPage.fillEmail(process.env.E2E_USER_EMAIL!);
    await loginPage.fillPassword(process.env.E2E_USER_PASSWORD!);
    await loginPage.submit();
    await loginPage.expectRedirectedTo("/dashboard");
  });

  test("shows error on invalid credentials", async () => {
    await loginPage.fillEmail("wrong@example.com");
    await loginPage.fillPassword("wrong-password");
    await loginPage.submit();
    await loginPage.expectErrorVisible("Invalid email or password");
  });
});
```

---

## Timing rules — no `waitForTimeout()`, ever

| Instead of                        | Use                                        |
| --------------------------------- | ------------------------------------------ |
| `await page.waitForTimeout(1000)` | `await expect(locator).toBeVisible()`      |
| `await page.waitForTimeout(500)`  | `await expect(locator).toHaveText('...')`  |
| Waiting for navigation            | `await page.waitForURL('/dashboard')`      |
| Waiting for a network call        | `await page.waitForResponse('**/api/...')` |

If a test is flaky, find the real async event and wait for that specifically. A timeout
is always papering over a missing wait — it does not fix the root cause.

---

## Authentication setup (NextAuth v5)

Never log in through the UI in every test — it is slow and brittle. Use Playwright's
storage state to inject a pre-authenticated session once:

```ts
// apps/webapp/e2e/auth.setup.ts — runs once before authenticated tests
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(process.env.E2E_USER_EMAIL!);
  await page.getByTestId("login-password").fill(process.env.E2E_USER_PASSWORD!);
  await page.getByTestId("login-submit").click();
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
```

```ts
// In playwright.config.ts — define an authenticated project
{
  name: 'authenticated',
  use: { storageState: 'e2e/.auth/user.json' },
  dependencies: ['setup'],
}
```

Add `e2e/.auth/` to `.gitignore` — these files contain session tokens.

Credentials must come from environment variables. Required env vars:

- `E2E_USER_EMAIL` — test account email
- `E2E_USER_PASSWORD` — test account password

---

## Test independence checklist

Before committing any test file, verify:

- [ ] Each `test()` passes when run in isolation (`--grep "test name"`)
- [ ] No shared mutable variables between tests (use `beforeEach` to reset)
- [ ] No dependency on data created by a previous test
- [ ] No `waitForTimeout()` anywhere in the file
- [ ] All selectors use `data-testid`, role, or label — no CSS classes
- [ ] Credentials come from `process.env`, not hardcoded strings
- [ ] `data-testid` attributes exist on all interactive elements referenced in tests
