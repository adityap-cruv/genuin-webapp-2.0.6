/**
 * @fileoverview Feature: SDK Visual Regression — Floating (PiP) layout.
 * Captures a viewport screenshot of the PiP widget after the embed scrolls off-screen.
 * Determinism comes from MSW fixtures + sanitize() FORCE_VALUES disabling autoplay.
 */

import type { Page } from '@playwright/test'

import { test, expect } from '../../../fixtures/msw.fixture'
import { setupFloatingEmbed } from '../../../helpers/floating-embed.helper'
import { loadTestPage } from '../../../helpers/page.helper'
import {
  pinThumbnailPosters,
  waitForMSWReady,
  waitForPipVisible,
  waitForSDK,
} from '../../../helpers/sdk-wait.helper'

test.describe('Feature: SDK Visual Regression — Floating (PiP) Layout', () => {
  let sharedPage: Page

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage()
    await test.step('Setup: Load base test environment', async () => {
      await loadTestPage(sharedPage)
      await waitForMSWReady(sharedPage)
    })
  })

  test.afterEach(async () => {
    await sharedPage.reload({ waitUntil: 'domcontentloaded' })
    await waitForSDK(sharedPage)
    await waitForMSWReady(sharedPage)
  })

  test.afterAll(async () => {
    await sharedPage.close()
  })

  test('Scenario: SDK renders PiP widget correctly for embed_floating layout', async () => {
    await setupFloatingEmbed(sharedPage)

    await test.step('Action: Scroll embed out of viewport to trigger PiP', async () => {
      await sharedPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await waitForPipVisible(sharedPage)
    })

    await test.step('Result: Visual snapshot of PiP widget matches baseline', async () => {
      await pinThumbnailPosters(sharedPage)
      // Viewport screenshot (no fullPage) captures the fixed-position PiP at bottom-right.
      await expect(sharedPage).toHaveScreenshot('embed-floating-pip.png', { animations: 'disabled' })
    })
  })
})
