import { NextResponse } from "next/server";

import { getHomeLayout } from "@lib/home-feed/layout";

// The home page's LAYOUT manifest (widget.json), served same-origin so the frontend fetches it
// like any backend response. Never statically cached (it's the seam for a future live backend).
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getHomeLayout());
}
