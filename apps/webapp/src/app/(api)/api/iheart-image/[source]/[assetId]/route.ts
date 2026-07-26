import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ImageParamsSchema = z.object({
  source: z.enum(["new_assets", "assets.getty"]),
  assetId: z.string().regex(/^[a-f0-9]{24}$/),
});

type RouteContext = {
  params: Promise<{
    source: string;
    assetId: string;
  }>;
};

/**
 * Proxies the two fixed iHeart image collections used by the home page.
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
    const upstreamResponse = await fetch(`https://i.iheart.com/v3/re/${source}/${assetId}`, {
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
