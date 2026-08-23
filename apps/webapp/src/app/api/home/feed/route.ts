import { NextResponse, type NextRequest } from "next/server";

import { getHomeFeedPage } from "@lib/home-feed/pages";

// A paginated CONTENT page (data.json) for the infinite scroll, keyed by `?cursor=`. Served
// same-origin so the frontend fetches it like any backend response. Never statically cached.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor");
  const page = getHomeFeedPage(cursor);
  if (!page) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }
  return NextResponse.json(page);
}
