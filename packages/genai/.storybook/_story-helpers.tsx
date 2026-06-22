import { useMemo, useState, type ReactNode } from "react";

import { AgentsContext } from "../src/context/app/context";
import type { AgentsContextType } from "../src/context/app/types";
import { InputContext } from "../src/context/input/context";
import type { Agent, ChatHistoryEvent, Session } from "../src/types";

/**
 * Storybook-only mock for `useAgentsContext`. Stories pass a partial
 * override; everything else falls back to inert defaults so components
 * render without needing the real provider tree.
 *
 * Treat this as a sibling of `src/context/app/types.ts` — when
 * `AgentsContextType` changes, update the defaults here.
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

const defaultAgentsContext: AgentsContextType = {
  initialAgent: "maya",
  isMaya: true,
  currentAgent: "maya",
  currentSessionId: null,
  sessions: [],
  enteredInChatMode: false,
  creatingSession: false,
  agents: [mockAgent],
  isSidebarCollapsed: false,
  sessionsFetched: true,
  s3_keys: [],
  showAllObjectives: false,
  user_id: "story-user",
  brand_id: 2314,
  isSuggestionsOpen: false,
  textAreaRef: null,
  ipInfo: null,
  view: "page",
  pendingMessages: [],
  userEmail: "story@example.com",
  videoStyles: [],
  onBoardingAgents: [],
  suggestedPrompts: [],
  isLoadingSuggestedPrompts: false,
  webSdkRenderMode: "full",
  setAgents: noop,
  setCurrentAgent: noop,
  setSessions: noop,
  setCurrentSessionId: asyncNoop,
  deleteSession: noop,
  handleSendMessage: asyncNoop,
  stopSessionResponse: asyncNoop,
  markSessionNameAnimationComplete: noop,
  setIsSidebarCollapsed: noop,
  setFeedback: noop,
  removeSession: noop,
  updateSessionName: noop,
  setEnteteredInChatMode: noop,
  setSessionsFetched: noop,
  handleOnSocketError: noop,
  setS3Keys: noop,
  clearS3Keys: noop,
  setShowAllObjectives: noop,
  handleNewChat: noop,
  setIsSuggestionsOpen: noop,
  setTextAreaRef: noop,
  refreshData: async () => [],
  toggleStyleSelection: noop,
  toggleOptionSelection: noop,
  resetVideoStyles: noop,
  updateAgentMessageContent: noop,
  setWebSdkRenderMode: noop,
};

interface MockAgentsProviderProps {
  value?: Partial<AgentsContextType>;
  children: ReactNode;
}

export function MockAgentsProvider({ value, children }: MockAgentsProviderProps) {
  const merged = useMemo(
    () => ({ ...defaultAgentsContext, ...value }) as AgentsContextType,
    [value],
  );
  return <AgentsContext.Provider value={merged}>{children}</AgentsContext.Provider>;
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
  agents?: Partial<AgentsContextType>;
  inputValue?: string;
  children: ReactNode;
}) {
  return (
    <MockAgentsProvider value={agents}>
      <MockInputProvider initialValue={inputValue}>{children}</MockInputProvider>
    </MockAgentsProvider>
  );
}
