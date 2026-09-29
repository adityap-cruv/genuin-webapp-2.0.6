import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getEmbedConfig } from "@lib/api/config";

export const dynamic = "force-dynamic";

function getOctoOrchestratorBaseUrl(): string {
  const value = process.env.OCTO_ORCHESTRATOR_BASE_URL?.trim();
  if (!value) throw new Error("OCTO_ORCHESTRATOR_BASE_URL is not configured");
  return new URL(value).origin;
}

function parseConfigParams(value: string | undefined): Record<string, string> | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const entries = Object.entries(parsed);
    if (entries.some((entry) => typeof entry[1] !== "string")) return null;
    return Object.fromEntries(entries) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasCanvasCookie = allCookies.some(
    (cookie) => cookie.name === "vibe_session" || cookie.name.startsWith("vibe_session_")
  );
  if (!hasCanvasCookie) {
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/home",
        "Cache-Control": "no-store",
      },
    });
  }

  const configParams = parseConfigParams(cookieStore.get("config_params")?.value);
  if (!configParams) {
    return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
  }

  let config: Awaited<ReturnType<typeof getEmbedConfig>>;
  try {
    config = await getEmbedConfig(configParams);
  } catch {
    return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
  }
  const brandId = Number(config?.brand_id);
  if (!Number.isSafeInteger(brandId) || brandId <= 0) {
    return NextResponse.json({ error: "brand_not_found" }, { status: 404 });
  }
  const directUrl = new URL("/api/auth/genuin/direct", getOctoOrchestratorBaseUrl());
  directUrl.searchParams.set("brand_id", String(brandId));
  directUrl.searchParams.set("brand_name", config.name);
  directUrl.searchParams.set("brand_logo", config.logo ?? "");
  directUrl.searchParams.set("brand_subdomain", config.subdomain);
  const response = NextResponse.redirect(directUrl, 302);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
