/**
 * @fileoverview Playwright globalSetup — boots the mock HTTP server before tests.
 *
 * Mock URLs are injected via `webServer.env` in `playwright.config.ts`;
 * this file only owns the server lifecycle.
 */
import "./routes";
import { startMockServer } from "./server";
// Side-effect import: registers all default routes before the server accepts traffic.

const MOCK_PORT = Number(process.env.MOCK_SERVER_PORT ?? 4006);

/** Playwright entry point. */
export default async function globalSetup(): Promise<void> {
  await startMockServer(MOCK_PORT);
  process.stdout.write(`[mock] listening on http://localhost:${MOCK_PORT}\n`);
}
