"use client";

import { KoahAdWidget } from "@genuin/genai-sdk";
import { cn } from "@genuin/ui/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IntelligenceChatPanel } from "@genuin/components/organisms/intelligence-chat/intelligence-chat-panel";
import type {
  IntelligenceAutoPromptCountdownState,
  IntelligenceChatMessage,
  IntelligenceResponseBlock,
  IntelligenceTextBlockProps,
} from "@genuin/components/organisms/intelligence-chat/intelligence-chat.types";
import {
  createIntelligenceDefaultRegistry,
  INTELLIGENCE_BLOCK_TYPES,
} from "@genuin/components/organisms/intelligence-chat/intelligence-default-registry";
import type { IntelligenceArticleSelectHandler } from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";

// ── Intelligence chat transport (THE INTEGRATION SEAM) ───────────────────────────────────────
// The panel POSTs the prompt here and renders the IntelligenceResponseBlock[] it returns. Today
// this points at the same-origin dummy backend (apps/webapp → /api/intelligence/chat). To go live,
// set VITE_INTELLIGENCE_CHAT_URL to the real endpoint at SDK build time (or swap the dummy route's
// body for the real service). The request/response contract below stays identical, so nothing in
// the UI changes.
const INTELLIGENCE_CHAT_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_INTELLIGENCE_CHAT_URL ??
  "/api/intelligence/chat";
const MOCK_VIDEO_AUTO_PROMPTS = [
  "Tell me more about this video.",
  "Give me a quick summary of this video.",
  "What are the key takeaways from this video?",
  "What is the main story behind this video?",
  "Explain the context of what is happening in this video.",
  "What important details should I notice in this video?",
  "Why is the topic in this video significant?",
  "What related insights can you share about this video?",
] as const;
const AUTO_PROMPT_COUNTDOWN_SECONDS = 3;
const AUTO_PROMPT_TICK_MS = 1_000;

function getMockVideoAutoPrompt(videoId: string): string {
  const hash = Array.from(videoId).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  return MOCK_VIDEO_AUTO_PROMPTS[hash % MOCK_VIDEO_AUTO_PROMPTS.length]!;
}

function getInitialAutoPrompt(videoId: string, title?: string): string {
  if (title?.trim()) {
    return `Tell me more about ${title.trim()}.`;
  }
  return getMockVideoAutoPrompt(videoId);
}

const CLIENT_PROMPT_CACHE = new Map<string, string[]>();
const IN_FLIGHT_CACHE = new Map<string, Promise<string[]>>();

