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

const OPENSEARCH_URL = (process.env.OPENSEARCH_URL || "https://os.api.qa.begenuin.com").replace(/\/+$/, "");
const OPENSEARCH_USERNAME = process.env.OPENSEARCH_USERNAME || "ai_team";
const DEFAULT_PASS = "Xk9#mQ2$vL8@nP5!wR7^";
const ENV_PASS = process.env.OPENSEARCH_PASSWORD;
// Handle cases where env-cmd expands $vL8 or corrupts the password
const OPENSEARCH_PASSWORD =
  ENV_PASS && !ENV_PASS.includes("@nP5") && ENV_PASS.length >= 20 ? ENV_PASS : DEFAULT_PASS;
const OPENSEARCH_AUTH = Buffer.from(`${OPENSEARCH_USERNAME}:${OPENSEARCH_PASSWORD}`).toString("base64");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const SERVER_PROMPT_CACHE = new Map<string, string[]>();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function getSuggestedPrompts(videoId: string, title?: string, description?: string): Promise<string[]> {
  const cacheKey = `${videoId}:${title || ""}`;
  const cached = SERVER_PROMPT_CACHE.get(cacheKey) ?? SERVER_PROMPT_CACHE.get(videoId);
  if (cached && cached.length > 0) {
    return cached;
  }

  const indices = [
    process.env.OPENSEARCH_INDEX,
    "genuin_loop_video_index",
    "temp_genuin_loop_video_index_20251202_emb",
  ].filter((idx): idx is string => Boolean(idx));

  let matchedIndex = "";
  let videoDoc: Record<string, any> | null = null;

  // 1. Try reading existing suggested_prompts from OpenSearch
  for (const index of Array.from(new Set(indices))) {
    try {
      const url = `${OPENSEARCH_URL}/${index}/_doc/${encodeURIComponent(videoId)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Basic ${OPENSEARCH_AUTH}` },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const data = await res.json();
      matchedIndex = index;
      videoDoc = data?._source;
      const stored = videoDoc?.suggested_prompts;
      if (Array.isArray(stored) && stored.length > 0) {
        const prompts = stored
          .map((item: { prompt?: string } | string) =>
            typeof item === "string" ? item.trim() : item?.prompt?.trim()
          )
          .filter((p): p is string => Boolean(p));
        if (prompts.length > 0) {
          SERVER_PROMPT_CACHE.set(videoId, prompts);
          if (title) SERVER_PROMPT_CACHE.set(`${videoId}:${title}`, prompts);
          return prompts;
        }
      }
      break;
    } catch {
      // Ignore network errors and continue
    }
  }

  // 2. If no prompts stored yet, generate contextual prompts using video metadata
  const docTitle = (title || videoDoc?.video_title || videoDoc?.title || "").trim();
  const docDesc = (description || videoDoc?.description_text || videoDoc?.video_summary || videoDoc?.transcript || "").trim();

  let generatedPrompts: string[] = [];
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (openRouterKey && (docTitle || docDesc)) {
    try {
      const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You generate 4 short, engaging viewer questions for a video. Return ONLY a valid JSON array of strings (e.g. [\"question 1\", \"question 2\"]). Do not include markdown codeblocks or extra text.",
            },
            {
              role: "user",
              content: `Video Title: ${docTitle}\nDescription: ${docDesc.slice(0, 500)}`,
            },
          ],
          max_tokens: 250,
          temperature: 0.6,
        }),
      });

      if (completion.ok) {
        const json = await completion.json();
        const content = json?.choices?.[0]?.message?.content?.trim() || "";
        const cleaned = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedPrompts = parsed
            .filter((p): p is string => typeof p === "string" && Boolean(p.trim()))
            .map((p) => p.trim())
            .slice(0, 5);
        }
      }
    } catch (err) {
      console.warn("[intelligence/chat] OpenRouter prompt generation failed:", err);
    }
  }

  // Contextual fallback if LLM generation was not possible
  if (generatedPrompts.length === 0) {
    if (docTitle) {
      generatedPrompts = [
        `What are the highlights of ${docTitle}?`,
        `Can you explain what happens in ${docTitle}?`,
        `What is the story behind ${docTitle}?`,
        `What key takeaways can you share?`,
      ];
    } else {
      generatedPrompts = [
        "Tell me more about this video.",
        "Give me a quick summary of this video.",
        "What are the key takeaways from this video?",
        "What related insights can you share?",
      ];
    }
  }

  // 3. Persist back to OpenSearch if document exists, just like octo-maya
  if (matchedIndex && generatedPrompts.length > 0) {
    try {
      const updateUrl = `${OPENSEARCH_URL}/${matchedIndex}/_update/${encodeURIComponent(videoId)}`;
      await fetch(updateUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${OPENSEARCH_AUTH}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doc: {
            suggested_prompts: generatedPrompts.map((p) => ({
              agent_id: "agent-default",
              prompt: p,
            })),
          },
        }),
      });
    } catch (err) {
      console.warn("[intelligence/chat] OpenSearch update failed:", err);
    }
  }

  if (generatedPrompts.length > 0) {
    SERVER_PROMPT_CACHE.set(videoId, generatedPrompts);
    if (title) SERVER_PROMPT_CACHE.set(`${videoId}:${title}`, generatedPrompts);
  }

  return generatedPrompts;
}

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId")?.trim();
  const title = request.nextUrl.searchParams.get("title")?.trim();
  const description = request.nextUrl.searchParams.get("description")?.trim();

  if (!videoId) {
    return NextResponse.json({ prompts: [] }, { headers: CORS_HEADERS });
  }

  try {
    const prompts = await getSuggestedPrompts(videoId, title, description);
    return NextResponse.json({ prompts }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[intelligence/chat] GET failed:", error);
    return NextResponse.json({ prompts: [] }, { headers: CORS_HEADERS });
  }
}

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
  console.log(`[intelligence/chat] POST videoId="${videoId}" prompt="${prompt}" title="${(body?.context as any)?.title}"`);

  // `context` is best-effort — the real backend derives context from videoId, so tolerate its absence.
  const raw = (typeof body?.context === "object" && body.context !== null ? body.context : {}) as Record<
    string,
    unknown
  >;
  const str = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
  const context: IntelligenceChatContext = {
    contentType: raw.contentType === "article" ? "article" : "video",
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
