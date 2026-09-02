"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ChevronDown, Sparkle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IntelligenceChatInput } from "@genuin/components/organisms/intelligence-chat/intelligence-chat-input";
import { IntelligenceChatPanel } from "@genuin/components/organisms/intelligence-chat/intelligence-chat-panel";
import type {
  IntelligenceChatMessage,
  IntelligenceResponseBlock,
  IntelligenceTextBlockProps,
} from "@genuin/components/organisms/intelligence-chat/intelligence-chat.types";
import {
  createIntelligenceDefaultRegistry,
  INTELLIGENCE_BLOCK_TYPES,
} from "@genuin/components/organisms/intelligence-chat/intelligence-default-registry";
import type { IntelligenceArticleSelectHandler } from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";

import type { Article } from "./article-data";

const INTELLIGENCE_CHAT_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_INTELLIGENCE_CHAT_URL ??
  "/api/intelligence/chat";

const ARTICLE_INTELLIGENCE_CSS = `
  [data-slot="article-intelligence-assistant"] {
    box-shadow: 0 20px 55px rgba(16, 24, 40, 0.16), 0 4px 14px rgba(16, 24, 40, 0.08);
    transition:
      height 320ms cubic-bezier(0.22, 1, 0.36, 1),
      width 240ms cubic-bezier(0.22, 1, 0.36, 1),
      left 240ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease,
      transform 180ms ease;
  }

  /* The collapsed composer uses its shadow as the visual boundary. Keep only its idle edge
     transparent; expanded conversations retain the input's neutral border. */
  [data-slot="article-intelligence-assistant"][data-phase="idle"]
    [data-slot="intelligence-chat-input"] > div {
    border-color: transparent !important;
  }

  [data-slot="article-intelligence-assistant"]:not([data-phase="idle"])
    [data-slot="intelligence-chat-input"] > div:focus-within {
    border-color: var(--gencl-secondary-150) !important;
  }

  [data-slot="article-intelligence-assistant"][data-phase="answered"]
    [data-slot="intelligence-chat-message"][data-role="assistant"]:last-of-type {
    animation: gen-article-intelligence-answer-enter 280ms ease-out both;
  }

  [data-slot="article-intelligence-assistant"]
    [data-slot="intelligence-chat-panel"] > header > div:first-child {
    visibility: hidden;
  }

  @keyframes gen-article-intelligence-answer-enter {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /**
   * On phones the composer anchors to the VIEWPORT, not to the article boundary. The boundary is
   * taller than the visual viewport there (measured: 728px box vs a 664px viewport), so the
   * default \`position: absolute; bottom\` put the composer ~52px below the fold and it was never
   * visible. \`fixed\` is safe here: the assistant is a sibling of the scroller, so no ancestor
   * transform/containment can capture it, and on mobile the inline Feed View article is
   * full-screen anyway.
   */
  @media (max-width: 767px) {
    [data-slot="article-intelligence-assistant"] {
      position: fixed !important;
      bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
      max-height: calc(100dvh - 24px) !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [data-slot="article-intelligence-assistant"] { transition: none; }
    [data-slot="article-intelligence-assistant"]
      [data-slot="intelligence-chat-message"][data-role="assistant"]:last-of-type {
      animation: none;
    }
  }
`;

type ChatHistoryTurn = { role: "user" | "assistant"; content: string };
type AssistantPhase = "idle" | "prompted" | "thinking" | "answered";
type HorizontalLayout = { width: number | string; left: number | string };

const DEFAULT_HORIZONTAL_LAYOUT: HorizontalLayout = {
  width: "min(768px, calc(100% - 32px))",
  left: "50%",
};
const MAX_EXPANDED_HEIGHT = 520;
const INLINE_VIDEO_GAP = 24;
const MAX_INLINE_COLLISION_SHIFT = 96;
const MIN_INLINE_COLLISION_WIDTH = 240;

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

function blockToText(block: IntelligenceResponseBlock): string {
  const props = (block.props ?? {}) as { text?: string; title?: string; paragraphs?: readonly string[] };
  if (typeof props.text === "string") return props.text;
  return [props.title, ...(props.paragraphs ?? [])].filter(Boolean).join("\n");
}

function toHistory(messages: readonly IntelligenceChatMessage[]): ChatHistoryTurn[] {
  return messages
    .map((message) => ({
      role: message.role,
      content: message.blocks.map(blockToText).filter(Boolean).join("\n").trim(),
    }))
    .filter((turn) => turn.content);
}

