import { QueryClient } from "@tanstack/react-query";

/**
 * Per-request `QueryClient` factory for server-side rendering.
 *
 * Mirrors the client singleton's default options (`client.ts`) — none, today —
 * but, unlike that singleton, returns a brand-new instance on every call.
 * RSC handles many concurrent requests in the same server process; sharing
 * one `QueryClient` across them (as the client singleton does for a single
 * browser tab) would leak one request's prefetched/seeded cache into
 * another's. Call this once per request, seed/prefetch into it, `dehydrate()`
 * it, and let it be garbage-collected — never reuse it across requests.
 */
export const makeServerQueryClient = () => new QueryClient();
