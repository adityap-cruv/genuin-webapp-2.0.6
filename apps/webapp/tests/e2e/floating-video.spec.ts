/**
 * @fileoverview
 * Feature: Floating video hand-off
 *
 * Objective:
 * A video expanded in Feed View travels with the user when they navigate away — as the
 * bottom-right floating card — and can be sent back to full size. The card is the same
 * `<video>` node throughout: it is re-framed, never re-created, which is what keeps playback
 * unbroken and the transition free of intermediate states.
 *
 * These cover the cross-root contract (page root ↔ SDK placement root ↔ SDK runtime) that no
 * unit test can reach.
 *
 * @author Genuin Team
 */
import { expect, test } from './_fixtures/mock'
import {
  findCardExpandControl,
  findPill,
  findSidebarLink,
  openFeedView,
  readFloatingState,
  tagPlayers,
} from './_helpers/floating-video'

const HOME = '/home'
/** The card geometry the inline-article floating video uses; the hand-off must match it exactly. */
const CARD = { fromRight: 72, fromBottom: 24, width: 252, height: 448 }

test.describe('Feature: Floating video hand-off', () => {
  test.slow()

  for (const kind of ['community', 'group'] as const) {
    test(`Scenario: A ${kind} pill carries the playing video to its page`, async ({ page }) => {
      await openFeedView(page, HOME)
      await tagPlayers(page)
      const before = await readFloatingState(page)

      const pill = await findPill(page, kind)
      expect(pill, `${kind} pill should be on the active slide`).not.toBeNull()

      await test.step(`Action: Click the ${kind} pill`, async () => {
        await page.mouse.click(pill!.x, pill!.y)
        await page.waitForURL(`**${pill!.href}`, { timeout: 90_000 })
        await page.waitForTimeout(4_000)
      })

      const after = await readFloatingState(page)

      await test.step('Result: The floating card sits where the article card sits', async () => {
        expect(after.floating).toBe(true)
        expect(after.card).toEqual(CARD)
        expect(after.hasCloseButton).toBe(true)
      })

      await test.step('Result: It is the same player, still running', async () => {
        // Identity, not resemblance: a rebuilt player would restart the video.
        expect(after.playerTag).toBe(before.playerTag)
        expect(after.playing).toBe(true)
      })

      await test.step('Result: The destination page is still scrollable', async () => {
        // The expand view holds a body scroll lock while it is a modal. Once it is a card it
        // must release it, or the page underneath cannot be used at all.
        expect(after.scrollLocked).toBe(false)
      })

      await test.step('Result: A further navigation ends the session', async () => {
        await page.goto(HOME, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(3_000)
        expect((await readFloatingState(page)).floating).toBe(false)
      })
    })
  }

  for (const label of ['Latest', 'Popular', 'Explore'] as const) {
    test(`Scenario: The ${label} sidebar link carries the playing video`, async ({ page }) => {
      await openFeedView(page, HOME)
      await tagPlayers(page)
      const before = await readFloatingState(page)

      const link = await findSidebarLink(page, label)
      expect(link, `${label} sidebar link should be visible`).not.toBeNull()

      await page.mouse.click(link!.x, link!.y)
      await page.waitForURL(`**${link!.href}`, { timeout: 90_000 })
      await page.waitForTimeout(4_000)

      const after = await readFloatingState(page)
      expect(after.card).toEqual(CARD)
      expect(after.playerTag).toBe(before.playerTag)
      expect(after.playing).toBe(true)
    })
  }

  test('Scenario: The card can be sent back to Feed View', async ({ page }) => {
    await openFeedView(page, HOME)
    await tagPlayers(page)
    const before = await readFloatingState(page)

    const pill = await findPill(page, 'community')
    expect(pill).not.toBeNull()
    await page.mouse.click(pill!.x, pill!.y)
    await page.waitForURL(`**${pill!.href}`, { timeout: 90_000 })
    await page.waitForTimeout(4_000)

    const control = await findCardExpandControl(page)
    expect(control, 'the card should offer a way back to full size').not.toBeNull()

    await test.step('Action: Click the card expand control', async () => {
      await page.mouse.click(control!.x, control!.y)
      await page.waitForURL(`**${HOME}`, { timeout: 90_000 })
      await page.waitForTimeout(4_000)
    })

    const restored = await readFloatingState(page)

    await test.step('Result: Feed View is open again on the same player', async () => {
      expect(restored.feedViewOpen).toBe(true)
      expect(restored.floating).toBe(false)
      // The retained root is adopted rather than rebuilt, so this is still the tagged node.
      expect(restored.playerTag).toBe(before.playerTag)
      expect(restored.playing).toBe(true)
    })
  })

  test('Scenario: A modifier click opens a new tab instead of handing off', async ({ page }) => {
    await openFeedView(page, HOME)
    const pill = await findPill(page, 'community')
    expect(pill).not.toBeNull()

    await page.keyboard.down('Meta')
    await page.mouse.click(pill!.x, pill!.y)
    await page.keyboard.up('Meta')
    await page.waitForTimeout(2_500)

    const state = await readFloatingState(page)
    expect(state.path).toBe(HOME)
    expect(state.floating).toBe(false)
  })

  test('Scenario: A pill’s join control never hands the video off', async ({ page }) => {
    await openFeedView(page, HOME)

    const joinButton = await page.evaluate(() => {
      const scope = document.querySelector('[data-genuin-light-portal-host][data-portal-key="expand-view"]')
      const buttons = scope?.querySelectorAll(
        '.swiper-slide-active [data-expand-view="true"] a[href^="/community/"] button, .swiper-slide-active [data-expand-view="true"] a[href^="/group/"] button'
      )
      for (const button of buttons ?? []) {
        const rect = button.getBoundingClientRect()
        if (rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
          return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) }
        }
      }
      return null
    })

    // Join/subscribe only render for a signed-in user. Skip rather than pass silently, so the
    // gap is visible in the report instead of looking like coverage.
    test.skip(joinButton === null, 'join control only renders for an authenticated user')

    await page.mouse.click(joinButton!.x, joinButton!.y)
    await page.waitForTimeout(2_500)

    const state = await readFloatingState(page)
    expect(state.path).toBe(HOME)
    expect(state.floating).toBe(false)
  })
})
