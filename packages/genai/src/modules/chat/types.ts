import type React from 'react';

import type { CachedResponseItem } from '@/services/apiTypes';

/** Parameters accepted by `handleSendMessage`. */
export interface HandleSendMessageParams {
    targetSessionId?: string | null;
    messageInput?: string;
    agent_id?: string;
    editedChatId?: string | null;
    metadata?: Record<string, unknown> | null;
    /** Called after the message is successfully queued (after session creation if needed). */
    onMessageQueued?: () => void;
}

/** Context value exposed by `ChatProvider`. */
export interface ChatContextType {
    /** Messages queued for sending (before a session exists or is fetched). */
    pendingMessages: Array<{ message: string; agent_id?: string; session_id?: string }>;
    /** Raw setter for `pendingMessages`. */
    setPendingMessages: React.Dispatch<
        React.SetStateAction<Array<{ message: string; agent_id?: string; session_id?: string }>>
    >;
    /** Whether a new session is currently being created. */
    creatingSession: boolean;
    /**
     * Sends a chat message, creating a new session if needed and streaming the
     * agent response via SSE.
     */
    handleSendMessage: (params: HandleSendMessageParams) => Promise<void>;
    /** Cancels the active SSE stream for a session and marks the last message complete. */
    stopSessionResponse: (sessionId: string | null) => Promise<void>;
    /** Injects an error event into the session chat and transitions to ERROR state. */
    handleOnSocketError: (sessionId: string | null | undefined, error: unknown) => void;
    /** Pre-fetched prompt → response cache used to skip SSE for known prompts. */
    cachedPromptResponses: Map<string, CachedResponseItem[]>;
    /** Suggested prompts for the current session/agent. Owned here to avoid a duplicate hook in UIProvider. */
    suggestedPrompts: string[];
    /** Whether suggested prompts are currently loading. */
    isLoadingSuggestedPrompts: boolean;
    /**
     * Stable ref holding the latest `handleSendMessage` implementation.
     * Useful for callbacks that close over an outdated version.
     */
    handleSendMessageRef: React.RefObject<((params: HandleSendMessageParams) => Promise<void>) | null>;
    /** S3 keys for file attachments pending send. Owned here, re-exposed in UIContext. */
    s3_keys: string[];
    /** Appends keys to the attachment list. */
    setS3Keys: (keys: string[]) => void;
    /** Clears all pending attachment keys. */
    clearS3Keys: () => void;
    /** Sidebar collapse flag — set by UIProvider, consumed here for SSE message handling. */
    isSidebarCollapsedForSSE: boolean;
    /** Called by UIProvider to keep the sidebar-collapse flag in sync. */
    setIsSidebarCollapsedForSSE: (v: boolean) => void;
}
