import type { Locator, Page } from "@playwright/test";

/**
 * Returns mask locators for all dynamic/user-specific content in the feed view
 * (PostSidePanel + video player overlays). Pass directly to toHaveScreenshot({ mask }).
 *
 * Use for any visual regression test that renders the standard feed layout so that
 * user-generated text, avatars, and counts don't cause false-positive diffs.
 */
export function getFeedVisualMasks(page: Page): Locator[] {
  return [
    // --- PostSidePanel (right column) ---

    // Avatar images across the whole panel
    page.locator('[data-slot="avatar-image"]'),
    // Audio comment players
    page.locator('.comment [class*="h-14"]'),
    // Non-avatar media images inside comments (GIFs, attachments)
    page.locator('.comment img:not([data-slot="avatar-image"])'),
    // Post author name — scoped to <a> to avoid matching the video player area
    page.locator('a p[class*="text-body-0-semi-bold"]'),
    // Post author timestamp
    page.locator('[class*="text-body-1-medium"][class*="text-secondary-600"]'),
    // Commenter nickname
    page.locator('.comment [class*="text-body-1-semi-bold"]'),
    // Commenter timestamp
    page.locator('.comment [class*="text-secondary-500"]'),
    // Comment body text — ReadMore stamps swiper-no-swiping on its inner <p>
    page.locator(".comment .swiper-no-swiping"),
    // Comment spark counts
    page.locator('.comment [class*="text-body-2-medium"][class*="text-secondary-600"]'),
    // Pill name text — mask only the span; keep pill wrapper visible for layout regressions
    page.locator('[class*="rounded-full"] span[class*="text-body-2-medium"]'),
    // Group pill SVG icon (not a CDN <img>, so needs its own mask entry)
    page.locator('[class*="rounded-full"][class*="bg-secondary-600"]'),

    // --- Video player overlays (left column) ---

    // Spark count on the video
    page.locator('p[class*="p-0"][class*="text-center"][class*="text-body-2-medium"]:not([aria-label])'),
    // Comment count — aria-label scopes the bounding box to just the count <p>
    page.locator('p[aria-label*="comment"]'),
  ];
}

/**
 * Injects CSS to render empty <video> elements as a stable solid black rectangle
 * and hovers the video player to reveal the controls overlay.
 *
 * Must be called AFTER the feed has fully rendered (video element exists in the DOM).
 * The hover uses force:true because the control-layer div (group, z-10, inset-0)
 * sits on top of <video> and intercepts pointer events — force still physically
 * moves the mouse so CSS :hover fires on the group div, revealing the controls.
 */
export async function stabilizeFeedPlayer(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `video { background: #000 !important; }`,
  });

  await page.hover("video", { force: true });
}
