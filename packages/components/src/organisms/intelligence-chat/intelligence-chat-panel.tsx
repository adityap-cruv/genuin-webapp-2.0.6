"use client";

import * as React from "react";

import { IntelligencePanelShell } from "@genuin/components/organisms/intelligence-panel/intelligence-panel-shell";

import { IntelligenceChatInput } from "./intelligence-chat-input";
import { IntelligenceChatThread } from "./intelligence-chat-thread";
import type { IntelligenceChatPanelProps } from "./intelligence-chat.types";
import { IntelligenceRegistryProvider } from "./intelligence-response-registry";

/**
 * Chat-capable Intelligence panel: shared shell + message thread + composer.
 *
 * Fully controlled — the consumer owns `messages`, answers `onSend`, and
 * supplies the `registry` that maps response block types to components.
 * No transport or fetching lives here.
 */
export const IntelligenceChatPanel = React.forwardRef<HTMLElement, IntelligenceChatPanelProps>(
  function IntelligenceChatPanel(
    {
      messages,
      threadHeader,
      autoPromptCountdown,
      onSend,
      registry,
      isResponding = false,
      respondingLabel,
      emptyState,
      placeholder,
      inputDisabled = false,
      size,
      onClose,
      className,
      ...props
    },
    ref
  ) {
    return (
      <IntelligenceRegistryProvider registry={registry}>
        <IntelligencePanelShell
          ref={ref}
          data-slot="intelligence-chat-panel"
          size={size}
          onClose={onClose}
          className={className}
          footer={
            <IntelligenceChatInput onSend={onSend} disabled={inputDisabled || isResponding} placeholder={placeholder} />
          }
          {...props}>
          <IntelligenceChatThread
            messages={messages}
            threadHeader={threadHeader}
            autoPromptCountdown={autoPromptCountdown}
            isResponding={isResponding}
            respondingLabel={respondingLabel}
            emptyState={emptyState}
            className="gencl:h-full"
          />
        </IntelligencePanelShell>
      </IntelligenceRegistryProvider>
    );
  }
);