function errorResponse(seq: number): IntelligenceResponseBlock[] {
  const props: IntelligenceTextBlockProps = {
    paragraphs: ["Sorry — something went wrong fetching that answer. Please try again."],
  };
  return [{ id: `article-error-${seq}`, type: INTELLIGENCE_BLOCK_TYPES.text, props }];
}

function articleContext(article: Article) {
  const bodyPreview = article.body
    .filter((block) => block.type === "paragraph")
    .slice(0, 3)
    .map((block) => block.text)
    .join(" ");

  return {
    contentType: "article" as const,
    title: article.title,
    description: [article.standfirst, bodyPreview].filter(Boolean).join(" "),
    community: article.source.name,
  };
}

function minimumSurfaceHeight(phase: AssistantPhase): number {
  if (phase === "idle") return 52;
  if (phase === "prompted") return 176;
  return 300;
}

function elementHeight(element: Element | null): number {
  return element instanceof HTMLElement ? element.offsetHeight : 0;
}

function threadContentHeight(thread: HTMLElement | null): number {
  if (!thread) return 0;
  const styles = window.getComputedStyle(thread);
  const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const gap = parseFloat(styles.rowGap || styles.gap) || 0;
  const children = Array.from(thread.children);
  return (
    padding +
    children.reduce((height, child) => height + elementHeight(child), 0) +
    gap * Math.max(0, children.length - 1)
  );
}

/**
 * Bottom-centred Intelligence composer shared by routed and inline article views.
 *
 * `onArticleSelect` is the same host seam the Feed View uses (`player-swiper` passes its own):
 * return `true` to claim the click, and the article card suppresses its `href` navigation so the
 * host can swap the article in place instead of pushing a route. Omit it and the cards fall back
 * to plain link navigation.
 */
