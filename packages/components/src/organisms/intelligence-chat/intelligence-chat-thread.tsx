"use client";

import { Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import type { IntelligenceChatMessage, IntelligenceChatThreadProps } from "./intelligence-chat.types";
import { IntelligenceResponseRenderer } from "./intelligence-response-registry";

/** Distance from the bottom (px) within which we keep auto-following new messages. */
const FOLLOW_THRESHOLD_PX = 48;

function MessageRow({ message }: { message: IntelligenceChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      data-slot="intelligence-chat-message"
      data-role={message.role}
      className={cn("gencl:flex gencl:w-full", isUser ? "gencl:justify-end" : "gencl:justify-start")}>
      <div
        className={cn(
          "gencl:flex gencl:flex-col gencl:gap-4",
          isUser
            ? "gencl:max-w-[85%] gencl:rounded-lg gencl:rounded-br-none gencl:bg-secondary-50 gencl:p-2"
            : "gencl:w-full"
        )}>
        {message.blocks.map((block) => (
          <IntelligenceResponseRenderer key={block.id} block={block} message={message} />
        ))}
        {message.status === "error" && (
          <Text as="p" size="body-2" className="gencl:text-red-500">
            Something went wrong. Please try again.
          </Text>
        )}
      </div>
    </div>
  );
}

function RespondingIndicator({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="intelligence-chat-responding"
      className="gencl:flex gencl:items-center gencl:gap-2">
      <span aria-hidden="true" className="gencl:flex gencl:items-center gencl:gap-1">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="gencl:size-1.5 gencl:animate-pulse gencl:rounded-full gencl:bg-secondary-400"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
      <Text as="span" size="body-2" className="gencl:text-secondary-600">
        {label}
      </Text>
    </div>
  );
}

/**
 * Scrollable list of chat messages. Follows new messages while the user is
 * near the bottom; otherwise shows a "scroll to latest" affordance.
 *
 * Designed to sit inside `IntelligencePanelShell`'s scroll area — it fills
 * its parent and owns its own scroll container.
 */
export const IntelligenceChatThread = React.forwardRef<HTMLDivElement, IntelligenceChatThreadProps>(
  function IntelligenceChatThread(
    { messages, isResponding = false, respondingLabel = "Thinking…", emptyState, className, ...props },
    ref
  ) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = React.useState(true);

    React.useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement);

    const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
      const element = scrollRef.current;
      if (!element) return;
      element.scrollTo({ top: element.scrollHeight, behavior });
    }, []);

    const handleScroll = React.useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;
      const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
      setIsAtBottom(distance <= FOLLOW_THRESHOLD_PX);
    }, []);

    const lastMessageId = messages[messages.length - 1]?.id;
    const lastMessageBlockCount = messages[messages.length - 1]?.blocks.length ?? 0;

    // Follow the conversation only while the user hasn't scrolled up.
    React.useEffect(() => {
      if (isAtBottom) scrollToBottom("auto");
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on content changes only
    }, [lastMessageId, lastMessageBlockCount, isResponding, scrollToBottom]);

    const showScrollButton = !isAtBottom && messages.length > 0;

    return (
      <div
        data-slot="intelligence-chat-thread"
        className={cn("gencl:relative gencl:min-h-0 gencl:flex-1", className)}
        {...props}>
        <div
          ref={scrollRef}
          role="log"
          aria-label="Conversation"
          onScroll={handleScroll}
          className={cn(
            "gencl:flex gencl:h-full gencl:flex-col gencl:gap-4 gencl:overflow-y-auto gencl:px-2 gencl:py-4",
            "gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
          )}>
          {messages.length === 0 && emptyState}
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
          {isResponding && <RespondingIndicator label={respondingLabel} />}
        </div>

        {showScrollButton && (
          <button
            type="button"
            aria-label="Scroll to latest"
            onClick={() => scrollToBottom()}
            className={cn(
              "gencl:absolute gencl:bottom-3 gencl:left-1/2 gencl:-translate-x-1/2",
              "gencl:flex gencl:size-8 gencl:items-center gencl:justify-center gencl:rounded-full",
              "gencl:bg-black/20 gencl:backdrop-blur-[5px] gencl:transition-colors gencl:hover:bg-black/30",
              "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-primary-400"
            )}>
            <span className="gencl:flex gencl:size-6 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40">
              <ChevronDown aria-hidden="true" className="gencl:size-4 gencl:text-white" />
            </span>
          </button>
        )}
      </div>
    );
  }
);
