import { NextResponse, type NextRequest } from "next/server";

import {
  generateChatReply,
  type ChatHistoryTurn,
  type IntelligenceChatContext,
} from "@lib/intelligence-chat/responses";

// Same-origin dummy backend for the expanded-player Intelligence chat. The chat panel POSTs
// { videoId, prompt, seq } and gets back { blocks: IntelligenceResponseBlock[] }. This is the
// integration seam: to go live, either point the panel's INTELLIGENCE_CHAT_URL at the real endpoint,
// or replace the getIntelligenceChatResponse() call below with a call to the real service — the
// request/response contract stays the same, so the UI is unchanged. Never statically cached.
export const dynamic = "force-dynamic";

function firstForwardedValue(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim();
}

function toHttpOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolve the browser-facing origin when this route is reached through a reverse proxy.
 * `request.nextUrl.origin` can contain the upstream Vercel deployment hostname instead of
 * the public custom domain, so prefer the browser Origin and standard proxy headers.
 */
function getPublicOrigin(request: NextRequest): string {
  const browserOrigin = toHttpOrigin(request.headers.get("origin") ?? undefined);
  if (browserOrigin) return browserOrigin;

  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const forwardedProtocol = firstForwardedValue(request.headers.get("x-forwarded-proto")) ?? request.nextUrl.protocol;
  const forwardedOrigin = toHttpOrigin(
    forwardedHost ? `${forwardedProtocol.replace(/:$/, "")}://${forwardedHost}` : undefined
  );

  return forwardedOrigin ?? request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    videoId?: unknown;
    prompt?: unknown;
    seq?: unknown;
    context?: unknown;
    history?: unknown;
  } | null;

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const videoId = typeof body?.videoId === "string" ? body.videoId : "";
  const seq = typeof body?.seq === "number" ? body.seq : 0;

  // `context` is best-effort — the real backend derives context from videoId, so tolerate its absence.
  const raw = (typeof body?.context === "object" && body.context !== null ? body.context : {}) as Record<
    string,
    unknown
  >;
  const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
  const context: IntelligenceChatContext = {
    title: str(raw.title),
    description: str(raw.description),
    community: str(raw.community),
    linkoutTitle: str(raw.linkoutTitle),
    linkoutDescription: str(raw.linkoutDescription),
  };

  // Prior conversation turns for multi-turn context. Best-effort — tolerate a missing/malformed field.
  const history: ChatHistoryTurn[] = Array.isArray(body?.history)
    ? body.history
        .map((turn) => {
          const t = (typeof turn === "object" && turn !== null ? turn : {}) as { role?: unknown; content?: unknown };
          return {
            role: t.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: typeof t.content === "string" ? t.content : "",
          };
        })
        .filter((turn) => turn.content)
    : [];

  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  try {
    // Use the browser-facing origin to build absolute /article/<slug> links. Relative links are
    // swallowed by the SDK embed router, while request.nextUrl may expose a reverse-proxy upstream.
    const origin = getPublicOrigin(request);
    const blocks = await generateChatReply({ prompt, videoId, seq, context, history, origin });
    return NextResponse.json({ blocks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "chat generation failed" },
      { status: 502 }
    );
  }
}