export function ArticleIntelligenceAssistant({
  article,
  hidden = false,
  onArticleSelect,
}: {
  article: Article;
  hidden?: boolean;
  onArticleSelect?: IntelligenceArticleSelectHandler;
}) {
  const [messages, setMessages] = useState<readonly IntelligenceChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [height, setHeight] = useState(52);
  const [horizontalLayout, setHorizontalLayout] = useState<HorizontalLayout>(DEFAULT_HORIZONTAL_LAYOUT);
  const registry = useMemo(() => createIntelligenceDefaultRegistry({ onArticleSelect }), [onArticleSelect]);
  const context = useMemo(() => articleContext(article), [article]);
  const surfaceRef = useRef<HTMLElement>(null);
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const thinkingTimerRef = useRef<number | null>(null);
  const messagesRef = useRef(messages);
  const lastMessageRole = messages[messages.length - 1]?.role;
  const phase: AssistantPhase =
    messages.length === 0 ? "idle" : isResponding ? "thinking" : lastMessageRole === "user" ? "prompted" : "answered";
  const isExpanded = phase !== "idle" && !isMinimized;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (thinkingTimerRef.current !== null) window.clearTimeout(thinkingTimerRef.current);
    },
    []
  );

  const handleSend = useCallback(
    (text: string) => {
      const seq = ++seqRef.current;
      setIsMinimized(false);
      setMessages((current) => [...current, userMessage(`${article.slug}-u-${seq}`, text)]);
      setIsResponding(false);

      if (thinkingTimerRef.current !== null) window.clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = window.setTimeout(() => {
        thinkingTimerRef.current = null;
        setIsResponding(true);
      }, 420);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(INTELLIGENCE_CHAT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          videoId: article.slug,
          prompt: text,
          seq,
          context,
          history: toHistory(messagesRef.current),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Intelligence chat request failed: ${response.status}`);
          return (await response.json()) as { blocks?: IntelligenceResponseBlock[] };
        })
        .then(({ blocks = [] }) => {
          setMessages((current) => [...current, assistantMessage(`${article.slug}-a-${seq}`, blocks)]);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setMessages((current) => [...current, assistantMessage(`${article.slug}-a-${seq}`, errorResponse(seq))]);
        })
        .finally(() => {
          if (thinkingTimerRef.current !== null) {
            window.clearTimeout(thinkingTimerRef.current);
            thinkingTimerRef.current = null;
          }
          if (!controller.signal.aborted) setIsResponding(false);
        });
    },
    [article.slug, context]
  );

  const minimize = useCallback(() => {
    setIsMinimized(true);
    window.requestAnimationFrame(() => surfaceRef.current?.focus());
  }, []);

  const reopen = useCallback(() => {
    if (!isMinimized) return;
    setIsMinimized(false);
    window.requestAnimationFrame(() => surfaceRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus());
  }, [isMinimized]);

  const measureHeight = useCallback(() => {
    if (!isExpanded) {
      setHeight(52);
      return;
    }

    const surface = surfaceRef.current;
    const panel = surface?.querySelector<HTMLElement>('[data-slot="intelligence-chat-panel"]');
    const thread = surface?.querySelector<HTMLElement>('[role="log"]') ?? null;
    const input = surface?.querySelector<HTMLElement>('[data-slot="intelligence-chat-input"]') ?? null;
    if (!surface || !panel) return;

    const panelStyles = window.getComputedStyle(panel);
    const panelPadding = parseFloat(panelStyles.paddingTop) + parseFloat(panelStyles.paddingBottom);
    const desiredHeight =
      panelPadding +
      elementHeight(panel.querySelector("header")) +
      threadContentHeight(thread) +
      elementHeight(input) +
      2;
    const boundaryHeight = surface.parentElement?.clientHeight || window.innerHeight;
    const viewportInset = window.matchMedia("(max-width: 767px)").matches ? 24 : 48;
    const maximumHeight = Math.max(52, Math.min(MAX_EXPANDED_HEIGHT, boundaryHeight - viewportInset));
    const nextHeight = Math.round(Math.min(maximumHeight, Math.max(minimumSurfaceHeight(phase), desiredHeight)));

    setHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
  }, [isExpanded, phase]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measureHeight);
    if (!isExpanded) return () => window.cancelAnimationFrame(frame);

    const surface = surfaceRef.current;
    const thread = surface?.querySelector<HTMLElement>('[role="log"]') ?? null;
    const input = surface?.querySelector<HTMLElement>('[data-slot="intelligence-chat-input"]') ?? null;
    const resizeObserver = new ResizeObserver(measureHeight);
    const observeContent = () => {
      if (surface?.parentElement) resizeObserver.observe(surface.parentElement);
      if (input) resizeObserver.observe(input);
      thread?.querySelectorAll<HTMLElement>(":scope > *").forEach((element) => resizeObserver.observe(element));
    };
    observeContent();

    const mutationObserver = new MutationObserver(() => {
      observeContent();
      measureHeight();
    });
    if (thread) mutationObserver.observe(thread, { childList: true, subtree: true });
    window.addEventListener("resize", measureHeight);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measureHeight);
    };
  }, [isExpanded, measureHeight, messages, isResponding]);

  const updateHorizontalLayout = useCallback(() => {
    const surface = surfaceRef.current;
    const boundary = surface?.parentElement;
    if (!surface || !boundary) return;

    const root = surface.closest<HTMLElement>('[data-inline-article-open="true"]');
    const videoFrame =
      root?.querySelector<HTMLElement>("[data-feed-video-frame]") ??
      root?.querySelector<HTMLElement>("[data-feed-video-shell]");
    const resetLayout = () =>
      setHorizontalLayout((current) =>
        current.width === DEFAULT_HORIZONTAL_LAYOUT.width && current.left === DEFAULT_HORIZONTAL_LAYOUT.left
          ? current
          : DEFAULT_HORIZONTAL_LAYOUT
      );

    if (!root || !videoFrame || root.dataset.inlineVideoDismissed === "true") {
      resetLayout();
      return;
    }

    const boundaryRect = boundary.getBoundingClientRect();
    const videoRect = videoFrame.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const defaultWidth = Math.min(768, Math.max(0, boundaryRect.width - 32));
    const defaultRight = boundaryRect.left + boundaryRect.width / 2 + defaultWidth / 2;
    const horizontallyOverlaps = defaultRight + INLINE_VIDEO_GAP > videoRect.left;
    const verticallyOverlaps = surfaceRect.top < videoRect.bottom && surfaceRect.bottom > videoRect.top;

    if (!horizontallyOverlaps || !verticallyOverlaps || videoRect.width === 0 || videoRect.height === 0) {
      resetLayout();
      return;
    }

    const defaultCenter = boundaryRect.width / 2;
    const availableRight = videoRect.left - boundaryRect.left - INLINE_VIDEO_GAP;
    const overlap = Math.max(0, defaultCenter + defaultWidth / 2 - availableRight);
    const shift = Math.min(MAX_INLINE_COLLISION_SHIFT, overlap);
    const left = defaultCenter - shift;
    const collisionSafeWidth = Math.max(0, (availableRight - left) * 2);
    const width = Math.max(MIN_INLINE_COLLISION_WIDTH, Math.min(defaultWidth, collisionSafeWidth));
    const nextLayout: HorizontalLayout = { width, left };
    setHorizontalLayout((current) =>
      current.width === nextLayout.width && current.left === nextLayout.left ? current : nextLayout
    );
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateHorizontalLayout);
    const surface = surfaceRef.current;
    const root = surface?.closest<HTMLElement>('[data-inline-article-open="true"]');
    const videoFrame =
      root?.querySelector<HTMLElement>("[data-feed-video-frame]") ??
      root?.querySelector<HTMLElement>("[data-feed-video-shell]");
    const resizeObserver = new ResizeObserver(updateHorizontalLayout);
    if (surface) resizeObserver.observe(surface);
    if (surface?.parentElement) resizeObserver.observe(surface.parentElement);
    if (videoFrame) resizeObserver.observe(videoFrame);

    const mutationObserver = new MutationObserver(updateHorizontalLayout);
    if (root) {
      mutationObserver.observe(root, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["data-inline-video-dismissed", "data-inline-article-open"],
      });
    }
    window.addEventListener("resize", updateHorizontalLayout);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", updateHorizontalLayout);
    };
  }, [height, isExpanded, updateHorizontalLayout]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      minimize();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, minimize]);

  return (
    <section
      ref={surfaceRef}
      data-slot="article-intelligence-assistant"
      data-phase={phase}
      data-minimized={isMinimized || undefined}
      aria-label="Article Intelligence"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      tabIndex={-1}
      className={cn(
        "gencl:absolute gencl:bottom-6 gencl:left-1/2 gencl:z-30 gencl:-translate-x-1/2",
        "gencl:overflow-hidden gencl:rounded-xl gencl:bg-white gencl:outline-none",
        hidden && "gencl:pointer-events-none gencl:opacity-0"
      )}
      style={{
        width: horizontalLayout.width,
        left: horizontalLayout.left,
        height,
        maxHeight: "calc(100% - 48px)",
      }}>
      <style>{ARTICLE_INTELLIGENCE_CSS}</style>

      {isExpanded ? (
        <>
          <div
            data-slot="article-intelligence-label"
            className={cn(
              "gencl:pointer-events-none gencl:absolute gencl:left-2 gencl:top-1 gencl:z-10",
              "gencl:flex gencl:h-8 gencl:items-center gencl:gap-2 gencl:text-secondary-900"
            )}>
            <Sparkle aria-hidden="true" strokeWidth={1.75} className="gencl:size-5 gencl:shrink-0" />
            <span className="gencl:text-xs gencl:font-medium gencl:leading-4">Intelligence</span>
          </div>
          <button
            type="button"
            data-slot="article-intelligence-minimize"
            aria-label="Minimize Intelligence"
            title="Minimize Intelligence"
            onClick={minimize}
            className={cn(
              "gencl:absolute gencl:right-2 gencl:top-2 gencl:z-10 gencl:flex gencl:size-8",
              "gencl:items-center gencl:justify-center gencl:rounded-full gencl:text-secondary-700",
              "gencl:transition-colors gencl:hover:bg-secondary-100 gencl:hover:text-secondary-900",
              "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-blue"
            )}>
            <ChevronDown aria-hidden="true" className="gencl:size-4" />
          </button>
          <IntelligenceChatPanel
            registry={registry}
            messages={messages}
            isResponding={isResponding}
            inputDisabled={phase === "prompted"}
            onSend={handleSend}
            onClose={() => undefined}
            respondingLabel="Thinking…"
            className="gencl:h-full gencl:min-h-0 gencl:ring-0"
          />
        </>
      ) : (
        <IntelligenceChatInput
          onSend={handleSend}
          disabled={isResponding || phase === "prompted"}
          onFocus={reopen}
          className="gencl:border-0 gencl:pt-0"
        />
      )}
    </section>
  );
}
