import type { IntelligenceResponseBlock } from "@genuin/components/organisms/intelligence-chat/intelligence-chat.types";
import type { IntelligenceArticle } from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { articleHref, getArticleBySlug } from "@genuin/components/page/article/article-data";

/**
 * "Intelligence chat" backend for the expanded-player chat panel — powered by OpenRouter.
 *
 * The INTEGRATION SEAM is the response contract: an `IntelligenceResponseBlock[]`. The chat panel
 * renders whatever blocks come back through `INTELLIGENCE_DEFAULT_REGISTRY`, so swapping the model or
 * provider never touches the UI.
 *
 * Video context (title/description/community) is SENT by the SDK because the placement videos are
 * real — their ids aren't in any local dataset, so this route can't look them up.
 *
 * Block-type keys mirror `INTELLIGENCE_BLOCK_TYPES` in
 * `@genuin/components/organisms/intelligence-chat/intelligence-default-registry`. They are kept as
 * string literals here so this server module never imports that `"use client"` registry.
 */
const TEXT_BLOCK = "text";
const ARTICLES_BLOCK = "articles";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Widely-available default; override with OPENROUTER_MODEL (any model your OpenRouter key can route to).
const DEFAULT_MODEL = "openai/gpt-4o-mini";

/** Lightweight context about the content the user is chatting on. */
export type IntelligenceChatContext = {
  contentType?: "video" | "article";
  title?: string;
  description?: string;
  community?: string;
  linkoutTitle?: string;
  linkoutDescription?: string;
};

/** One prior turn of the conversation, forwarded from the panel for multi-turn context. */
export type ChatHistoryTurn = { role: "user" | "assistant"; content: string };

type GenerateInput = {
  /** The user's trimmed prompt. */
  prompt: string;
  /** The active video the thread is scoped to. */
  videoId: string;
  /** Sequence within the thread — only used to keep block ids unique. */
  seq: number;
  /** What the SDK knows about the current video (so replies can reference it). */
  context?: IntelligenceChatContext;
  /** Prior turns for multi-turn context. */
  history?: ChatHistoryTurn[];
  /** Origin of the incoming request — used to build ABSOLUTE article links that work in the embed. */
  origin?: string;
};

