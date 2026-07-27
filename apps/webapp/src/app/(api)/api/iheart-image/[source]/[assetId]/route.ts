import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ImageParamsSchema = z.object({
  source: z.enum(["new_assets", "assets.getty", "assets.streams", "assets.images", "contest", "url"]),
  assetId: z.union([
    z.string().regex(/^[a-f0-9]{24}$/),
    z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,128}$/),
    z.string().regex(/^[A-Za-z0-9_-]{32,2048}={0,2}$/),
  ]),
});

type RouteContext = {
  params: Promise<{
    source: string;
    assetId: string;
  }>;
};

/**
 * Proxies the fixed iHeart image collections, encoded podcast artwork URLs,
 * and the contest artwork CDN used by iHeart promotion pages.
 *
 * The application CSP intentionally allows only self-hosted and approved
 * publisher image origins. Restricting both path segments keeps this route
 * from becoming an open proxy while allowing the editorial cards to use the
 * source site's imagery without widening the global CSP.
 */
export async function GET(_request: NextRequest, context: RouteContext): Promise<Response> {
  const result = ImageParamsSchema.safeParse(await context.params);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid iHeart image path." }, { status: 400 });
  }

  const { source, assetId } = result.data;

  try {
    const sourcePath = source === "assets.images" ? "assets/images" : source;
    const upstreamUrl =
      source === "url"
        ? `https://i.iheart.com/v3/url/${assetId}?ops=fit%28960%2C960%29`
        : source === "contest"
          ? `https://cdn3.aptivada.com/${assetId}`
          : `https://i.iheart.com/v3/re/${sourcePath}/${assetId}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      next: { revalidate: 21_600 },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json({ error: "iHeart image could not be loaded." }, { status: 502 });
    }

    const contentType = upstreamResponse.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      return NextResponse.json({ error: "Unexpected iHeart image response." }, { status: 502 });
    }

    return new Response(upstreamResponse.body, {
      headers: {
        "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: "iHeart image request failed." }, { status: 502 });
  }
}
