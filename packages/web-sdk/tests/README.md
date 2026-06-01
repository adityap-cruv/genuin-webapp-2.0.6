# Test Mocks

MSW v2 mocks for the SDK Playwright suite. **Read [ARCHITECTURE.md](./ARCHITECTURE.md) first** if you've never touched this folder before.

## TL;DR

- Real API responses live as raw JSON under `data/`. Devs paste, no code edit needed.
- Each layout owns a folder under `data/embed/` or `data/placement/` with two files: `config.json` (init endpoint) and `home.json` (feed items).
- Endpoints shared across all layouts live in `data/shared/`.
- Every handler pipes its JSON through `sanitize()` so PII / UUIDs / counts are filled in only when missing.
- `card_layout_id` from the brand response drives which UI component renders. Set per-`api_key` in `handlers/brand.ts`.

## Folder layout

```
data/
├── shared/      brand-details.json, comments.json, feed-video.json
├── embed/       <layout>/config.json + home.json (carousel, ted, floating)
└── placement/   <layout>/config.json + home.json (feed, grid, iheart, iheartPlacement)
```

## To refresh a fixture

1. Hit the real endpoint (browser, Postman).
2. Copy the JSON response.
3. Paste into the matching `data/.../config.json` or `home.json`.
4. `npx playwright test --update-snapshots` if visuals shift.

## To add a mocked endpoint

1. Save real response → `data/shared/<name>.json`
2. Copy `handlers/comments.ts`, change URL + import → `handlers/<name>.ts`
3. Spread the new array into `setupWorker(...)` in `browser.ts`

## To add a new layout

1. `mkdir data/{embed|placement}/<layout>/`
2. Paste init response into `config.json`
3. Paste feed response into `home.json`
4. Add `embed_id`/`placement_id` to `tests/data/init.ts`
5. Add a lookup entry in the matching handler's dispatch table

## To scrub a new field

Add the field name to the right set in `sanitize.ts` (`PNG_FALLBACK_KEYS` / `PII_FALLBACK_KEYS` / `TEXT_FALLBACKS`).
**Never add layout IDs, customization flags, or `style`/`type`** — they drive SDK behaviour.
