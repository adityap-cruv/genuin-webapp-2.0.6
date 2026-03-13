import type { Agent, IpInfo, Session } from '@/types';
import type { HandleSendMessageParams } from './provider';

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
    webSdkVideoId?: string;
    webSdkRenderMode: 'compact' | 'full';
    // Actions
    setAgents: (agents: Agent[]) => void;
    setCurrentAgent: (agentId: string) => void;
    setSessions: (sessions: Session[]) => void;
    setCurrentSessionId: (sessionId: string | null) => Promise<void>;
    deleteSession: (sessionId: string) => void;
    handleSendMessage: (params: HandleSendMessageParams) => Promise<void>;
    markSessionNameAnimationComplete: (sessionId: string) => void;
    setIsSidebarCollapsed: (isCollapsed: boolean) => void;
    setFeedback: (sessionId: string, responseId: string, liked: boolean) => void;
    removeSession: (sessionId: string) => void;
    updateSessionName: (sessionId: string, newSessionName: string) => void;
    setEnteteredInChatMode: (entered: boolean) => void;
    setSessionsFetched: (fetched: boolean) => void;
    handleOnSocketError: (sessionId: string | null | undefined, error: string | any) => void;
    setS3Keys: (s3Keys: string[]) => void;
    clearS3Keys: () => void;
    setShowAllObjectives: (show: boolean) => void;
    handleNewChat: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    setTextAreaRef: (textAreaRef: HTMLTextAreaElement | null) => void;
    refreshData: () => Promise<any[]>;
    toggleStyleSelection: (styleIndex: number) => void;
    toggleOptionSelection: (styleIndex: number, optionIndex: number) => void;
    resetVideoStyles: () => void;
    updateAgentMessageContent: (sessionId: string, messageId: string, newContent: string) => void;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
}
