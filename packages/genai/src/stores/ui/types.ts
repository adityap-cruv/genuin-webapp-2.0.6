import type React from 'react';


import type { HandleSendMessageParams } from '@/modules/chat/types';
import type { AutoPromptConfig } from '@/modules/lifecycle/auto-prompt-config';
import type { OctoStateChangeCallback } from '@/modules/lifecycle/types';
import type { Agent, IpInfo, Session } from '@/types';

import type { OctoState } from '../../core/state-machine/octo-state';

export interface VideoStyleOption {
    name?: string;
    url?: string;
    selected: boolean;
    value: string;
}

export interface VideoStyle {
    name: string;
    field: string;
    disabled?: boolean;
    options?: VideoStyleOption[];
    selected: boolean;
}

export interface AgentsContextType {
    // State
    initialAgent: string;
    isMaya: boolean;
    currentAgent: string;
    currentSessionId: string | null;
    sessions: Session[];
    enteredInChatMode: boolean;
    creatingSession: boolean;
    agents: Agent[];
    isSidebarCollapsed: boolean;
    sessionsFetched: boolean;
    s3_keys: string[];
    showAllObjectives: boolean;
    user_id: string;
    brand_id: number;
    isSuggestionsOpen: boolean;
    textAreaRef: HTMLTextAreaElement | null;
    ipInfo: IpInfo | null;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    pendingMessages: Array<{ message: string; agent_id?: string; session_id?: string }>;
    userEmail?: string;
    videoStyles: VideoStyle[];
    onBoardingAgents: string[];
    suggestedPrompts: string[];
    isLoadingSuggestedPrompts: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    videoId?: string;
    webSdkRenderMode: 'compact' | 'full';
    // Actions
    setAgents: (agents: Agent[]) => void;
    setCurrentAgent: (agentId: string) => void;
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    setCurrentSessionId: (sessionId: string | null) => Promise<void>;
    handleSendMessage: (params: HandleSendMessageParams) => Promise<void>;
    stopSessionResponse: (sessionId: string | null) => Promise<void>;
    setIsSidebarCollapsed: (isCollapsed: boolean) => void;
    setFeedback: (sessionId: string, responseId: string, liked: boolean) => void;
    removeSession: (sessionId: string) => void;
    updateSessionName: (sessionId: string, newSessionName: string) => void;
    setEnteredInChatMode: (entered: boolean) => void;
    setSessionsFetched: (fetched: boolean) => void;
    handleOnSocketError: (sessionId: string | null | undefined, error: unknown) => void;
    setS3Keys: (s3Keys: string[]) => void;
    clearS3Keys: () => void;
    setShowAllObjectives: (show: boolean) => void;
    handleNewChat: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    setTextAreaRef: (textAreaRef: HTMLTextAreaElement | null) => void;
    refreshData: () => Promise<unknown[]>;
    toggleStyleSelection: (styleIndex: number) => void;
    toggleOptionSelection: (styleIndex: number, optionIndex: number) => void;
    resetVideoStyles: () => void;
    updateAgentMessageContent: (sessionId: string, messageId: string, newContent: string) => void;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
    allowAutoPrompt?: boolean;
    autoPromptConfig: AutoPromptConfig;
    /** Global lifecycle state of this SDK instance. */
    octoState: OctoState;
    /**
     * Subscribe to OctoState changes. Returns unsubscribe fn.
     * Safe to call outside React render — uses stable ref internally.
     */
    onStateChange: (cb: OctoStateChangeCallback) => () => void;
}
/** Context value exposed by `UIProvider`. */
export interface UIContextType {
  /** Current render view. */
  view: 'page' | 'floater' | 'dialog' | 'web-sdk';
  /** Whether the sidebar is collapsed. */
  isSidebarCollapsed: boolean;
  /** Toggles the sidebar collapsed state. */
  setIsSidebarCollapsed: (v: boolean) => void;
  /** Current web-sdk render mode. */
  webSdkRenderMode: 'compact' | 'full';
  /** Updates the web-sdk render mode and propagates to the global SDK. */
  setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
  /**
   * UI density level supplied directly by the SDK host at init time.
   * Controls the scale of all sizing-sensitive elements (avatar, input, buttons, text).
   * - `'xs'`   — compact strips (320×100, 320×50), smallest density
   * - `'sm'`   — larger ad tiles (300×250 split view), medium density
   * - `'base'` — standard full UI, no scaling applied
   */
  uiDensity: 'xs' | 'sm' | 'base';
  /** S3 keys for file attachments pending send. */
  s3_keys: string[];
  /** Appends keys to the attachment list. */
  setS3Keys: (keys: string[]) => void;
  /** Clears all pending attachment keys. */
  clearS3Keys: () => void;
  /** Whether the "show all objectives" panel is open. */
  showAllObjectives: boolean;
  /** Toggles the "show all objectives" panel. */
  setShowAllObjectives: (v: boolean) => void;
  /** Whether the suggestions panel is open. */
  isSuggestionsOpen: boolean;
  /** Toggles the suggestions panel. */
  setIsSuggestionsOpen: (v: boolean) => void;
  /** Ref to the chat textarea element. */
  textAreaRef: HTMLTextAreaElement | null;
  /** Updates the textarea ref. */
  setTextAreaRef: (ref: HTMLTextAreaElement | null) => void;
  /** Video generation style configuration. */
  videoStyles: VideoStyle[];
  /** Toggles a video style's selected state by index. */
  toggleStyleSelection: (i: number) => void;
  /** Toggles a video style option's selected state by style+option index. */
  toggleOptionSelection: (i: number, j: number) => void;
  /** Resets all video styles to their defaults. */
  resetVideoStyles: () => void;
  /** Current list of suggested chat prompts. */
  suggestedPrompts: string[];
  /** Whether suggested prompts are loading. */
  isLoadingSuggestedPrompts: boolean;
  /** Resets to a new chat (clears session, agent, and s3 keys). */
  handleNewChat: () => void;
  /** Triggers a full data refresh. */
  refreshData: () => Promise<unknown[]>;
  /** Current user e-mail address (optional). */
  userEmail?: string;
  /** Web-SDK parent instance ID (optional). */
  parentWebSdkInstanceId?: string;
  /** Web-SDK parent container ID (optional). */
  parentWebSdkContainerId?: string;
  /** Web-SDK parent embed ID (optional). */
  parentWebSdkEmbedId?: string;
  /** Web-SDK parent placement ID (optional). */
  parentWebSdkPlacementId?: string;
  /** Octo panel ID for targeted render-mode events (optional). */
  parentOctoPanelId?: string;
  /** Video ID passed to the web-sdk (optional). */
  videoId?: string;
  /** Authenticated user ID. */
  user_id: string;
  /** Brand ID. */
  brand_id: number;
  /** Integration type — 'embed' shows suggestions, 'placement' hides them. */
  integrationType?: 'embed' | 'placement';
}
