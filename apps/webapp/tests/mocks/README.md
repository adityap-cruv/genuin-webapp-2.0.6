# Webapp Mocks

Local HTTP mock server for Playwright E2E tests. Replaces the goservices/API backend during test runs via env-var URL swap. Same pattern as the web-sdk MSW setup — always on when tests run.

## Run

```sh
pnpm --filter @genuin/webapp test
```

The mock server boots automatically in `globalSetup` and shuts down in `globalTeardown`. Webapp boots pointing at `http://localhost:4006` instead of real goservices.

## Layout

```
tests/mocks/
├── server.ts             # http server + route registry + override API
├── routes.ts             # default route registration (imported as side-effect)
├── sanitize.ts           # PII/token scrubber for fixture capture
├── global-setup.ts       # Playwright entry — boots server before tests
├── handlers/<domain>.ts  # route arrays per API domain
└── data/<domain>/*.json  # sanitized fixture JSON
```

## Add an endpoint

1. **Capture** a real response from QA, e.g.:
   ```sh
   curl -H "Authorization: Bearer <qa-token>" \
     https://goservices.qa.begenuin.com/api/v3/community/123 > /tmp/comm.json
   ```
2. **Sanitize** via `sanitize.ts`:
   ```sh
   node --input-type=module -e "
     import {readFileSync, writeFileSync} from 'node:fs';
     import {sanitizeJsonString} from './tests/mocks/sanitize.ts';
     const raw = readFileSync('/tmp/comm.json', 'utf8');
     const out = sanitizeJsonString(raw);
     if (out.error) throw out.error;
     writeFileSync('tests/mocks/data/community/community-123.json', out.data);
   "
   ```
3. **Register** in `handlers/community.ts`:
   ```ts
   { key: 'GET /api/v3/community/:id', handler: { fixture: 'community/community-123.json' } }
   ```
4. **Import** the handler array from `routes.ts` if it's a new domain.

## Per-test override

```ts
import { test, expect } from '../_fixtures/mock';

test('empty feed', async ({ page, mock }) => {
  await mock('GET /api/v3/feed/home', {
    response: { status: 200, body: { data: { feeds: [] } } },
  });
  await page.goto('/home');
  await expect(page.getByText('No posts yet')).toBeVisible();
});
```

`response` and `fixture` shapes serialize over the wire. Function `handler` shape only works when registered in-process (i.e. in `handlers/*.ts`).

## How it works

- `playwright.config.ts` sets `GO_API_URL`, `NEXT_PUBLIC_GO_API_URL`, `NEXT_PUBLIC_API_URL` to `http://localhost:4006` in the webServer env block (unconditional).
- The webServer command bypasses `env-cmd` so the mock URLs are not overwritten by `.env` at the repo root.
- `globalSetup` boots `http.createServer` on port 4006, imports `routes.ts` (side-effect registers handlers).
- Next.js server fetches now hit `localhost:4006` instead of goservices.
- Server shuts down implicitly when the Playwright process exits — matches the web-sdk pattern.

## When fixtures are wrong

A failing test usually means the captured fixture diverges from the live API. Re-capture from QA, sanitize, re-run. If the live API changes, fixtures must follow.

## Port collisions

If port 4006 is in use locally:

```sh
MOCK_API=1 MOCK_SERVER_PORT=4106 pnpm --filter @genuin/webapp test
```

## Related docs

- Spec: [`docs/superpowers/specs/2026-05-27-webapp-mocking-architecture-design.md`](../../../../docs/superpowers/specs/2026-05-27-webapp-mocking-architecture-design.md)
- Plan: [`docs/superpowers/plans/2026-05-27-webapp-mocking-implementation.md`](../../../../docs/superpowers/plans/2026-05-27-webapp-mocking-implementation.md)
- Env audit: [`docs/superpowers/plans/notes/2026-05-27-env-audit.md`](../../../../docs/superpowers/plans/notes/2026-05-27-env-audit.md)