export async function fetchVideoSuggestedPrompts(
  videoId: string,
  title?: string,
  description?: string,
  signal?: AbortSignal
): Promise<string[]> {
  if (!videoId) return [];
  const cached = CLIENT_PROMPT_CACHE.get(videoId);
  if (cached && cached.length > 0) return cached;

  const inFlight = IN_FLIGHT_CACHE.get(videoId);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const params = new URLSearchParams({ videoId });
      if (title) params.set("title", title);
      if (description) params.set("description", description);
      const res = await fetch(`${INTELLIGENCE_CHAT_URL}?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const data = (await res.json()) as { prompts?: string[] };
      const prompts = data.prompts ?? [];
      if (prompts.length > 0) {
        CLIENT_PROMPT_CACHE.set(videoId, prompts);
      }
      return prompts;
    } catch {
      return [];
    } finally {
      IN_FLIGHT_CACHE.delete(videoId);
    }
  })();

  IN_FLIGHT_CACHE.set(videoId, promise);
  return promise;
}

/** Lightweight context about the active video, sent to the backend so replies can reference it. */
export type IntelligenceChatVideoContext = {
  title?: string;
  description?: string;
  community?: string;
  linkoutTitle?: string;
  linkoutDescription?: string;
  suggestedPrompts?: string[];
};

type IntelligenceChatSidePanelProps = {
  /** Active video — the thread is scoped to it; remount (key) on change to reset. */
  videoId: string;
  /**
   * What the SDK knows about the active video (title, description, community, linkout). Sent with
   * each prompt so the (dummy) backend can ground its reply in the current clip. Optional — the real
   * backend derives this from `videoId`, so it can safely ignore it.
   */
  videoContext?: IntelligenceChatVideoContext;
  /** Optional pre-fetched suggested prompts for this video (e.g. from OpenSearch). */
  suggestedPrompts?: string[];
  /** Called when the user activates the panel's close control. */
  onClose: () => void;
  /**
   * Shows a close control in the panel header, opposite the "Intelligence"
   * heading. Hosts without their own dismiss affordance (the mobile sheet) turn
   * this on; the desktop rail leaves it off and closes via its sparkle toggle.
   */
  showClose?: boolean;
  /** Runs the existing video prompt flow when this panel is opened from Feed View. */
  autoPromptOnMount?: boolean;
  /** Controls whether Koah renders as one ad or as a horizontally scrollable Feed View rail. */
  koahAdLayout?: "single" | "horizontal";
  /** Runtime article action injected into JSON-driven response cards. */
  onArticleSelect?: IntelligenceArticleSelectHandler;
  className?: string;
};

function IntelligenceKoahAds({
  videoId,
  videoContext,
  layout,
}: {
  videoId: string;
  videoContext?: IntelligenceChatVideoContext;
  layout: NonNullable<IntelligenceChatSidePanelProps["koahAdLayout"]>;
}) {
  const title = videoContext?.title?.trim();
  const description = videoContext?.description?.trim();
  const fallback = `Video ${videoId}`;
  const userMessage = title || fallback;
  const aiResponse = description || fallback;

  if (layout === "single") {
    return (
      <KoahAdWidget
        standalone
        userMessage={userMessage}
        aiResponse={aiResponse}
        messageId={`intelligence-${videoId}`}
      />
    );
  }

  return (
    <>
      <style>{`
        [data-koah-feed-rail] .adsbykoah {
          display: contents !important;
        }

        [data-koah-feed-rail] [data-koah="root"] {
          --koah-format-max-width: 100% !important;
          flex: none !important;
          margin-inline: 0 !important;
          max-width: 100% !important;
          scroll-snap-align: start;
        }
      `}</style>
      <div
        data-koah-feed-rail
        data-testid="intelligence-koah-ad-rail"
        role="region"
        aria-label="Sponsored recommendations"
        tabIndex={0}
        className="gencl:flex gencl:w-full gencl:snap-x gencl:snap-mandatory gencl:gap-3 gencl:overflow-x-auto gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden">
        {[1, 2, 3].map((slotNumber) => (
          <div key={slotNumber} data-testid="intelligence-koah-ad-slot" className="gencl:contents">
            <KoahAdWidget
              standalone
              userMessage={userMessage}
              aiResponse={aiResponse}
              messageId={`intelligence-${videoId}-feed-${slotNumber}`}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function userMessage(id: string, text: string): IntelligenceChatMessage {
  return {
    id,
    role: "user",
    blocks: [{ id: `${id}-text`, type: INTELLIGENCE_BLOCK_TYPES.userText, props: { text } }],
  };
}

function assistantMessage(id: string, blocks: readonly IntelligenceResponseBlock[]): IntelligenceChatMessage {
  return { id, role: "assistant", blocks, status: "complete" };
}

/** One prior turn, serialized to plain text, sent so the backend has multi-turn context. */
type ChatHistoryTurn = { role: "user" | "assistant"; content: string };

/** Flatten a block to plain text (user-text `text`, or a text block's title + paragraphs). */
function blockToText(block: IntelligenceResponseBlock): string {
  const props = (block.props ?? {}) as { text?: string; title?: string; paragraphs?: readonly string[] };
  if (typeof props.text === "string") return props.text;
  const parts: string[] = [];
  if (props.title) parts.push(props.title);
  if (props.paragraphs) parts.push(...props.paragraphs);
  return parts.join("\n");
}

/** Serialize the whole thread into compact history turns for the backend. */
function toHistory(messages: readonly IntelligenceChatMessage[]): ChatHistoryTurn[] {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.blocks.map(blockToText).filter(Boolean).join("\n").trim(),
    }))
    .filter((turn) => turn.content);
}

// Calls the Intelligence chat backend. Contract:
//   POST { videoId, prompt, seq, context, history } -> { blocks: IntelligenceResponseBlock[] }
// Swapping in the real backend means changing INTELLIGENCE_CHAT_URL (or the dummy route's body) —
// this function and the panel stay the same.
async function requestIntelligenceReply(
  input: {
    videoId: string;
    prompt: string;
    seq: number;
    context?: IntelligenceChatVideoContext;
    history?: ChatHistoryTurn[];
  },
  signal: AbortSignal
): Promise<IntelligenceResponseBlock[]> {
  const res = await fetch(INTELLIGENCE_CHAT_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok) throw new Error(`Intelligence chat request failed: ${res.status}`);
  const data = (await res.json()) as { blocks?: IntelligenceResponseBlock[] };
  return data.blocks ?? [];
}

// Shown only if the request fails — keeps the thread readable instead of stalling silently.
function errorResponse(seq: number): IntelligenceResponseBlock[] {
  const props: IntelligenceTextBlockProps = {
    paragraphs: ["Sorry — something went wrong fetching that answer. Please try again."],
  };
  return [{ id: `error-${seq}`, type: INTELLIGENCE_BLOCK_TYPES.text, props }];
}

/**
 * Desktop right-rail host for the Intelligence chat panel in the expanded
 * player. Owns the per-video thread state; the panel itself stays controlled.
 */
export function IntelligenceChatSidePanel({
  videoId,
  videoContext,
  suggestedPrompts: propsSuggestedPrompts,
  onClose,
  showClose = false,
  autoPromptOnMount = false,
  koahAdLayout = "single",
  className,
  onArticleSelect,
}: IntelligenceChatSidePanelProps) {
  const initialKnownPrompt =
    propsSuggestedPrompts?.[0] ??
    videoContext?.suggestedPrompts?.[0] ??
    (videoId ? CLIENT_PROMPT_CACHE.get(videoId)?.[0] : undefined);

  const [autoPromptText, setAutoPromptText] = useState<string>(
    () => initialKnownPrompt ?? ""
  );
  const autoPromptTextRef = useRef(autoPromptText);
  useEffect(() => {
    autoPromptTextRef.current = autoPromptText;
  }, [autoPromptText]);

  const [promptReady, setPromptReady] = useState<boolean>(() => Boolean(initialKnownPrompt));
  const [messages, setMessages] = useState<readonly IntelligenceChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [autoPromptCountdown, setAutoPromptCountdown] = useState<IntelligenceAutoPromptCountdownState | null>(() =>
    autoPromptOnMount && videoId && initialKnownPrompt
      ? {
          prompt: initialKnownPrompt,
          remainingSeconds: AUTO_PROMPT_COUNTDOWN_SECONDS,
        }
      : null
  );

  useEffect(() => {
    if (!videoId) return;

    const provided =
      propsSuggestedPrompts?.[0] ??
      videoContext?.suggestedPrompts?.[0] ??
      CLIENT_PROMPT_CACHE.get(videoId)?.[0];

    if (provided) {
      setAutoPromptText(provided);
      setPromptReady(true);
      return;
    }

    const controller = new AbortController();
    let isSettled = false;

    // Safety timeout: if OpenSearch/API takes > 1500ms, fallback to contextual/mock prompt so user isn't blocked forever
    const timeoutId = window.setTimeout(() => {
      if (!isSettled) {
        const fallback = getInitialAutoPrompt(videoId, videoContext?.title);
        setAutoPromptText(fallback);
        setPromptReady(true);
      }
    }, 1500);

    fetchVideoSuggestedPrompts(videoId, videoContext?.title, videoContext?.description, controller.signal)
      .then((prompts) => {
        if (controller.signal.aborted) return;
        isSettled = true;
        window.clearTimeout(timeoutId);
        const selected = prompts[0] || getInitialAutoPrompt(videoId, videoContext?.title);
        if (selected) {
          setAutoPromptText(selected);
        }
        setPromptReady(true);
      })
      .catch(() => {
        isSettled = true;
        window.clearTimeout(timeoutId);
        const fallback = getInitialAutoPrompt(videoId, videoContext?.title);
        setAutoPromptText(fallback);
        setPromptReady(true);
      });

    return () => {
      isSettled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [videoId, propsSuggestedPrompts, videoContext?.suggestedPrompts, videoContext?.title, videoContext?.description]);
  const registry = useMemo(() => createIntelligenceDefaultRegistry({ onArticleSelect }), [onArticleSelect]);
  const seqRef = useRef(0);
  const autoPromptedVideoRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Keep the latest context in a ref so handleSend stays stable (deps: [videoId]) yet always sends
  // the current video's context.
  const videoContextRef = useRef(videoContext);
  useEffect(() => {
    videoContextRef.current = videoContext;
  }, [videoContext]);
  // Mirror the thread in a ref so handleSend can send prior turns without depending on `messages`.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Abort any in-flight request if the panel unmounts (close / video change).
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const seq = ++seqRef.current;
      setMessages((prev) => [...prev, userMessage(`${videoId}-u-${seq}`, text)]);
      setIsResponding(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      requestIntelligenceReply(
        { videoId, prompt: text, seq, context: videoContextRef.current, history: toHistory(messagesRef.current) },
        controller.signal
      )
        .then((blocks) => {
          const messageId = `${videoId}-a-${seq}`;
          setMessages((prev) => [...prev, assistantMessage(messageId, blocks)]);
        })
        .catch(() => {
          if (controller.signal.aborted) return; // unmounted or superseded — ignore
          setMessages((prev) => [...prev, assistantMessage(`${videoId}-a-${seq}`, errorResponse(seq))]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsResponding(false);
        });
    },
    [videoId]
  );

  useEffect(() => {
    if (
      !autoPromptOnMount ||
      !videoId ||
      !promptReady ||
      !autoPromptTextRef.current ||
      autoPromptedVideoRef.current === videoId
    ) {
      if (!promptReady || !autoPromptTextRef.current) setAutoPromptCountdown(null);
      return;
    }

    const deadline = Date.now() + AUTO_PROMPT_COUNTDOWN_SECONDS * AUTO_PROMPT_TICK_MS;
    let timer: number | undefined;

    const tick = () => {
      const millisecondsRemaining = deadline - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(millisecondsRemaining / AUTO_PROMPT_TICK_MS));

      if (remainingSeconds === 0) {
        autoPromptedVideoRef.current = videoId;
        setAutoPromptCountdown(null);
        handleSend(autoPromptTextRef.current);
        return;
      }

      setAutoPromptCountdown({ prompt: autoPromptTextRef.current, remainingSeconds });
      const millisecondsUntilNextSecond = millisecondsRemaining - (remainingSeconds - 1) * AUTO_PROMPT_TICK_MS;
      timer = window.setTimeout(tick, Math.max(1, millisecondsUntilNextSecond));
    };

    tick();

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [autoPromptOnMount, handleSend, promptReady, videoId]);

  const isAutoPrompting = autoPromptCountdown !== null;

  return (
    <div className={cn("gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col", className)}>
      <IntelligenceChatPanel
        data-testid="intelligence-chat-side-panel"
        registry={registry}
        messages={messages}
        threadHeader={<IntelligenceKoahAds videoId={videoId} videoContext={videoContext} layout={koahAdLayout} />}
        autoPromptCountdown={autoPromptCountdown ?? undefined}
        isResponding={isResponding}
        inputDisabled={isAutoPrompting}
        onSend={handleSend}
        onClose={onClose}
        showClose={showClose}
        className="gencl:min-h-0 gencl:flex-1"
        emptyState={
          !isAutoPrompting && (
            <p className="gencl:m-auto gencl:max-w-xs gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
              Ask anything about this video.
            </p>
          )
        }
      />
    </div>
  );
}
