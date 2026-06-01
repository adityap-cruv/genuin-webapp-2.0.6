/**
 * @fileoverview
 * Feature: Webapp page rendering
 *
 * Objective:
 * Basic end-to-end test to validate that the webapp home page renders successfully.
 * This serves as a sanity check to ensure the page loads primary sections.
 *
 * @author Genuin Team
 */
import { test, expect } from './_fixtures/mock'

test.describe('Feature: Webapp Page Rendering', () => {
  test('Scenario: Home page renders feed section', async ({ page }) => {
    await test.step('Action: Navigate to the home page', async () => {
      await page.goto('/home')
    })

    await test.step('Result: Primary feed section is visible on the page', async () => {
      const feedSection = page.locator('div[id="gencl-feed-view"]').first()
      await expect(feedSection).toBeVisible({ timeout: 10000 })
    })

    await test.step('Result: Feed renders a video element', async () => {
      const feedVideo = page.locator('#gencl-feed-view video').first()
      await expect(feedVideo).toBeAttached({ timeout: 15000 })
    })
  })
})
