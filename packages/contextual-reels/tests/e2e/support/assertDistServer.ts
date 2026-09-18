/**
 * Playwright `globalSetup` guard: fail fast when the E2E port is owned by the
 * Vite dev server instead of the built `dist/`.
 *
 * `webServer.reuseExistingServer` is on locally, so any dev server that happens to
 * own the port gets reused and answers `/gen_ext.min.js` with an app shell
 * (`text/html`).
 * The widget then never boots and all 50 tests fail identically on the 15s mount
 * wait in `mountWidget`, which reads like a product break. This turns that into a
 * one-line error before a single browser launches.
 *
 * Deliberately ordering-independent: a connection refusal means nothing is
 * listening yet, which is the healthy case — Playwright's own `webServer` will
 * start `serve dist` for us.
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../../dist");

/** Matches `serve`'s JS content type; anything HTML-ish is the dev server. */
const JS_CONTENT_TYPE = /javascript|ecmascript/i;

/** Bounded so a hung socket can't stall the run; the check is local-only. */
const PROBE_TIMEOUT_MS = 2000;

export default async function assertDistServer(): Promise<void> {
  const port = Number(process.env.CXR_E2E_PORT ?? 3111);

  if (!existsSync(resolve(distDir, "gen_ext.min.js"))) {
    throw new Error(
      `dist/gen_ext.min.js is missing — Playwright serves the built bundle and builds nothing.\n` +
        `  Fix: pnpm build   (fresh clone: pnpm turbo build --filter=@genuin/contextual-reels)`
    );
  }

  let response: Response;
  try {
    response = await fetch(`http://localhost:${port}/gen_ext.min.js`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch {
    // Nothing listening (or too slow to answer) — Playwright starts its own
    // `serve dist` on this port. Healthy path.
    return;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (response.ok && JS_CONTENT_TYPE.test(contentType)) return;

  throw new Error(
    `Port ${port} is already serving something that is not the built bundle ` +
      `(GET /gen_ext.min.js → ${response.status} ${contentType || "no content-type"}).\n` +
      `  This is almost always a dev server: reuseExistingServer hands the suite that server, ` +
      `which answers with an app shell, so every test times out waiting for the widget to mount.\n` +
      `  Fix: stop it, or run on another port — CXR_E2E_PORT=3131 pnpm test:e2e`
  );
}
