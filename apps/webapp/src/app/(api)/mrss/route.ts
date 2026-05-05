import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getEmbedConfig } from "@lib/api/config";
import { toHttpUrl } from "@lib/utils/common/url";

/**
 * Proxy route for RSS feed.
 * Extracts hostname from request, resolves brand api_key via getEmbedConfig,
 * then proxies the external RSS feed response to the client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const embedId = searchParams.get("embed_id");
  const placementId = searchParams.get("placement_id");

  if (!embedId && !placementId) {
    return NextResponse.json({ error: "embed_id or placement_id is required" }, { status: 400 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const host = request.headers.get("host") ?? "";

  try {
    const configParamsStr = request.cookies.get("config_params")?.value ?? "";
    let configParams: Record<string, string> = {};

    if (configParamsStr) {
      const raw: unknown = JSON.parse(configParamsStr);
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }
      configParams = raw as Record<string, string>;
    }

    const config = await getEmbedConfig(configParams);
    const apiKey = config?.api_key;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not available" }, { status: 500 });
    }

    const externalUrl = new URL(`/goservices/mrss/${encodeURIComponent(host)}/feed.xml`, toHttpUrl(apiUrl));
    if (placementId) {
      externalUrl.searchParams.set("placement_id", placementId);
    } else {
      externalUrl.searchParams.set("embed_id", embedId!);
    }

    const upstream = await fetch(externalUrl.toString(), {
      headers: { "api-key": apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "RSS feed unavailable" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/xml",
      },
    });
  } catch (error) {
    console.error("RSS feed proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch RSS feed" }, { status: 502 });
  }
}
