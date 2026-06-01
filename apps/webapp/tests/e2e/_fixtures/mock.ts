/**
 * @fileoverview Playwright fixture exposing the mock-server override API.
 *
 * Currently `test` is a plain re-export of the Playwright base — no overrides active.
 * Uncomment the block below when you need per-test route overrides via `mock()`.
 *
 * Example (after uncommenting):
 *   import { test, expect } from '../_fixtures/mock';
 *
 *   test('empty feed', async ({ page, mock }) => {
 *     await mock('POST /goservices/feed/home', { response: { status: 200, body: { data: { feeds: [] } } } });
 *     await page.goto('/home');
 *   });
 *
 * Overrides reset automatically after each test via /__reset__.
 */
import { test as base, expect } from '@playwright/test';

// Uncomment to enable per-test overrides. Also restore overrideRoutes, useOverride, resetOverrides,
// readBody, and the /__use__ + /__reset__ blocks in tests/mocks/server.ts.
//
// import type { RouteHandler, RouteKey } from '../../mocks/server';
//
// /** Install a per-test route override — swaps one route's response for this test only. */
// export type MockOverride = (key: RouteKey, handler: RouteHandler) => Promise<void>;
//
// const MOCK_BASE = `http://localhost:${process.env.MOCK_SERVER_PORT ?? 4006}`;
//
// async function control(path: '/__use__' | '/__reset__', body: unknown): Promise<void> {
//   const response = await fetch(`${MOCK_BASE}${path}`, {
//     method: 'POST',
//     headers: { 'content-type': 'application/json' },
//     body: JSON.stringify(body),
//   });
//   if (!response.ok) throw new Error(`mock control ${path} failed: ${response.status}`);
// }
//
// export const test = base.extend<{ mock: MockOverride }>({
//   mock: async ({}, use) => {
//     await use((key, handler) => control('/__use__', { key, handler }));
//     await control('/__reset__', {}); // teardown — runs after every test automatically
//   },
// });

export const test = base;
export { expect };
