/**
 * @fileoverview Playwright fixture that gates on MSW worker readiness.
 *
 * Use the exported `test` instead of `@playwright/test`'s base `test` for any
 * spec that needs mocked network responses. The fixture loads
 * `index-test.html` and asserts that `window.__MSW_READY__` is true before
 * yielding the page, so no SDK request can race the worker.
 */
import { test as base, expect, type Page } from '@playwright/test'

import { loadTestPage } from '../helpers/page.helper'

interface MswFixtures {
  mswPage: Page
}

export const test = base.extend<MswFixtures>({
  mswPage: async ({ page }, use) => {
    await loadTestPage(page)
    await page.waitForFunction(
      () =>
        (window as unknown as { __MSW_READY__?: boolean }).__MSW_READY__ ===
        true,
      undefined,
      { timeout: 10_000 },
    )
    await use(page)
  },
})

export { expect }