function truncate(value: string, max: number): string {
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

// Curated pool of real, resolvable /article/<slug> pieces the assistant can suggest. Ids ARE slugs.
const RELATED_ARTICLE_SLUGS = [
  "the-week-in-racing-31-august-26",
  "rate-the-fleet-andy-rice-on-sassnitz-sailgp",
  "luna-rossa-test-new-rudder-and-take-a-knock",
  "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist",
  "the-week-in-racing-24-august-26",
  "flying-roos-hit-high-five-with-victory-in-sassnitz",
  "flying-roos-and-black-foils-lead-the-way-in-germany",
  "black-foils-dominate-practice-day-in-sassnitz",
  "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors",
  "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class",
];

/** Resolve the slug pool to full article cards (title + hero image + href). */
function articlePool(origin?: string): IntelligenceArticle[] {
  return RELATED_ARTICLE_SLUGS.map((slug) => {
    const article = getArticleBySlug(slug);
    if (!article) return null;
    const path = articleHref(slug); // "/article/<slug>"
    return {
      id: slug,
      title: article.title,
      // Absolute so the shared <Link> treats it as external and renders a real <a> that opens the
      // article. A RELATIVE link inside the SDK embed is intercepted by the embed router and never
      // reaches the host's /article/<slug> page.
      href: origin ? `${origin}${path}` : path,
      image: { src: article.heroImage.src, alt: article.heroImage.alt },
    };
  }).filter((entry): entry is IntelligenceArticle => entry !== null);
}

/** System prompt — role, current video context, and the article pool for grounded suggestions. */
function systemPrompt(context: IntelligenceChatContext | undefined, pool: readonly IntelligenceArticle[]): string {
  // Prefer the content's own attributes; fall back to the featured linkout, which is often the only
  // populated content for these placement videos.
  const heading = context?.title || context?.linkoutTitle;
  const about = context?.description || context?.linkoutDescription;
  const isArticle = context?.contentType === "article";

  const lines = isArticle
    ? [
        "You are the AI assistant for The Foil, a premium sailing media brand.",
        "The user is reading an article. Use the supplied article details to answer their questions about it.",
        "Treat the article title and excerpt as authoritative and answer confidently from that context.",
      ]
    : [
        "You are the AI assistant for The Foil, a premium sailing media brand.",
        "The user is watching a video in the player. Use the video details below to answer their questions, " +
          "including what the video is about.",
        "You don't have the raw footage, but you DO have its title and description — treat those as " +
          "authoritative and answer confidently from them. Do NOT say you can't see the video.",
      ];
  if (heading) lines.push(`${isArticle ? "Article" : "Video"} title: "${heading}".`);
  if (context?.community) lines.push(`${isArticle ? "Source" : "Community / topic"}: ${context.community}.`);
  if (about) lines.push(`${isArticle ? "Article excerpt" : "What the video is about"}: ${truncate(about, 600)}`);

  lines.push(
    "",
    "Respond with a JSON object of EXACTLY this shape:",
    '{ "answer": string, "relatedArticleIds": string[] }',
    "- answer: your reply in PLAIN TEXT — 2 to 4 short paragraphs, no markdown, no headings, no bullets.",
    "- relatedArticleIds: 1 to 3 ids from RELATED_ARTICLES to suggest as further reading, most relevant " +
      "first. Match on TOPIC and THEME, not exact wording — every article is about sailing, so almost " +
      "any sailing-related question has a good match (e.g. questions about schedules, upcoming races, " +
      "events, results, standings, teams, sailors or technique all map to the relevant previews, " +
      "reports, analysis or profiles in the list). Include at least one whenever anything in the list " +
      "is even loosely related; only return [] if the question is clearly not about sailing at all " +
      "(e.g. a greeting or an off-topic aside). Only use ids from the list — never invent one.",
    "",
    "RELATED_ARTICLES:",
    ...pool.map((article) => `- ${article.id}: ${article.title}`)
  );
  return lines.join("\n");
}

/** Parse the model's JSON reply into a text block plus (optionally) a dynamic articles block. */
function toBlocks(content: string, seq: number, pool: readonly IntelligenceArticle[]): IntelligenceResponseBlock[] {
  // Strip accidental code fences, then parse; fall back to treating the whole string as the answer.
  const cleaned = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  let answer = cleaned;
  let ids: string[] = [];
  try {
    const parsed = JSON.parse(cleaned) as { answer?: unknown; relatedArticleIds?: unknown };
    if (typeof parsed.answer === "string") answer = parsed.answer;
    if (Array.isArray(parsed.relatedArticleIds)) {
      ids = parsed.relatedArticleIds.filter((id): id is string => typeof id === "string");
    }
  } catch {
    // Not JSON — use the raw content as the answer, with no article suggestions.
  }

  const paragraphs = answer
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const blocks: IntelligenceResponseBlock[] = [
    { id: `text-${seq}`, type: TEXT_BLOCK, props: { paragraphs: paragraphs.length ? paragraphs : [answer.trim()] } },
  ];

  const related = ids
    .map((id) => pool.find((article) => article.id === id))
    .filter((article): article is IntelligenceArticle => Boolean(article))
    .slice(0, 3);
  if (related.length) {
    blocks.push({
      id: `articles-${seq}`,
      type: ARTICLES_BLOCK,
      props: { articles: related, layout: { imageAspectRatio: "16 / 9", height: "auto" }, label: "Related" },
    });
  }
  return blocks;
}

/**
 * Generate a reply via OpenRouter (real, context-aware, multi-turn, with dynamically-chosen related
 * articles). Requires `OPENROUTER_API_KEY`; throws if it's missing or on an OpenRouter error so the
 * route can surface it. This is the seam: swap the transport/model here without touching the panel.
 */
export async function generateChatReply(input: GenerateInput): Promise<IntelligenceResponseBlock[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const pool = articlePool(input.origin);
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const history = (input.history ?? []).slice(-8); // cap the context window
  const messages = [
    { role: "system", content: systemPrompt(input.context, pool) },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: input.prompt },
  ];

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "The Foil Intelligence",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned no content");
  return toBlocks(content, input.seq, pool);
}
