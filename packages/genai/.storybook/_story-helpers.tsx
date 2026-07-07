import { useMemo, useRef, useState, type ReactNode } from "react";

import type { AgentContextType } from "../src/modules/agent/types";
import type { HandleSendMessageParams, ChatContextType } from "../src/modules/chat/types";
import type { SessionContextType } from "../src/modules/session/types";
import { AgentContext } from "../src/stores/agent/context";
import { ChatContext } from "../src/stores/chat/context";
import { InputContext } from "../src/stores/input/context";
import { SessionContext } from "../src/stores/session/context";
import { UIContext } from "../src/stores/ui/context";
import type { UIContextType } from "../src/stores/ui/types";
import type { Agent, ChatHistoryEvent, Session } from "../src/types";

/**
 * Storybook-only mocks for `useUIContext` / `useSessionContext` /
 * `useAgentContext` / `useChatContext`. Stories pass a partial override via
 * `MockAgentsProvider`; everything else falls back to inert defaults so
 * components render without needing the real provider tree
 * (`SessionProvider` -> `AgentProvider` -> `ChatProvider` -> `UIProvider`).
 *
 * Treat this as a sibling of the `src/modules/{agent,chat,session}/types.ts`
 * and `src/stores/ui/types.ts` files — update the defaults here when those change.
 */
export const mockAgent: Agent = {
  type: "maya",
  id: "maya",
  name: "Maya",
  description: "Default mock agent for stories",
  image: "",
};

export const mockSession = (overrides: Partial<Session> = {}): Session => ({
  id: "session-1",
  thinking: false,
  status: "fetched",
  chat: [],
  name: "Mock chat session",
  agentId: "maya",
  updatedAt: new Date().toISOString(),
  hasNewName: false,
  hasNewMessage: false,
  thinkingSteps: [],
  ...overrides,
});

export const mockChatEvent = (overrides: Partial<ChatHistoryEvent> = {}): ChatHistoryEvent => ({
  id: `event-${Math.random().toString(36).slice(2, 9)}`,
  message: { content: "" },
  role: "user",
  parent_id: null,
  feedback: null,
  created_at: new Date().toISOString(),
  isCompleted: true,
  ...overrides,
});

const noop = () => {};
const asyncNoop = async () => {};

/** Combined override shape — spans the UI, Session, Agent, and Chat domains. */
type MockContextValue = Partial<UIContextType> &
  Partial<SessionContextType> &
  Partial<Omit<AgentContextType, "filteredAgents">> &
  Partial<ChatContextType>;

interface MockAgentsProviderProps {
  value?: MockContextValue;
  children: ReactNode;
}

export function MockAgentsProvider({ value = {}, children }: MockAgentsProviderProps) {
  const getInitialAgentIdRef = useRef<(() => string) | null>(null);
  const setCurrentAgentStateRef = useRef<((id: string) => void) | null>(null);
  const connectToStreamRef = useRef<((sessionId: string) => Promise<{ isCompleted: boolean }>) | null>(
    null,
  );
  const handleSendMessageRef = useRef<((params: HandleSendMessageParams) => Promise<void>) | null>(
    null,
  );

  const isMaya = value.isMaya ?? true;
  const agents = useMemo(() => value.agents ?? [mockAgent], [value.agents]);

  const uiValue: UIContextType = useMemo(
    () => ({
      view: "page",
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: noop,
      webSdkRenderMode: "full",
      setWebSdkRenderMode: noop,
      uiDensity: "base",
      s3_keys: [],
      setS3Keys: noop,
      clearS3Keys: noop,
      showAllObjectives: false,
      setShowAllObjectives: noop,
      isSuggestionsOpen: false,
      setIsSuggestionsOpen: noop,
      textAreaRef: null,
      setTextAreaRef: noop,
      videoStyles: [],
      toggleStyleSelection: noop,
      toggleOptionSelection: noop,
      resetVideoStyles: noop,
      suggestedPrompts: [],
      isLoadingSuggestedPrompts: false,
      handleNewChat: noop,
      refreshData: async () => [],
      user_id: "story-user",
      brand_id: 2314,
      ...value,
    }),
    [value],
  );

  const sessionValue: SessionContextType = useMemo(
    () => ({
      getInitialAgentIdRef,
      setCurrentAgentStateRef,
      sessions: [],
      setSessions: noop,
      currentSessionId: null,
      setCurrentSessionIdState: noop,
      enteredInChatMode: false,
      setEnteredInChatMode: noop,
      sessionsFetched: true,
      setSessionsFetched: noop,
      ipInfo: null,
      setIpInfo: noop,
      setCurrentSessionId: asyncNoop,
      removeSession: noop,
      updateSessionName: asyncNoop,
      setFeedback: asyncNoop,
      updateAgentMessageContent: noop,
      connectToStreamRef,
      refreshData: async () => [],
      initSessions: noop,
      startNewChat: noop,
      clearSessionForAgentSwitch: noop,
      ...value,
    }),
    [value],
  );

  const agentValue: AgentContextType = useMemo(
    () => ({
      initialAgent: isMaya ? "maya" : (agents[0]?.id ?? "maya"),
      isMaya,
      currentAgent: agents[0]?.id ?? "maya",
      setCurrentAgentState: noop,
      agents,
      filteredAgents: isMaya ? agents.filter((agent: Agent) => agent.id === "maya") : agents,
      onBoardingAgents: [],
      setAgents: noop,
      setCurrentAgent: noop,
      getInitialAgentId: () => "maya",
      setAgentsFromBootstrap: noop,
      ...value,
    }),
    [value, isMaya, agents],
  );

  const chatValue: ChatContextType = useMemo(
    () => ({
      pendingMessages: [],
      setPendingMessages: noop,
      creatingSession: false,
      handleSendMessage: asyncNoop,
      stopSessionResponse: asyncNoop,
      handleOnSocketError: noop,
      cachedPromptResponses: new Map(),
      suggestedPrompts: [],
      isLoadingSuggestedPrompts: false,
      handleSendMessageRef,
      s3_keys: [],
      setS3Keys: noop,
      clearS3Keys: noop,
      isSidebarCollapsedForSSE: false,
      setIsSidebarCollapsedForSSE: noop,
      ...value,
    }),
    [value],
  );

  return (
    <UIContext.Provider value={uiValue}>
      <SessionContext.Provider value={sessionValue}>
        <AgentContext.Provider value={agentValue}>
          <ChatContext.Provider value={chatValue}>{children}</ChatContext.Provider>
        </AgentContext.Provider>
      </SessionContext.Provider>
    </UIContext.Provider>
  );
}

interface MockInputProviderProps {
  initialValue?: string;
  children: ReactNode;
}

export function MockInputProvider({ initialValue = "", children }: MockInputProviderProps) {
  const [input, setInput] = useState(initialValue);
  const value = useMemo(() => ({ input, setInput }), [input]);
  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}

/**
 * Convenience wrapper for stories that need both contexts.
 */
export function MockProviders({
  agents,
  inputValue,
  children,
}: {
  agents?: MockContextValue;
  inputValue?: string;
  children: ReactNode;
}) {
  return (
    <MockAgentsProvider value={agents}>
      <MockInputProvider initialValue={inputValue}>{children}</MockInputProvider>
    </MockAgentsProvider>
  );
}
