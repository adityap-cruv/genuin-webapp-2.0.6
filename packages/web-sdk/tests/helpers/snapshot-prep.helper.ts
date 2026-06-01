/**
 * Snapshot preparation helpers — run these before `toHaveScreenshot()`.
 * Pins thumbnail images onto video posters and fixes broken profile image MIME types.
 */
import type { Page } from '@playwright/test';


/**
 * Waits until every video tile has a decoded thumbnail image.
 * Falls back to "at least 1 decoded" if a thumbnail 404s (e.g. one broken tile in grid).
 */
export async function waitForThumbnailImgsAttached(page: Page): Promise<void> {
  try {
    await page.waitForFunction(
      () => {
        function walk<T extends Element>(root: Document | ShadowRoot, sel: string): T[] {
          const out = Array.from(root.querySelectorAll<T>(sel));
          for (const el of Array.from(root.querySelectorAll('*'))) {
            const sr = (el as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;
            if (sr) out.push(...walk<T>(sr, sel));
          }
          return out;
        }
        const videos = walk<HTMLVideoElement>(document, 'video');
        const decoded = walk<HTMLImageElement>(document, 'img').filter(
          (img) => /thumbnail/i.test(img.src) && img.complete && img.naturalWidth > 8,
        );
        return videos.length > 0 && decoded.length >= videos.length;
      },
      { timeout: 8_000 },
    );
  } catch {
    await page.waitForFunction(
      () => {
        function walk(root: Document | ShadowRoot): HTMLImageElement[] {
          const out = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
          for (const el of Array.from(root.querySelectorAll('*'))) {
            const sr = (el as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;
            if (sr) out.push(...walk(sr));
          }
          return out;
        }
        return (
          walk(document).filter(
            (img) => /thumbnail/i.test(img.src) && img.complete && img.naturalWidth > 8,
          ).length > 0
        );
      },
      { timeout: 4_000 },
    );
  }
}

/**
 * Single atomic browser pass that:
 *  1. Copies each thumbnail `<img>.src` onto its sibling `<video>.poster`.
 *  2. Preloads every poster URL so it is decoded before the screenshot fires.
 *  3. Re-fetches profile images with corrected MIME type (CDN sends bare `image/`).
 *
 * One `page.evaluate` keeps the walk atomic — the SDK can remove `<img>` overlays
 * between separate evaluate calls, losing the pin opportunity.
 */
export async function copyThumbnailsAndFixProfileImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    function walk<T extends Element>(root: Document | ShadowRoot, selector: string): T[] {
      const out = Array.from(root.querySelectorAll<T>(selector));
      for (const el of Array.from(root.querySelectorAll('*'))) {
        const sr = (el as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;
        if (sr) out.push(...walk<T>(sr, selector));
      }
      return out;
    }

    const videos = walk<HTMLVideoElement>(document, 'video');
    const allImgs = walk<HTMLImageElement>(document, 'img');

    // 1. Pin thumbnails onto <video>.poster (begenuin uploads + TED Bunny CDN).
    const thumbnailImgs = allImgs.filter(
      (img) => /thumbnail/i.test(img.src) && img.naturalWidth > 8,
    );
    const pairCount = Math.min(videos.length, thumbnailImgs.length);
    for (let i = 0; i < pairCount; i += 1) {
      if (!videos[i].poster) videos[i].poster = thumbnailImgs[i].src;
    }

    // 2. Preload every unique poster so it is in cache before screenshot.
    const posterUrls = Array.from(new Set(videos.map((v) => v.poster).filter(Boolean)));
    await Promise.all(
      posterUrls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          }),
      ),
    );

    // 3. Re-fetch profile images with correct MIME — CDN sends bare `image/` which browsers refuse.
    const brokenProfileImgs = allImgs.filter(
      (img) =>
        /\/uploads\/profile_images\//.test(img.src) &&
        (img.naturalWidth === 0 || img.naturalWidth < 8),
    );
    await Promise.all(
      brokenProfileImgs.map(async (img) => {
        try {
          const resp = await fetch(img.src);
          if (!resp.ok) return;
          const buf = await resp.arrayBuffer();
          const blob = new Blob([buf], { type: 'image/png' });
          img.src = URL.createObjectURL(blob);
        } catch {
          // Network failure — leave broken <img> alone.
        }
      }),
    );
  });
}
