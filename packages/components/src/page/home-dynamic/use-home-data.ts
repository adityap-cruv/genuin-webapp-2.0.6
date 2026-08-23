"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { HomeDataPage, HomeLayoutManifest } from "./contract";

/**
 * Base URL of the home data source (serves BOTH the layout manifest and the data pages).
 * INTEGRATION SEAM:
 *  - UNSET (default) → same-origin Next API routes (`/api/home/*`) — the dummy backend bundled in
 *    the webapp. This is what the simple one-container deploy uses (no CORS, no host to configure).
 *  - SET → an external backend (a real BFF) serving the SAME contract. Switching is one env var.
 */
const HOME_BFF_URL = process.env.NEXT_PUBLIC_HOME_BFF_URL ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const url = HOME_BFF_URL ? new URL(path, HOME_BFF_URL).toString() : path;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Home data request failed: ${response.status} (${path})`);
  return (await response.json()) as T;
}

/** The layout manifest (widget.json) — fetched once; reused for every data page. */
export function useHomeLayout() {
  return useQuery({
    queryKey: ["home-dynamic-layout"],
    queryFn: () => fetchJson<HomeLayoutManifest>("/api/home/layout"),
    staleTime: Infinity,
  });
}

/** Infinite pages of content (data.json), advanced via `pagination.nextCursor`. */
export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: ["home-dynamic-feed"],
    queryFn: ({ pageParam }) =>
      fetchJson<HomeDataPage>(`/api/home/feed${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ""}`),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.endOfFeed ? undefined : lastPage.pagination.nextCursor,
  });
}
