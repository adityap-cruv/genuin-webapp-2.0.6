"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IntelligenceChatPanel } from "@genuin/components/organisms/intelligence-chat/intelligence-chat-panel";
import type {
  IntelligenceChatMessage,
  IntelligenceResponseBlock,
  IntelligenceTextBlockProps,
} from "@genuin/components/organisms/intelligence-chat/intelligence-chat.types";
import {
  INTELLIGENCE_BLOCK_TYPES,
  INTELLIGENCE_DEFAULT_REGISTRY,
} from "@genuin/components/organisms/intelligence-chat/intelligence-default-registry";
import { KoahAdWidget } from "@genuin/genai-sdk";
import { cn } from "@genuin/ui/lib/utils";

const RESPONSE_DELAY_MS = 600;
const KOAH_PUBLISHER_ID = (
  import.meta as ImportMeta & { env?: Record<string, string | undefined> }
).env?.VITE_GENAI_KOAH_PUBLISHER_ID;
const USE_KOAH_TEST_MOCK = process.env.NODE_ENV === "development" && !KOAH_PUBLISHER_ID;

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

type IntelligenceChatSidePanelProps = {
  /** Active video — the thread is scoped to it; remount (key) on change to reset. */
  videoId: string;
  /** Called when the user activates the panel's close control. */
  onClose: () => void;
  className?: string;
};

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

// TODO(sanidhya): replace with the real genai transport (`packages/genai`) — this
// placeholder only proves the rail → panel flow until the stream is wired in.
function placeholderResponse(prompt: string, seq: number): IntelligenceResponseBlock[] {
  const props: IntelligenceTextBlockProps = {
    paragraphs: [
      `You asked: "${prompt}".`,
      "Intelligence isn't connected to a live source for this video yet — answers will appear here once it is.",
    ],
  };
  return [{ id: `text-${seq}`, type: INTELLIGENCE_BLOCK_TYPES.text, props }];
}

/**
 * Desktop right-rail host for the Intelligence chat panel in the expanded
 * player. Owns the per-video thread state; the panel itself stays controlled.
 */
export function IntelligenceChatSidePanel({ videoId, onClose, className }: IntelligenceChatSidePanelProps) {
  const [messages, setMessages] = useState<readonly IntelligenceChatMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [koahTestReady, setKoahTestReady] = useState(!USE_KOAH_TEST_MOCK);
  const seqRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!USE_KOAH_TEST_MOCK) return;

    const koahWindow = window as KoahTestWindow;
    if (koahWindow.koah) {
      setKoahTestReady(true);
      return;
    }

    const mock = createKoahTestMock();
    koahWindow.koah = mock;
    setKoahTestReady(true);

    return () => {
      if (koahWindow.koah === mock) delete koahWindow.koah;
    };
  }, []);

  // Drop any in-flight placeholder reply if the panel unmounts (close / video change).
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const seq = ++seqRef.current;
      setMessages((prev) => [...prev, userMessage(`${videoId}-u-${seq}`, text)]);
      setIsResponding(true);
      timeoutRef.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage(`${videoId}-a-${seq}`, placeholderResponse(text, seq))]);
        setIsResponding(false);
        timeoutRef.current = null;
      }, RESPONSE_DELAY_MS);
    },
    [videoId]
  );

  return (
    <div className={cn("gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col gencl:gap-3", className)}>
      <div className="gencl:w-full gencl:shrink-0 gencl:overflow-hidden gencl:rounded-xl">
        {koahTestReady && (
          <KoahAdWidget
            standalone
            userMessage="Show me relevant information about this video"
            aiResponse={`Video context identifier: ${videoId}`}
            messageId={`intelligence-${videoId}`}
          />
        )}
      </div>
      <IntelligenceChatPanel
        data-testid="intelligence-chat-side-panel"
        registry={INTELLIGENCE_DEFAULT_REGISTRY}
        messages={messages}
        isResponding={isResponding}
        onSend={handleSend}
        onClose={onClose}
        className="gencl:min-h-0 gencl:flex-1"
        emptyState={
          <p className="gencl:m-auto gencl:max-w-xs gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
            Ask anything about this video.
          </p>
        }
      />
    </div>
  );
}
