import type { Page } from '@playwright/test'

/**
 * Helpers for the floating-video hand-off.
 *
 * Everything is located through the cross-root contract the feature itself depends on — the
 * `data-genuin-floating-video` host, the shared `[data-feed-video-frame]` card and the SDK's
 * expand portal — so these break exactly when the feature does, rather than on styling.
 */

export const FLOATING_HOST = '[data-genuin-floating-video="true"]'
export const EXPAND_HOST = '[data-genuin-light-portal-host][data-portal-key="expand-view"]'
export const FEED_VIEW_MARKER = '[data-home-feed-view="true"]'

/** Opens the bounded Feed View by clicking a placement's video, as a user would. */
export async function openFeedView(page: Page, route: string): Promise<void> {
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  const tile = page.locator('div.gen-sdk-class[data-placement-id] video').first()
  await tile.waitFor({ state: 'attached', timeout: 120_000 })
  await tile.scrollIntoViewIfNeeded()
  await page.waitForTimeout(3_000)
  const box = await tile.boundingBox()
  if (!box) throw new Error('placement tile has no layout box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await page.locator(FEED_VIEW_MARKER).first().waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForTimeout(4_000)
}

/** Tags every player in the expand portal so a later assertion can prove it is the same node. */
export async function tagPlayers(page: Page): Promise<void> {
  await page.evaluate((host) => {
    document.querySelector(host)?.querySelectorAll('video').forEach((video, index) => {
      ;(video as HTMLVideoElement).dataset.e2eTag = `player-${index}`
    })
  }, EXPAND_HOST)
}

type Pill = { href: string; x: number; y: number }

/** The community or group pill of the slide currently on screen. */
export async function findPill(page: Page, kind: 'community' | 'group'): Promise<Pill | null> {
  return page.evaluate(
    ([host, type]) => {
      const scope = document.querySelector(host)
      const links = scope?.querySelectorAll(`.swiper-slide-active [data-expand-view="true"] a[href^="/${type}/"]`)
      for (const link of links ?? []) {
        const rect = link.getBoundingClientRect()
        if (rect.width > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
          return { href: link.getAttribute('href') ?? '', x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) }
        }
      }
      return null
    },
    [EXPAND_HOST, kind] as const
  )
}

/** A first-party sidebar destination, by its visible label. */
export async function findSidebarLink(page: Page, label: string): Promise<Pill | null> {
  return page.evaluate((text) => {
    for (const link of document.querySelectorAll('a')) {
      if ((link.textContent ?? '').trim() !== text) continue
      const rect = link.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        return { href: link.getAttribute('href') ?? '', x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) }
      }
    }
    return null
  }, label)
}

/** The card's expand affordance — "put this video back full size". */
export async function findCardExpandControl(page: Page): Promise<{ x: number; y: number } | null> {
  return page.evaluate((host) => {
    const frame = document.querySelector(`${host} [data-feed-video-frame]`)
    for (const node of frame?.querySelectorAll('*') ?? []) {
      if (node.getAttribute('aria-label') !== 'Back to Feed View') continue
      const rect = node.getBoundingClientRect()
      if (rect.width > 0) return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) }
    }
    return null
  }, FLOATING_HOST)
}

export type FloatingState = {
  path: string
  floating: boolean
  feedViewOpen: boolean
  card: { fromRight: number; fromBottom: number; width: number; height: number } | null
  playerTag: string | null
  playing: boolean | null
  hasCloseButton: boolean
  scrollLocked: boolean
}

export async function readFloatingState(page: Page): Promise<FloatingState> {
  return page.evaluate(
    ([host, expandHost, marker]) => {
      const floatingHost = document.querySelector(host)
      const frame = floatingHost?.querySelector('[data-feed-video-frame]')
      const rect = frame?.getBoundingClientRect()
      const video = (floatingHost ?? document.querySelector(expandHost))?.querySelector('.swiper-slide-active video') as
        | HTMLVideoElement
        | null
      return {
        path: window.location.pathname,
        floating: Boolean(floatingHost),
        feedViewOpen: Boolean(document.querySelector(marker)) && Boolean(document.querySelector(expandHost)),
        card: rect
          ? {
              fromRight: Math.round(window.innerWidth - rect.right),
              fromBottom: Math.round(window.innerHeight - rect.bottom),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            }
          : null,
        playerTag: video?.dataset.e2eTag ?? null,
        playing: video ? !video.paused : null,
        hasCloseButton: Boolean(document.querySelector(`${host} [data-slot="inline-video-close"]`)),
        scrollLocked: document.body.hasAttribute('data-scroll-locked'),
      }
    },
    [FLOATING_HOST, EXPAND_HOST, FEED_VIEW_MARKER] as const
  )
}
