/**
 * @fileoverview Feature: SDK Visual Regression — Carousel layout.
 * Captures a baseline screenshot of the carousel embed and diffs against the on-disk baseline.
 * Determinism comes from MSW fixtures + sanitize() FORCE_VALUES disabling autoplay.
 */

import type { Page } from '@playwright/test'

import { EMBED_LAYOUT_DATA } from '../../../data/init'
import { test, expect } from '../../../fixtures/msw.fixture'
import { loadTestPage } from '../../../helpers/page.helper'
import { createSDKContainer } from '../../../helpers/sdk-container.helper'
import { initWithDataAttributes } from '../../../helpers/sdk-init.helper'
import {
  pinThumbnailPosters,
  waitForMSWReady,
  waitForSDK,
  waitForSDKRender,
} from '../../../helpers/sdk-wait.helper'

test.describe('Feature: SDK Visual Regression — Carousel Layout', () => {
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

  test('Scenario: SDK renders correctly for carousel layout', async () => {
    const layoutData = EMBED_LAYOUT_DATA.carousel

    await test.step('Setup: Create SDK container with dimensions for carousel', async () => {
      await createSDKContainer(sharedPage, {
        id: 'gen-sdk',
        className: 'gen-sdk-class',
        style: layoutData.style,
      })
    })

    await test.step('Action: Initialize SDK with carousel embed_id and api_key', async () => {
      await initWithDataAttributes(sharedPage, layoutData)
    })

    await test.step('Result: SDK renders video content inside the container', async () => {
      await waitForSDKRender(sharedPage)
    })

    await test.step('Result: Visual snapshot matches baseline', async () => {
      await pinThumbnailPosters(sharedPage)
      const container = sharedPage.locator('[data-genuin-host="true"]')
      await expect(container).toHaveScreenshot('carousel.png', { animations: 'disabled' })
    })
  })
})
