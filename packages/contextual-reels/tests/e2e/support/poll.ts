/**
 * Evaluate-based polling for the CXR E2E suite.
 *
 * Playwright's own `page.waitForFunction` polls on `requestAnimationFrame`, and
 * in this harness rAF callbacks stop being delivered once the widget is mounted
 * (a small, static, offscreen-composited slot). A predicate that is false on its
 * first evaluation then never runs again AND its `timeout` never fires either, so
 * the call hangs until the whole test times out — turning "the video never became
 * playable" into an unreadable 30s timeout in an unrelated line.
 *
 * `page.evaluate` keeps working under the same conditions, so every wait here is
 * a Node-driven loop over `evaluate` with a real deadline.
 */
import type { Page } from "@playwright/test";

/** Default gap between predicate evaluations. */
const DEFAULT_INTERVAL_MS = 250;

/**
 * Poll `predicate` in the page until it returns true or the deadline passes.
 *
 * @param page      Playwright page.
 * @param predicate Runs in the browser; must be self-contained (no closures).
 * @param options   `timeoutMs` deadline, optional `intervalMs`, optional `arg`
 *                  passed to the predicate (page-side arguments must be
 *                  serializable).
 * @returns True if the predicate passed, false on timeout.
 */
export async function pollUntil<Arg = undefined>(
  page: Page,
  predicate: (arg: Arg) => boolean,
  options: { timeoutMs: number; intervalMs?: number; arg?: Arg }
): Promise<boolean> {
  const { timeoutMs, intervalMs = DEFAULT_INTERVAL_MS, arg } = options;
  const deadline = Date.now() + timeoutMs;
  // page.evaluate's own generics resolve `arg` through Unboxed<>, which a caller's
  // free `Arg` can't satisfy; the cast keeps the call site typed instead.
  const pageFunction = predicate as (arg: unknown) => boolean;
  for (;;) {
    if (await page.evaluate(pageFunction, arg)) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Same as {@link pollUntil}, but throws a named error on timeout — use when the
 * condition not happening is a genuine test failure (a mount that never renders,
 * an ad that never fills).
 *
 * @param what Short description used in the error message.
 */
export async function waitUntil<Arg = undefined>(
  page: Page,
  what: string,
  predicate: (arg: Arg) => boolean,
  options: { timeoutMs: number; intervalMs?: number; arg?: Arg }
): Promise<void> {
  if (!(await pollUntil(page, predicate, options))) {
    throw new Error(`Timed out after ${options.timeoutMs}ms waiting for ${what}`);
  }
}
