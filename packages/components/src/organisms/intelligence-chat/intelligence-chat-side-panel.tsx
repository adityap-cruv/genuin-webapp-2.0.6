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
const KOAH_PUBLISHER_ID = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
  ?.VITE_GENAI_KOAH_PUBLISHER_ID;
const USE_KOAH_TEST_MOCK = process.env.NODE_ENV === "development" && !KOAH_PUBLISHER_ID;
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

type KoahAdSlotStatus = "loading" | "filled" | "empty";

function getMockVideoAutoPrompt(videoId: string): string {
  const hash = Array.from(videoId).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  return MOCK_VIDEO_AUTO_PROMPTS[hash % MOCK_VIDEO_AUTO_PROMPTS.length]!;
}

type KoahTestWindow = Window & {
  koah?: {
    process: (
      userMessage: string,
      aiResponse: string,
      adType: "suffix" | "prefix" | "followup" | "inline",
      options?: {
        target?: HTMLElement;
        signal?: AbortSignal;
        onFill?: () => void;
        onNoFill?: () => void;
      }
    ) => Promise<boolean>;
  };
};

function createKoahTestMock(): NonNullable<KoahTestWindow["koah"]> {
  return {
    async process(_userMessage, _aiResponse, _adType, options) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      if (options?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      if (!options?.target) {
        options?.onNoFill?.();
        return false;
      }

      const ad = document.createElement("article");
      ad.setAttribute("data-testid", "koah-test-ad");
      ad.setAttribute("data-koah", "root");
      ad.style.cssText =
        "box-sizing:border-box;width:100%;border:1px solid #dedede;border-radius:12px;background:#fff;padding:12px;color:#202124;font-family:inherit";
      ad.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#60646c">
          <span>Sponsored | Koah test creative</span><span aria-hidden="true">x</span>
        </div>
        <div style="display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;margin-top:10px">
          <div style="display:flex;min-height:92px;align-items:center;justify-content:center;border-radius:9px;background:linear-gradient(135deg,#ffd36b,#ff6b35);font-size:13px;font-weight:700;color:#202124">TEST AD</div>
          <div style="min-width:0">
            <div style="font-size:17px;line-height:21px;font-weight:700">Discover something useful for your next adventure</div>
            <div style="margin-top:5px;font-size:12px;line-height:16px;color:#60646c">Development-only Koah data for validating the expanded Intelligence layout.</div>
            <div style="margin-top:10px;border-radius:8px;background:#202124;padding:8px 10px;font-size:13px;font-weight:600;color:#fff">Explore now &gt;</div>
          </div>
        </div>`;
      options.target.replaceChildren(ad);
      options.onFill?.();
      return true;
    },
  };
}

/** Lightweight context about the active video, sent to the backend so replies can reference it. */
export type IntelligenceChatVideoContext = {
  title?: string;
  description?: string;
  community?: string;
  linkoutTitle?: string;
  linkoutDescription?: string;
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
  /** Lets Feed View ads use the full responsive width of the chat thread. */
  /** Runtime article action injected into JSON-driven response cards. */
  onArticleSelect?: IntelligenceArticleSelectHandler;
  fillAvailableWidth?: boolean;
  className?: string;
};

function IntelligenceKoahAds({ videoId, fillAvailableWidth }: { videoId: string; fillAvailableWidth: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [slotStatuses, setSlotStatuses] = useState<Record<string, KoahAdSlotStatus>>({});
  const slots = [
    {
      id: "primary",
      userMessage: "Show me relevant information about this video",
      aiResponse: `Video context identifier: ${videoId}`,
    },
    {
      id: "secondary",
      userMessage: "Show me another relevant recommendation for this video",
      aiResponse: `Additional video context identifier: ${videoId}`,
    },
  ];

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const cards = Array.from(rail.querySelectorAll<HTMLElement>('[data-testid="koah-ad-card"]'));
    const cardsThatStartedLoading = new Set<HTMLElement>();

    const updateStatuses = () => {
      const nextStatuses: Record<string, KoahAdSlotStatus> = {};
      for (const card of cards) {
        const slotId = card.dataset.koahSlotId;
        if (!slotId) continue;
        if (card.querySelector('[data-koah="root"]')) {
          nextStatuses[slotId] = "filled";
          continue;
        }

        const loadingContainer = card.querySelector(".adsbykoah");
        if (loadingContainer) cardsThatStartedLoading.add(card);
        const isSettled = cardsThatStartedLoading.has(card) && !loadingContainer;
        nextStatuses[slotId] = isSettled ? "empty" : "loading";
      }

      setSlotStatuses((current) => {
        const statusChanged = Object.entries(nextStatuses).some(([slotId, status]) => current[slotId] !== status);
        return statusChanged ? { ...current, ...nextStatuses } : current;
      });
    };

    const observer = new MutationObserver(updateStatuses);
    observer.observe(rail, { childList: true, subtree: true });
    updateStatuses();

    return () => {
      observer.disconnect();
    };
  }, [videoId]);

  return (
    <div
      ref={railRef}
      data-testid="koah-ad-rail"
      className="gencl:flex gencl:w-full gencl:snap-x gencl:snap-mandatory gencl:gap-3 gencl:overflow-x-auto gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden">
      {slots.slice(0, fillAvailableWidth ? 2 : 1).map((slot) => (
        <div
          key={slot.id}
          data-koah-slot-id={slot.id}
          data-testid="koah-ad-card"
          className={cn(
            "gencl:relative gencl:shrink-0 gencl:snap-start",
            slotStatuses[slot.id] === "empty" && "gencl:hidden"
          )}
          style={{
            width: fillAvailableWidth ? "min(768px, calc(100% - 112px))" : "100%",
            minHeight: (slotStatuses[slot.id] ?? "loading") === "loading" ? 144 : undefined,
          }}>
          {(slotStatuses[slot.id] ?? "loading") === "loading" && (
            <div
              data-testid="koah-ad-loading"
              aria-label="Loading sponsored recommendation"
              className="gencl:absolute gencl:inset-0 gencl:min-h-36 gencl:animate-pulse gencl:rounded-xl gencl:border gencl:border-secondary-300 gencl:bg-white gencl:p-3">
              <div className="gencl:flex gencl:items-center gencl:justify-between">
                <div className="gencl:h-3 gencl:w-24 gencl:rounded gencl:bg-secondary-200" />
                <div className="gencl:size-3 gencl:rounded gencl:bg-secondary-200" />
              </div>
              <div className="gencl:mt-3 gencl:grid gencl:gap-3" style={{ gridTemplateColumns: "96px minmax(0, 1fr)" }}>
                <div className="gencl:rounded-lg gencl:bg-secondary-200" style={{ minHeight: 92 }} />
                <div className="gencl:min-w-0 gencl:space-y-2">
                  <div className="gencl:h-4 gencl:w-4/5 gencl:rounded gencl:bg-secondary-200" />
                  <div className="gencl:h-3 gencl:w-full gencl:rounded gencl:bg-secondary-100" />
                  <div className="gencl:h-8 gencl:w-28 gencl:rounded-lg gencl:bg-secondary-200" />
                </div>
              </div>
            </div>
          )}
          <KoahAdWidget
            standalone
            userMessage={slot.userMessage}
            aiResponse={slot.aiResponse}
            messageId={`intelligence-${videoId}-${slot.id}`}
          />
        </div>
      ))}
    </div>
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
  onClose,
  showClose = false,
  autoPromptOnMount = false,
  fillAvailableWidth = false,
  className,
  onArticleSelect,
}: IntelligenceChatSidePanelProps) {
  const mockVideoAutoPrompt = getMockVideoAutoPrompt(videoId);
  const [messages, setMessages] = useState<readonly IntelligenceChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [autoPromptCountdown, setAutoPromptCountdown] = useState<IntelligenceAutoPromptCountdownState | null>(() =>
    autoPromptOnMount && videoId
      ? { prompt: mockVideoAutoPrompt, remainingSeconds: AUTO_PROMPT_COUNTDOWN_SECONDS }
      : null
  );
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

  useEffect(() => {
    if (!USE_KOAH_TEST_MOCK) return;

    const koahWindow = window as KoahTestWindow;
    if (koahWindow.koah) return;

    const mock = createKoahTestMock();
    koahWindow.koah = mock;

    return () => {
      if (koahWindow.koah === mock) delete koahWindow.koah;
    };
  }, []);

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
    if (!autoPromptOnMount || !videoId || autoPromptedVideoRef.current === videoId) {
      setAutoPromptCountdown(null);
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
        handleSend(mockVideoAutoPrompt);
        return;
      }

      setAutoPromptCountdown({ prompt: mockVideoAutoPrompt, remainingSeconds });
      const millisecondsUntilNextSecond = millisecondsRemaining - (remainingSeconds - 1) * AUTO_PROMPT_TICK_MS;
      timer = window.setTimeout(tick, Math.max(1, millisecondsUntilNextSecond));
    };

    tick();

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [autoPromptOnMount, handleSend, mockVideoAutoPrompt, videoId]);

  const isAutoPrompting = autoPromptCountdown !== null;

  return (
    <div
      data-feed-intelligence-wide={fillAvailableWidth || undefined}
      className={cn("gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col", className)}>
      <style>{`
        [data-slot="intelligence-chat-panel"] [data-koah="root"] {
          border-color: var(--gencl-secondary-300, #bec2c7) !important;
        }

        [data-feed-intelligence-wide="true"] [data-koah="root"] {
          --koah-format-max-width: 100% !important;
        }
      `}</style>
      <IntelligenceChatPanel
        data-testid="intelligence-chat-side-panel"
        registry={registry}
        messages={messages}
        threadHeader={<IntelligenceKoahAds videoId={videoId} fillAvailableWidth={fillAvailableWidth} />}
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
