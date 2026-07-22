// interact.mjs — post-observe expand + swipe gesture for the 'interacted'
// measurement state. Modeled directly on tests/e2e/support/CompactBar.page.ts's
// tapExpand()/swipeNext(), adapted to a raw Playwright `Page` (this harness has
// no page-object/test-fixture layer) and to the ad-under-test frame instead of
// the top-level page.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Locate the frame the widget actually mounted into: the 'ad-under-test' frame
// itself in 'direct' view-mode, or its nested 'cxr-publisher-wrapper' child in
// 'iframe' view-mode. Returns null if neither is found (record-and-continue).
function findWidgetFrame(page) {
  const adFrame = page.frames().find((f) => f.name() === 'ad-under-test');
  if (!adFrame) return null;
  const wrapper = adFrame.childFrames().find((f) => f.name() === 'cxr-publisher-wrapper');
  return wrapper || adFrame;
}

// Piercing helper shared by the expand click and the swipe host-rect lookup —
// locates `.gen-ext`'s shadowRoot and, within it, the first visible element
// matching `testid`. Runs inside the widget frame's own JS context.
async function visibleTestidRect(frame, testid) {
  return frame.evaluate((id) => {
    const root = document.querySelector('.gen-ext')?.shadowRoot;
    const els = Array.from(root?.querySelectorAll(`[data-testid="${id}"]`) ?? []);
    const vis = els.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!vis) return null;
    const r = vis.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, testid);
}

async function activeSlideIndex(frame) {
  return frame.evaluate(() => {
    const host = document.querySelector('.gen-ext');
    const root = host?.shadowRoot;
    if (!root) return -1;
    const hostRect = host.getBoundingClientRect();
    const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"], [data-testid="video-layout"]'));
    return slides.findIndex((s) => {
      const r = s.getBoundingClientRect();
      return r.width > 0 && r.left >= hostRect.left - 5 && r.right <= hostRect.right + 5 &&
        r.top >= hostRect.top - 5 && r.bottom <= hostRect.bottom + 5;
    });
  });
}

async function hostRect(frame) {
  return frame.evaluate(() => {
    const r = document.querySelector('.gen-ext').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
}

// Real page.mouse flick, same technique as CompactBar.swipeNext(): down →
// move-in-steps → up, alternating vertical/horizontal axis on retry. Computed
// off the host `.gen-ext` bounding box (not `[data-testid="ad-layout"]`) so the
// gesture starts outside the ad slot — inside it, useEmblaCarousel's
// skipDragInAdSlot predicate intentionally drops the drag.
async function flick(page, rect, vertical) {
  const cx = rect.x + rect.w * 0.4;
  const cy = rect.y + rect.h / 2;
  if (vertical) {
    await page.mouse.move(cx, rect.y + rect.h - 8);
    await page.mouse.down();
    await page.mouse.move(cx, rect.y + rect.h * 0.5, { steps: 6 });
    await page.mouse.move(cx, rect.y - rect.h, { steps: 6 });
  } else {
    await page.mouse.move(rect.x + rect.w * 0.4, cy);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.w * 0.2, cy, { steps: 4 });
    await page.mouse.move(rect.x - rect.w, cy, { steps: 6 });
  }
  await page.mouse.up();
  await sleep(900);
}

/**
 * Expand + swipe the widget after the initial observe window. Never throws —
 * the harness must still produce a report even when the interaction doesn't
 * visibly take effect (e.g. a no-fill or a layout with no expand control), so
 * every step records its outcome and continues.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ expandAttempted: boolean, expandFound: boolean, swipeAttempted: boolean, swipeSucceeded: boolean }>}
 */
export async function interact(page) {
  const result = { expandAttempted: false, expandFound: false, swipeAttempted: false, swipeSucceeded: false };

  const frame = findWidgetFrame(page);
  if (!frame) return result;

  result.expandAttempted = true;
  try {
    const expandPt = await visibleTestidRect(frame, 'topbar-expand');
    if (expandPt) {
      result.expandFound = true;
      await page.mouse.click(expandPt.x, expandPt.y);
      await sleep(400);
    }
  } catch {
    // Absence/failure to expand is tolerated — some layouts (e.g. L3
    // compact-bar-only) don't expose the control at all.
  }

  result.swipeAttempted = true;
  try {
    const startIndex = await activeSlideIndex(frame);
    const rect = await hostRect(frame);
    for (let attempt = 0; attempt < 5; attempt++) {
      await flick(page, rect, attempt % 2 === 0);
      if ((await activeSlideIndex(frame)) !== startIndex) {
        result.swipeSucceeded = true;
        break;
      }
    }
  } catch {
    // A swallowed/failed swipe is a valid (if uninteresting) measurement
    // outcome, not a harness failure — record-and-continue per the plan.
  }

  return result;
}
