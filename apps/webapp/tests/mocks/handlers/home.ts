/**
 * @fileoverview Home-page mock handlers.
 *
 * Covers every endpoint the `/home` route hits during SSR + first render,
 * confirmed via network sniff on 2026-05-27 (anonymous dev session).
 * Capture procedure for replacement fixtures:
 * `docs/superpowers/plans/notes/2026-05-27-home-page-mock-capture.md`.
 */
import type { RouteHandler, RouteKey } from '../server';

export interface HomeRoute {
  key: RouteKey;
  handler: RouteHandler;
}

export const homeHandlers: HomeRoute[] = [
  // SSR: page metadata (generateMetadata in home/page.tsx)
  { key: 'GET /api/v3/web/meta_data', handler: { fixture: 'home/meta-data.json' } },

  // SSR: brand config (middleware.ts)
  { key: 'GET /brand/details', handler: { fixture: 'home/brand-details.json' } },

  // CSR: primary feed list
  { key: 'POST /goservices/feed/home', handler: { fixture: 'home/feed-home.json' } },

  // CSR: IP info (urlParamResolver + analytics)
  { key: 'GET /goservices/data/ip_info', handler: { fixture: 'home/ip-info.json' } },

  // CSR: comments under first feed item
  { key: 'GET /api/v3/comments', handler: { fixture: 'home/comments-default.json' } },

  // CSR: side-panel trending categories — stub empty list until fixture is captured
  {
    key: 'GET /api/v3/trending/categories_communities',
    handler: { response: { body: { status: true, data: [] } } },
  },
];
