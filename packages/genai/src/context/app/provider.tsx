import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { useOctoAnalytics } from '@/context/analytics';
import {
    getBrandSessions,
    getChatHistoryV2,
    getSuggestedPrompts,
    getVideoSuggestedPrompts,
    stopChatSession,
    updateSessionTitle,
} from '@/lib/api';
import type { CachedResponseItem } from '@/lib/apiTypes';
import { ingestDataToBCC } from '@/lib/ingestDataToBCC';
import { useRudderEvents } from '@/services/analytics/useRudderAnalytics';
import type {
    Agent,
    AgentType,
    CarousalMetadata,
    ChatHistoryEvent,
    HandleSSEMessageData,
    IpInfo,
    PendingMessage,
    Session,
    ThinkingStep,
    ToolMetadataPayload,
} from '@/types';

import { AgentsContext } from './context';
import { convertChatHistoryV2ToEvents } from './conversationUtils';
import { useAppBootstrap } from './hooks/useAppBootstrap';
import { useSSEHandler, type SSEMessagePayload } from './hooks/useSSEHandler';
import { useVideoStyles } from './hooks/useVideoStyles';

interface AgentsProviderProps {
    children: ReactNode;
    userId: string;
    brandId: number;
    currentSessionId?: string;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    webSdkRenderMode?: 'compact' | 'full';
    pendingMessages?: Array<PendingMessage>;
    userEmail?: string;
    userUUID?: string;
    isMaya?: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    webSdkVideoId?: string;
    // Integration fields for embed/placement context
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
    allowAutoPrompt?: boolean;
}

export interface HandleSendMessageParams {
    targetSessionId?: string | null;
    messageInput?: string;
    agent_id?: string;
    editedChatId?: string | null;
    metadata?: Record<string, any> | null;
    onMessageQueued?: () => void; // Callback called after message is successfully queued (after session creation if needed)
}

type HandleSendMessageFn = (params: HandleSendMessageParams) => Promise<void>;

// Prevent duplicate processing of the same pendingMessages payload across StrictMode double-mounts
let lastProcessedPendingMessagesSignature: string | null = null;

const MAX_THINKING_STEPS = 4;

const truncateText = (value: string, max = 140) => {
    if (!value) return '';
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const humanizeIdentifier = (value: string) =>
    value
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim();

const parseFunctionResponse = (value: unknown) => {
    if (value == null) return '';
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '';
        try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed === 'string') {
                return parsed;
            }
        } catch {
            // ignore parse errors - fall back to trimmed string
        }
        return trimmed.replace(/^"|"$/g, '');
    }
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const extractToolMetadataSummary = (payload: ToolMetadataPayload | undefined) => {
    if (!payload) return undefined;
    if (Array.isArray(payload.content)) {
        const textEntry = payload.content.find(item => typeof item?.text === 'string');
        if (textEntry?.text) {
            return textEntry.text;
        }
    }

    const displayName = payload.structuredContent?.templates?.display_name;
    const totalCount = payload.structuredContent?.total_count;

    if (displayName && typeof totalCount === 'number') {
        return `Received ${totalCount} results from ${displayName}`;
    }

    if (displayName) {
        return `Received results from ${displayName}`;
    }

    return undefined;
};

function parseMaybeJson<T>(value: unknown): T | undefined {
    if (value == null) return undefined;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        try {
            return JSON.parse(trimmed) as T;
        } catch (err) {
            console.warn('[Provider] Failed to parse JSON payload', err, trimmed);
            return undefined;
        }
    }
    if (typeof value === 'object') {
        return value as T;
    }
    return undefined;
}

const toNumberArray = (value: unknown): number[] => {
    if (value == null) return [];
    const input = Array.isArray(value) ? value : [value];
    return input
        .map(item => {
            const num = typeof item === 'number' ? item : Number(item);
            return Number.isFinite(num) ? num : null;
        })
        .filter((num): num is number => num !== null);
};

const toStringArray = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) {
        return value.map(item => String(item ?? '').trim()).filter((item): item is string => Boolean(item));
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        return trimmed
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }
    const single = String(value ?? '').trim();
    return single ? [single] : [];
};

const normalizeCarouselMetadata = (value: unknown): CarousalMetadata | null => {
    const parsed = parseMaybeJson<Record<string, unknown>>(value);
    if (!parsed) return null;

    const videoIds = toStringArray(parsed.video_ids);
    const keywordsValue = parsed.keywords;
    const keywords =
        typeof keywordsValue === 'string'
            ? keywordsValue
            : Array.isArray(keywordsValue)
              ? keywordsValue
                    .map(item => (typeof item === 'string' ? item.trim() : ''))
                    .filter(Boolean)
                    .join(', ')
              : '';

    if (!videoIds.length && !keywords) {
        return null;
    }

    return {
        brand_ids: toNumberArray(parsed.brand_ids),
        cta: typeof parsed.cta === 'string' ? parsed.cta : '',
        url: typeof parsed.url === 'string' ? parsed.url : '',
        h1: typeof parsed.h1 === 'string' ? parsed.h1 : '',
        h2: typeof parsed.h2 === 'string' ? parsed.h2 : '',
        keywords,
        video_ids: videoIds,
    };
};

const normalizeToolMetadata = (value: unknown): ToolMetadataPayload | undefined => {
    const parsed = parseMaybeJson<ToolMetadataPayload>(value);
    if (!parsed || typeof parsed !== 'object') {
        return undefined;
    }
    return parsed;
};

export const AgentsProvider: React.FC<AgentsProviderProps> = ({
    children,
    userId,
    brandId,
    userEmail,
    userUUID,
    currentSessionId: currentSessionIdProp,
    view: viewProp,
    pendingMessages: pendingMessagesProp,
    isMaya,
    parentWebSdkInstanceId,
    parentWebSdkContainerId,
    parentWebSdkEmbedId,
    parentWebSdkPlacementId,
    parentOctoPanelId,
    webSdkVideoId,
    webSdkRenderMode,
    integrationType,
    integrationId,
    contentOrder,
    allowAutoPrompt = true,
}) => {
    const initialAgent = isMaya ? 'maya' : '695cefa2c19e333c687787f7';
    // State
    const [pendingMessages, setPendingMessages] = useState<
        Array<{ message: string; agent_id?: string; session_id?: string }>
    >(pendingMessagesProp || []);
    const [view, _setView] = useState<'page' | 'floater' | 'dialog' | 'web-sdk'>(viewProp);
    const [currentAgent, setCurrentAgentState] = useState<string>(initialAgent);
    const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(currentSessionIdProp || null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [enteredInChatMode, setEnteredInChatMode] = useState<boolean>(
        currentSessionIdProp ? true : isMaya ? true : false
    );
    const [localAllowAutoPrompt, setLocalAllowPrompt] = useState(allowAutoPrompt);
    const [creatingSession, _setCreatingSession] = useState<boolean>(false);
    const [agents, setAgentsState] = useState<Agent[]>([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [sessionsFetched, setSessionsFetched] = useState<boolean>(false);
    const [s3_keys, setS3KeysState] = useState<string[]>([]);
    const [showAllObjectives, setShowAllObjectives] = useState<boolean>(false);
    const [_agentsFetched, _setAgentsFetched] = useState<boolean>(false);
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
    const [textAreaRef, setTextAreaRef] = useState<HTMLTextAreaElement | null>(null);
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [isLoadingSuggestedPrompts, setIsLoadingSuggestedPrompts] = useState<boolean>(false);
    const [cachedPromptResponses, setCachedPromptResponses] = useState<Map<string, CachedResponseItem[]>>(new Map());
    const [webSdkRenderModeState, setWebSdkRenderModeState] = useState<'compact' | 'full'>(webSdkRenderMode ?? 'full');
    const { videoStyles, toggleStyleSelection, toggleOptionSelection, resetVideoStyles } = useVideoStyles(brandId);
    const { analytics } = useOctoAnalytics();
    const handleSendMessageRef = useRef<HandleSendMessageFn | null>(null);
    // Map to track temp session IDs to real session IDs for handling race conditions
    const sessionIdMapRef = useRef<Map<string, string>>(new Map());
    // Ref to store connectToStream function to avoid circular dependency
    const connectToStreamRef = useRef<((sessionId: string) => Promise<{ isCompleted: boolean }>) | null>(null);
    const onBoardingAgents = useMemo(
        () => [
            'brand_asset_agent',
            'brand_ctkws_agent',
            'brand_guidelines_agent',
            'brand_persona_agent',
            'industry_type_agent',
            'consumer_brands_agent',
            // 'video_generator_agent',
            'social_handle_fetcher_agent',
        ],
        []
    );
    const { track } = useRudderEvents();

    // Filter agents based on isMaya mode
    // When isMaya is true, only show Maya agent; otherwise show all agents
    const filteredAgents = useMemo(() => {
        if (isMaya) {
            // In Maya-only mode, filter to only show Maya agent
            return agents.filter(agent => agent.id === 'maya');
        }
        // Normal mode - show all agents
        return agents;
    }, [agents, isMaya]);

    // Update currentAgent to proper agent ID once agents are loaded
    // initialAgent is a slug, so we need to convert it to an ID
    useEffect(() => {
        if (agents.length > 0 && currentAgent === initialAgent) {
            const agent = agents.find(a => a.id === initialAgent);
            if (agent && agent.id !== currentAgent) {
                setCurrentAgentState(agent.id);
            }
        }
    }, [agents, currentAgent, initialAgent]);

    // Fetch suggested prompts when agent changes (for AgentIntro screen)
    useEffect(() => {
        if (!currentAgent || !enteredInChatMode || currentSessionId) {
            return;
        }

        let isCancelled = false;

        const fetchPrompts = async () => {
            setSuggestedPrompts([]);
            setIsLoadingSuggestedPrompts(true);
            setCachedPromptResponses(new Map());

            let prompts: string[] | null = null;

            if (view === 'web-sdk' && webSdkVideoId) {
                try {
                    const response = await getVideoSuggestedPrompts({
                        video_id: webSdkVideoId,
                        includeCarouselMetadata: false,
                        includeAgentResponse: true,
                    });

                    // Extract prompts and build cached responses map
                    const cachedMap = new Map<string, CachedResponseItem[]>();
                    const videoPrompts = (response?.data || [])
                        .map(item => {
                            // Store cached response if it exists
                            if (item.response && Array.isArray(item.response) && item.response.length > 0) {
                                cachedMap.set(item.prompt, item.response);
                            }
                            return item.prompt;
                        })
                        .filter((prompt): prompt is string => typeof prompt === 'string' && prompt.length > 0);

                    if (videoPrompts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * videoPrompts.length);
                        const randomPrompt = videoPrompts[randomIndex];
                        const orderedPrompts = randomPrompt
                            ? [randomPrompt, ...videoPrompts.filter((_, index) => index !== randomIndex)]
                            : videoPrompts;
                        prompts = orderedPrompts;
                        setCachedPromptResponses(cachedMap);
                    } else {
                        prompts = [];
                    }
                } catch (error) {
                    console.error('Failed to fetch video suggested prompts:', error);
                }
            }

            if (prompts === null) {
                try {
                    const response = await getSuggestedPrompts(currentAgent);
                    const agentPrompts = response.data?.prompts ?? [];
                    if (agentPrompts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * agentPrompts.length);
                        const randomPrompt = agentPrompts[randomIndex];
                        const orderedPrompts = randomPrompt
                            ? [randomPrompt, ...agentPrompts.filter((_, index) => index !== randomIndex)]
                            : agentPrompts;
                        prompts = orderedPrompts;
                    } else {
                        prompts = [];
                    }
                } catch (error) {
                    console.error('Failed to fetch suggested prompts:', error);
                    prompts = [];
                }
            }

            if (!isCancelled) {
                setSuggestedPrompts(prompts ?? []);
                setIsLoadingSuggestedPrompts(false);
            }
        };

        void fetchPrompts();

        return () => {
            isCancelled = true;
        };
    }, [brandId, currentAgent, currentSessionId, enteredInChatMode, view, webSdkVideoId]);

    // Helper to get initial agent ID (falls back to slug if agents not loaded)
    const getInitialAgentId = useCallback(() => {
        const agent = agents.find(a => a.id === initialAgent);
        return agent?.id || initialAgent;
    }, [agents, initialAgent]);

    // Functions
    const setAgents = useCallback((newAgents: Agent[]) => {
        setAgentsState(prev => [...prev, ...newAgents.filter((agent: Agent) => !prev.some(a => a.id === agent.id))]);
        // setCurrentAgentState();
    }, []);

    const setCurrentAgent = useCallback(
        (agentId: string) => {
            if (currentAgent === agentId) return;

            if (ipInfo) {
                const agent = agents.find(a => a.id === agentId);
                const payload = {
                    ipInfo,
                    id: agent?.id,
                    name: agent?.name,
                    session_id: currentSessionId,
                };
                track('genai:agent_selected', payload);
            }

            setCurrentAgentState(agentId);
            setCurrentSessionIdState(null);
            setEnteredInChatMode(agentId === getInitialAgentId() ? (isMaya ? true : false) : true);
        },
        [agents, currentAgent, currentSessionId, ipInfo, track, initialAgent, isMaya]
    );

    /**
     * Check and reconnect to an ongoing stream for a session.
     * Called after chat history is loaded to handle browser refresh scenarios.
     */
    const checkAndReconnectStream = useCallback(async (sessionId: string) => {
        const connectToStream = connectToStreamRef.current;
        if (!connectToStream) {
            console.warn('connectToStream not yet available');
            return;
        }

        // Set session to thinking state before connecting
        setSessions(prev =>
            prev.map(s => {
                if (s.id !== sessionId) return s;
                // Add a thinking agent event if the last message was from user
                const lastEvent = s.chat[s.chat.length - 1];
                if (lastEvent && lastEvent.role === 'user') {
                    const thinkingAgentEvent: ChatHistoryEvent = {
                        id: `agent-${Date.now()}`,
                        message: { content: '' },
                        role: 'agent',
                        parent_id: lastEvent.id,
                        feedback: null,
                        created_at: new Date().toISOString(),
                    };
                    return {
                        ...s,
                        chat: [...s.chat, thinkingAgentEvent],
                        thinking: true,
                        thinkingSteps: [],
                    };
                }
                return { ...s, thinking: true, thinkingSteps: [] };
            })
        );

        try {
            const result = await connectToStream(sessionId);

            if (result.isCompleted) {
                // Stream is completed or not found - update session state
                setSessions(prev =>
                    prev.map(s => {
                        if (s.id !== sessionId) return s;
                        // Remove empty thinking event if it exists
                        const chat = s.chat.filter(
                            e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
                        );
                        return {
                            ...s,
                            chat,
                            thinking: false,
                            thinkingSteps: [],
                        };
                    })
                );
            }
            // If not completed, the stream will continue and handleSSEMessage will handle updates
        } catch (error) {
            console.error('Failed to reconnect to stream:', error);
            // Clean up thinking state on error
            setSessions(prev =>
                prev.map(s => {
                    if (s.id !== sessionId) return s;
                    const chat = s.chat.filter(
                        e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
                    );
                    return {
                        ...s,
                        chat,
                        thinking: false,
                        thinkingSteps: [],
                    };
                })
            );
        }
    }, []);

    const setCurrentSessionId = useCallback(
        async (sessionId: string | null, forceSessionsFetched = false, fetchedSessions?: Session[]) => {
            if (!sessionId) {
                setCurrentSessionIdState(null);
                setCurrentAgentState(getInitialAgentId());
                setEnteredInChatMode(isMaya ? true : false);
                return;
            }
            const sessionsToSearch = fetchedSessions || sessions;
            const targetSession = sessionsToSearch.find(s => s.id === sessionId);

            if (currentSessionId === sessionId && targetSession && targetSession.status === 'fetched') return;

            // Track session switched if switching from one session to another (not initial load)
            if (currentSessionId && currentSessionId !== sessionId) {
                analytics.trackSessionSwitched({
                    from_session_id: currentSessionId,
                    to_session_id: sessionId,
                });
            }

            if (targetSession && targetSession.thinking) {
                setCurrentSessionIdState(sessionId);
                setCurrentAgentState(targetSession?.agentId || getInitialAgentId());
                setEnteredInChatMode(true);
                return;
            }

            try {
                if (forceSessionsFetched && fetchedSessions) {
                    setSessions(fetchedSessions.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
                } else {
                    setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
                }

                setCurrentSessionIdState(sessionId);
                setCurrentAgentState(targetSession?.agentId || getInitialAgentId());
                setEnteredInChatMode(true);

                const response = await getChatHistoryV2(sessionId);

                // Convert V2 linear history to ChatHistoryEvent format
                const chat = convertChatHistoryV2ToEvents(response.data.history);
                console.log('chat', chat);
                const agentId = response.data.agent_id;

                setSessions(prev =>
                    prev.map(s => {
                        if (s.id !== sessionId) return s;

                        const agent = agentId || s.agentId || currentAgent;
                        return {
                            ...s,
                            chat,
                            status: 'fetched',
                            hasNewMessage: false,
                            agentId: agent,
                        };
                    })
                );

                // After loading chat history, check if there's an ongoing stream to reconnect to
                // This handles browser refresh scenarios where the stream was interrupted
                checkAndReconnectStream(sessionId);
            } catch {
                toast.error('Failed to load session history.');
            }
        },
        [currentSessionId, sessions, currentAgent, checkAndReconnectStream, analytics]
    );

    const deleteSession = useCallback((sessionId: string) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
    }, []);

    const markSessionNameAnimationComplete = useCallback((sessionId: string) => {
        setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, hasNewName: false } : s)));
    }, []);

    const setFeedback = useCallback(async (sessionId: string, responseId: string, liked: boolean) => {
        setSessions(prev =>
            prev.map(s =>
                s.id === sessionId
                    ? {
                          ...s,
                          chat: s.chat.map(event => (event.id === responseId ? { ...event, feedback: liked } : event)),
                      }
                    : s
            )
        );
    }, []);

    function removeSession(sessionId: string) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
            setCurrentSessionIdState(null);
            setCurrentAgentState(getInitialAgentId());
            setEnteredInChatMode(isMaya ? true : false);
        }
    }

    async function updateSessionName(sessionId: string, newSessionName: string) {
        const oldName = sessions.find(s => s.id === sessionId)?.name || '';
        try {
            setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: newSessionName } : s)));

            await updateSessionTitle({
                session_id: sessionId,
                title: newSessionName,
            });
        } catch {
            setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: oldName } : s)));
            toast.error('Failed to update session name.');
        }
    }

    function setEnteteredInChatMode(entered: boolean) {
        setEnteredInChatMode(entered);
    }

    function updateAgentMessageContent(sessionId: string, messageId: string, newContent: string) {
        setSessions(prev =>
            prev.map(s =>
                s.id === sessionId
                    ? {
                          ...s,
                          chat: s.chat.map(event =>
                              event.id === messageId ? { ...event, message: { content: newContent } } : event
                          ),
                      }
                    : s
            )
        );
    }

    // Fetch suggested prompts for the given agent
    const fetchSuggestedPrompts = useCallback(
        async (agentId: string, params?: { user_query: string; agent_response: string }) => {
            if (!agentId) return;
            setIsLoadingSuggestedPrompts(true);
            try {
                const response = await getSuggestedPrompts(agentId, params);
                if (response.data?.prompts) {
                    setSuggestedPrompts(response.data.prompts);
                }
            } catch (error) {
                console.error('Failed to fetch suggested prompts:', error);
                setSuggestedPrompts([]);
            } finally {
                setIsLoadingSuggestedPrompts(false);
            }
        },
        []
    );

    function handleOnSocketError(sessionId: string | null | undefined, error: string | any) {
        // Handle error message - extract string from object if needed
        let errorMessage = 'Something went wrong. Please try again.';
        if (typeof error === 'string') {
            errorMessage = error || errorMessage;
        } else if (error && typeof error === 'object') {
            // If error is an object with a message property, use that
            errorMessage = error.message || error.error || errorMessage;
        }

        setSessions(prev =>
            prev.map((s: Session) => {
                if (s.id !== sessionId) return s;

                // Update last chat event or append a new one
                const chat = [...s.chat];

                if (chat.length > 0) {
                    const lastIndex = chat.length - 1;
                    const lastChat = chat[lastIndex];
                    if (lastChat) {
                        chat[lastIndex] = {
                            ...lastChat,
                            message: { content: 'Something went wrong. Please try again.' },
                            role: 'agent',
                            isCompleted: true,
                            error: errorMessage,
                        };
                    }
                } else {
                    const errorChatEvent: ChatHistoryEvent = {
                        id: `${new Date().toISOString()}-error`,
                        message: { content: 'Something went wrong. Please try again.' },
                        role: 'agent',
                        parent_id: null,
                        feedback: null,
                        created_at: new Date().toISOString(),
                        artifacts: [],
                        isCompleted: true,
                        error: errorMessage,
                    };

                    chat.push(errorChatEvent);
                }

                return {
                    ...s,
                    chat,
                    thinking: false,
                    status: 'error',
                    thinkingSteps: [],
                };
            })
        );

        toast.error(errorMessage);
    }

    const handleSSEMessage = useCallback(
        (data: HandleSSEMessageData) => {
            const sessionId = data.session_id;
            if (!sessionId) return;

            // Check if this sessionId maps to a temp session that hasn't been updated yet
            const tempSessionId = sessionIdMapRef.current.get(sessionId);

            setSessions(prev => {
                return prev.map((s: Session) => {
                    // Match either the real session ID or the temp session ID
                    if (s.id !== sessionId && s.id !== tempSessionId) return s;

                    // If we matched via temp ID, we need to update the session ID
                    const isMatchedByTempId = s.id === tempSessionId;

                    // Create a new chat array to ensure React detects the change
                    const chat = [...s.chat];
                    const wasThinking = s.thinking;
                    // let hasChanges = isMatchedByTempId; // If matched by temp ID, we have changes (ID update)

                    // Handle user_message_id - typically received first
                    if (data.user_message_id !== undefined) {
                        // This is usually just for tracking, no state update needed
                        // But we can use it to identify which user message this response belongs to
                    }

                    // Track if we're receiving streaming data (actual agent response chunks)
                    let hasStreamingUpdate = wasThinking;
                    const lastEvent = chat[chat.length - 1];

                    const existingSteps = s.thinkingSteps ?? [];
                    let thinkingSteps: ThinkingStep[] = existingSteps;
                    let stepsMutated = false;

                    const ensureStepsClone = () => {
                        if (!stepsMutated) {
                            thinkingSteps = [...thinkingSteps];
                            stepsMutated = true;
                        }
                    };

                    const resetThinkingSteps = () => {
                        if (thinkingSteps.length > 0 || !stepsMutated) {
                            thinkingSteps = [];
                            stepsMutated = true;
                        }
                    };

                    // Helper to add content types to sequence as events arrive
                    const addToContentSequence = (contentType: 'koah_ads' | 'inventory' | 'agent_text' | 'videos') => {
                        // Find or create agent event to attach sequence to
                        let agentEvent = chat
                            .slice()
                            .reverse()
                            .find(e => e.role === 'agent');

                        if (!agentEvent) {
                            // Create a new agent event if none exists
                            const previousEventId = lastEvent?.id || '';
                            agentEvent = {
                                id: `pending-agent-${sessionId}`,
                                message: { content: '' },
                                role: 'agent',
                                parent_id: previousEventId || null,
                                feedback: null,
                                created_at: new Date().toISOString(),
                                contentSequence: [],
                                isCompleted: false,
                            };
                            chat.push(agentEvent);
                        }

                        // Add content type to sequence if not already there
                        const existingSequence = agentEvent.contentSequence || [];
                        if (!existingSequence.includes(contentType)) {
                            const index = chat.findIndex(e => e.id === agentEvent!.id);
                            const chatAtIndex = chat[index];
                            if (index >= 0 && chatAtIndex) {
                                chat[index] = {
                                    ...chatAtIndex,
                                    contentSequence: [...existingSequence, contentType],
                                };
                            }
                        }
                    };

                    const addThinkingStep = (step: ThinkingStep) => {
                        ensureStepsClone();
                        thinkingSteps = [...thinkingSteps, step];
                        if (thinkingSteps.length > MAX_THINKING_STEPS) {
                            thinkingSteps = thinkingSteps.slice(-MAX_THINKING_STEPS);
                        }
                    };

                    const updateThinkingStepAtIndex = (
                        index: number,
                        updater: (current: ThinkingStep) => ThinkingStep
                    ) => {
                        if (index < 0 || index >= thinkingSteps.length) return;
                        ensureStepsClone();
                        const currentStep = thinkingSteps[index];
                        if (currentStep) {
                            thinkingSteps[index] = updater(currentStep);
                        }
                    };

                    const newCycleTriggered =
                        !wasThinking &&
                        (data.type === 'function_call' ||
                            data.type === 'function_response' ||
                            data.type === 'message' ||
                            data.function_name !== undefined ||
                            data.function_response !== undefined ||
                            data.agent_message_id !== undefined);

                    if (newCycleTriggered) {
                        resetThinkingSteps();
                    }

                    if (data.type === 'metadata' && typeof data.session_name === 'string' && data.session_name.trim()) {
                        const stepId = `session-name-${sessionId}`;
                        const summary = truncateText(normalizeWhitespace(data.session_name), 80);
                        const existingIndex = thinkingSteps.findIndex(step => step.id === stepId);
                        const payload: ThinkingStep = {
                            id: stepId,
                            type: 'metadata',
                            title: 'Naming conversation',
                            detail: summary,
                        };

                        if (existingIndex >= 0) {
                            updateThinkingStepAtIndex(existingIndex, current => ({
                                ...current,
                                ...payload,
                            }));
                        } else {
                            addThinkingStep(payload);
                        }
                    }

                    // Handle koah_ads event - indicates Koah ads should be rendered
                    if (data.type === 'koah_ads') {
                        addToContentSequence('koah_ads');
                    }

                    if (data.type === 'tool_metadata' && data.tool_metadata) {
                        const toolMetadataPayload = normalizeToolMetadata(data.tool_metadata);
                        if (toolMetadataPayload) {
                            const requestId = toolMetadataPayload._meta?.request_id;
                            const toolEventId = requestId ? `tool-${requestId}` : `tool-${Date.now()}`;
                            const existingIndex = chat.findIndex(event => event.id === toolEventId);

                            const baseEvent: ChatHistoryEvent = (existingIndex >= 0
                                ? chat[existingIndex]
                                : undefined) ?? {
                                id: toolEventId,
                                message: { content: '' },
                                role: 'agent',
                                parent_id: lastEvent?.id || null,
                                feedback: null,
                                created_at: new Date().toISOString(),
                            };

                            const updatedEvent: ChatHistoryEvent = {
                                ...baseEvent,
                                message: {
                                    ...baseEvent.message,
                                    content: '',
                                },
                                metadata: {
                                    ...baseEvent.metadata,
                                    toolMetadata: toolMetadataPayload,
                                },
                                isCompleted: true,
                                is_cached: data.is_cached,
                            };

                            if (existingIndex >= 0) {
                                chat[existingIndex] = updatedEvent;
                            } else {
                                chat.push(updatedEvent);
                            }

                            // Track that inventory content arrived
                            addToContentSequence('inventory');

                            const summary = extractToolMetadataSummary(toolMetadataPayload);
                            if (summary) {
                                addThinkingStep({
                                    id: uuidv4(),
                                    type: 'tool',
                                    title: 'Tool results ready',
                                    detail: truncateText(normalizeWhitespace(summary), 160),
                                });
                            }

                            // Don't stop thinking here - wait for response_completed
                        }
                    }

                    if (data.function_name !== undefined) {
                        hasStreamingUpdate = true;
                        if (typeof data.function_name === 'string' && data.function_name.trim()) {
                            const functionName = data.function_name.trim();
                            const existingFunctionStep = thinkingSteps.find(step => step.functionName === functionName);

                            if (!existingFunctionStep && data.type === 'function_call') {
                                addThinkingStep({
                                    id: uuidv4(),
                                    type: 'function_call',
                                    title: `Calling ${humanizeIdentifier(functionName)}`,
                                    functionName,
                                });
                            }
                        }
                        if (lastEvent) {
                            chat[chat.length - 1] = {
                                ...lastEvent,
                                message: { ...lastEvent.message, function_name: data.function_name },
                            };
                        }
                    }
                    if (data.function_response !== undefined) {
                        hasStreamingUpdate = true;
                        if (lastEvent) {
                            let parsedResponse: unknown = data.function_response;
                            if (typeof data.function_response === 'string') {
                                try {
                                    parsedResponse = JSON.parse(data.function_response);
                                } catch (err) {
                                    parsedResponse = data.function_response;
                                }
                            }
                            chat[chat.length - 1] = {
                                ...lastEvent,
                                message: {
                                    ...lastEvent.message,
                                    function_response: parsedResponse,
                                },
                            };
                        }

                        const responseSummary = truncateText(
                            normalizeWhitespace(parseFunctionResponse(data.function_response)),
                            160
                        );

                        if (responseSummary) {
                            let targetIndex = -1;
                            for (let i = thinkingSteps.length - 1; i >= 0; i--) {
                                const step = thinkingSteps[i];
                                if (
                                    step &&
                                    (step.type === 'function_call' || step.type === 'function_response') &&
                                    step.functionName
                                ) {
                                    targetIndex = i;
                                    break;
                                }
                            }

                            if (targetIndex >= 0) {
                                const step = thinkingSteps[targetIndex];
                                const friendlyName = humanizeIdentifier(step?.functionName ?? 'Function');
                                updateThinkingStepAtIndex(targetIndex, current => ({
                                    ...current,
                                    type: 'function_response',
                                    title: `${friendlyName} responded`,
                                    detail: responseSummary,
                                }));
                            } else {
                                addThinkingStep({
                                    id: uuidv4(),
                                    type: 'function_response',
                                    title: 'Function responded',
                                    detail: responseSummary,
                                });
                            }
                        }
                    }

                    // Handle kws (carousel keywords) from SSE stream
                    if (data.carousel_metadata !== undefined) {
                        const normalizedCarousel = normalizeCarouselMetadata(data.carousel_metadata);
                        if (normalizedCarousel && lastEvent) {
                            chat[chat.length - 1] = {
                                ...lastEvent,
                                carousel_metadata: normalizedCarousel,
                            };
                            // Track that videos content arrived
                            addToContentSequence('videos');
                        }
                    }

                    // Handle message chunks - streaming agent response
                    if (data.message !== undefined) {
                        hasStreamingUpdate = true;

                        // Track that agent text content arrived (on first message chunk)
                        if (lastEvent && !lastEvent.contentSequence?.includes('agent_text')) {
                            addToContentSequence('agent_text');
                        }

                        if (typeof data.message === 'string' && data.message.trim()) {
                            const chunk = normalizeWhitespace(data.message);
                            const responseStepId = 'agent-response';
                            const existingIndex = thinkingSteps.findIndex(step => step.id === responseStepId);

                            if (existingIndex >= 0) {
                                updateThinkingStepAtIndex(existingIndex, current => {
                                    const base = current.detail ? `${current.detail} ${chunk}` : chunk;
                                    return {
                                        ...current,
                                        title: 'Drafting response',
                                        detail: truncateText(normalizeWhitespace(base), 160),
                                    };
                                });
                            } else {
                                addThinkingStep({
                                    id: responseStepId,
                                    type: 'message',
                                    title: 'Drafting response',
                                    detail: truncateText(chunk, 160),
                                });
                            }
                        }

                        if (data.agent_message_id) {
                            // Find or create agent event with this agent_message_id
                            const existingAgentEvent = chat.find(
                                e => e.role === 'agent' && e.id === data.agent_message_id
                            );

                            if (existingAgentEvent) {
                                // Append to existing agent event
                                const index = chat.findIndex(e => e.id === data.agent_message_id);
                                chat[index] = {
                                    ...existingAgentEvent,
                                    message: {
                                        ...existingAgentEvent.message,
                                        content: (existingAgentEvent.message?.content || '') + (data.message || ''),
                                    },
                                    is_cached: data.is_cached || existingAgentEvent.is_cached,
                                };
                            } else {
                                // Find last agent event (might be the thinking event we created)
                                const lastAgentEvent = chat
                                    .slice()
                                    .reverse()
                                    .find(e => e.role === 'agent' && !e.message?.content?.trim());

                                if (lastAgentEvent) {
                                    // Replace empty thinking event with real agent event
                                    const index = chat.findIndex(e => e.id === lastAgentEvent.id);
                                    chat[index] = {
                                        ...lastAgentEvent,
                                        id: data.agent_message_id,
                                        message: {
                                            ...lastAgentEvent.message,
                                            content: data.message || '',
                                        },
                                        is_cached: data.is_cached,
                                        isCompleted: false, // Explicitly set to false for streaming
                                    };
                                } else {
                                    // Create new agent event (first chunk of agent response)
                                    const previousEventId = lastEvent?.id || '';
                                    const agentEvent: ChatHistoryEvent = {
                                        id: data.agent_message_id,
                                        message: { content: data.message || '' },
                                        role: 'agent',
                                        parent_id: previousEventId || null,
                                        feedback: null,
                                        created_at: new Date().toISOString(),
                                        is_cached: data.is_cached,
                                        isCompleted: false, // Explicitly set to false for streaming
                                    };
                                    chat.push(agentEvent);
                                }
                            }
                        } else {
                            // Message chunk without agent_message_id - append to last agent event
                            const lastAgentEvent = chat
                                .slice()
                                .reverse()
                                .find(e => e.role === 'agent');

                            if (lastAgentEvent) {
                                const index = chat.findIndex(e => e.id === lastAgentEvent.id);
                                chat[index] = {
                                    ...lastAgentEvent,
                                    message: {
                                        ...lastAgentEvent.message,
                                        content: (lastAgentEvent.message?.content || '') + (data.message || ''),
                                    },
                                    is_cached: data.is_cached || lastAgentEvent.is_cached,
                                };
                            } else {
                                // No agent event exists yet, create one
                                const previousEventId = lastEvent?.id || '';
                                const agentEvent: ChatHistoryEvent = {
                                    id: `agent-${Date.now()}`,
                                    message: { content: data.message || '' },
                                    role: 'agent',
                                    parent_id: previousEventId || null,
                                    feedback: null,
                                    created_at: new Date().toISOString(),
                                    is_cached: data.is_cached,
                                    isCompleted: false, // Explicitly set to false for streaming
                                };
                                chat.push(agentEvent);
                            }
                        }
                    }

                    // Handle agent_message_id - when received, ensure agent event exists and has correct ID
                    if (data.agent_message_id !== undefined && data.message === undefined) {
                        if (wasThinking) {
                            hasStreamingUpdate = true;
                        }
                        const existingAgentEvent = chat.find(e => e.role === 'agent' && e.id === data.agent_message_id);

                        if (!existingAgentEvent) {
                            // Find last agent event with temporary ID (starts with 'agent-') to update its ID
                            const lastTempAgentEvent = chat
                                .slice()
                                .reverse()
                                .find(e => e.role === 'agent' && e.id.startsWith('agent-'));

                            if (lastTempAgentEvent) {
                                // Update the temporary agent event with the real agent_message_id
                                const index = chat.findIndex(e => e.id === lastTempAgentEvent.id);
                                chat[index] = {
                                    ...lastTempAgentEvent,
                                    id: data.agent_message_id,
                                };
                            } else {
                                // No temp agent event found - check if there's any agent event without this ID
                                const lastAgentEvent = chat
                                    .slice()
                                    .reverse()
                                    .find(e => e.role === 'agent');

                                if (!lastAgentEvent) {
                                    // Create agent event only if no agent event exists at all
                                    const lastEvent = chat[chat.length - 1];
                                    const previousEventId = lastEvent?.id || '';
                                    const agentEvent: ChatHistoryEvent = {
                                        id: data.agent_message_id,
                                        message: { content: '' },
                                        role: 'agent',
                                        parent_id: previousEventId || null,
                                        feedback: null,
                                        created_at: new Date().toISOString(),
                                        isCompleted: false, // Explicitly set to false for streaming
                                    };
                                    chat.push(agentEvent);
                                }
                                // If lastAgentEvent exists but doesn't have temp ID, don't create duplicate
                            }
                        }
                    }

                    // Handle session_name update
                    let sessionNameUpdated = false;
                    if (data.session_name !== undefined && data.session_name !== null && data.session_name !== s.name) {
                        // hasChanges = true;
                        sessionNameUpdated = true;
                    }

                    // Handle response_completed - mark agent message as completed
                    if (data.response_completed === true) {
                        // hasChanges = true;
                        const lastEvent = chat[chat.length - 1];
                        if (lastEvent && lastEvent.role === 'agent') {
                            chat[chat.length - 1] = {
                                ...lastEvent,
                                isCompleted: true,
                            };

                            // Track response received
                            const responseLength = lastEvent.message?.content?.length || 0;
                            const createdAtTimestamp = lastEvent.created_at
                                ? new Date(lastEvent.created_at).getTime()
                                : undefined;
                            const responseTime = createdAtTimestamp ? Date.now() - createdAtTimestamp : 0;
                            const videoIds = lastEvent.carousel_metadata?.video_ids ?? [];
                            const includesVideoCarousel = videoIds.length > 0;
                            analytics.trackResponseReceived({
                                response_time: responseTime,
                                includes_video_carousel: includesVideoCarousel,
                                video_count: includesVideoCarousel ? videoIds.length : undefined,
                                response_length: responseLength,
                                session_id: sessionId,
                                agent_id: s.agentId,
                            });

                            // Check if response is JSON for BCC ingestion
                            if (lastEvent.message?.function_response) {
                                if (lastEvent.message?.function_name && lastEvent.message?.function_response) {
                                    try {
                                        const functionData = lastEvent.message?.function_response;
                                        ingestDataToBCC(functionData, lastEvent.message?.function_name).catch(error => {
                                            console.error(error);
                                        });
                                    } catch (parseError) {
                                        console.error('Failed to parse function_response:', parseError);
                                    }
                                }
                            }
                        }

                        // Fetch suggested prompts when response is completed
                        const sessionAgentId = s.agentId;
                        if (sessionAgentId) {
                            // Get the last user message and agent response for contextual prompts
                            const lastUserMessage = chat
                                .slice()
                                .reverse()
                                .find(e => e.role === 'user');
                            const agentResponse = lastEvent?.message?.content || '';

                            fetchSuggestedPrompts(sessionAgentId, {
                                user_query: lastUserMessage?.message?.content || '',
                                agent_response: agentResponse,
                            });
                        }

                        // Clean up the session ID mapping after response is completed
                        if (tempSessionId) {
                            sessionIdMapRef.current.delete(sessionId);
                        }
                    }

                    // Determine thinking state
                    let thinking = s.thinking;

                    if (data.response_completed === true) {
                        // SSE completed - stop thinking
                        thinking = false;
                    } else if (hasStreamingUpdate) {
                        thinking = true;
                    }
                    // Otherwise, keep existing state

                    // Always return updated session with chat array
                    // Use the real sessionId if we matched by temp ID
                    const responseCompleted = data.response_completed === true;
                    return {
                        ...s,
                        id: isMatchedByTempId ? sessionId : s.id,
                        chat,
                        updatedAt: responseCompleted ? new Date().toISOString() : s.updatedAt,
                        name: sessionNameUpdated && data.session_name ? data.session_name : s.name,
                        hasNewName: sessionNameUpdated ? Boolean(isSidebarCollapsed) : s.hasNewName,
                        thinking,
                        hasNewMessage: currentSessionId !== sessionId,
                        thinkingSteps: thinking ? thinkingSteps : [],
                    };
                });
            });
        },
        [currentSessionId, isSidebarCollapsed, handleSendMessageRef, setSessions, fetchSuggestedPrompts]
    );

    // Handler for when a new session is created from streaming response
    const handleSessionCreated = useCallback(
        (tempSessionId: string, realSessionId: string) => {
            // Store the mapping immediately (synchronous) so handleSSEMessage can use it
            sessionIdMapRef.current.set(realSessionId, tempSessionId);

            // Update the temporary session with the real session ID
            // Also clear cached context flags if this was a cached context session
            setSessions(prev =>
                prev.map(s => {
                    if (s.id === tempSessionId) {
                        return {
                            ...s,
                            id: realSessionId,
                            // Clear cached context flags after getting real session_id
                            isCachedContextSession: false,
                            cachedContext: undefined,
                            backendSessionId: realSessionId,
                        };
                    }
                    return s;
                })
            );
            setSessions(prev => {
                const updated = prev.map(s => (s.id === tempSessionId ? { ...s, id: realSessionId } : s));

                // Track session created - check if this is the first session ever
                const isFirstSessionEver = updated.length === 1;
                analytics.trackSessionCreated({
                    session_id: realSessionId,
                    is_first_session_ever: isFirstSessionEver,
                });

                return updated;
            });
            // Update current session ID if it matches the temp ID
            setCurrentSessionIdState(prev => (prev === tempSessionId ? realSessionId : prev));
        },
        [analytics]
    );

    const { sendSSEMessage, connectToStream, cancelStream } = useSSEHandler({
        onMessage: handleSSEMessage,
        onError: handleOnSocketError,
        onSessionCreated: handleSessionCreated,
    });

    // Store connectToStream in ref for use in checkAndReconnectStream
    connectToStreamRef.current = connectToStream;

    function trackChatStarted(messageInput: string) {
        if (ipInfo) {
            const payload = {
                ipInfo,
                session_id: currentSessionId,
                message: messageInput,
            };
            track('genai:chat_started', payload);
        }
    }

    const stopSessionResponse = useCallback(
        async (sessionId: string | null) => {
            if (!sessionId) return;

            const session =
                sessions.find(s => s.id === sessionId) || sessions.find(s => s.backendSessionId === sessionId);

            const backendSessionId = session?.backendSessionId ?? sessionId;
            const tempSessionId =
                sessionIdMapRef.current.get(sessionId) ||
                (backendSessionId ? sessionIdMapRef.current.get(backendSessionId) : undefined);

            const resolveRealSessionId = () => {
                if (backendSessionId && !backendSessionId.startsWith('temp-')) {
                    return backendSessionId;
                }

                for (const [realId, tempId] of sessionIdMapRef.current.entries()) {
                    if (tempId === sessionId || (backendSessionId && tempId === backendSessionId)) {
                        return realId;
                    }
                }

                return undefined;
            };

            const realSessionId = resolveRealSessionId();

            cancelStream(backendSessionId);
            cancelStream(sessionId);
            if (tempSessionId) {
                cancelStream(tempSessionId);
            }

            try {
                if (realSessionId) {
                    await stopChatSession(realSessionId);
                }
            } catch (error: any) {
                const status = error?.response?.status;
                if (status !== 404) {
                    console.error('Failed to stop agent response', error);
                    toast.error('Failed to stop response. Please try again.');
                }
            } finally {
                const targetIds = new Set<string>();
                targetIds.add(sessionId);
                if (backendSessionId) targetIds.add(backendSessionId);
                if (realSessionId) targetIds.add(realSessionId);
                if (tempSessionId) targetIds.add(tempSessionId);

                setSessions(prev =>
                    prev.map(s => {
                        const matchesId = targetIds.has(s.id);
                        const matchesBackend = s.backendSessionId ? targetIds.has(s.backendSessionId) : false;

                        if (!matchesId && !matchesBackend) {
                            return s;
                        }

                        const updatedChat = [...s.chat];
                        if (updatedChat.length > 0) {
                            const lastIndex = updatedChat.length - 1;
                            const lastEvent = updatedChat[lastIndex];
                            if (lastEvent && lastEvent.role === 'agent' && !lastEvent.isCompleted) {
                                updatedChat[lastIndex] = {
                                    ...lastEvent,
                                    isCompleted: true,
                                    metadata: {
                                        ...lastEvent.metadata,
                                        wasStopped: true,
                                    },
                                };
                            }
                        }

                        return {
                            ...s,
                            chat: updatedChat,
                            thinking: false,
                            thinkingSteps: [],
                            status: s.status === 'fetching' ? 'idle' : s.status,
                        };
                    })
                );
            }
        },
        [sessions, userId, cancelStream]
    );

    // Convert cached response array to ChatHistoryEvent format
    function convertCachedResponseToEvents(
        cachedResponse: CachedResponseItem[],
        _userMessageId: string
    ): { agentEvent: ChatHistoryEvent; sessionName: string | null } {
        let agentMessageContent = '';
        let carouselMetadata: CarousalMetadata | null = null;
        let toolMetadata: ToolMetadataPayload | null = null;
        let sessionName: string | null = null;

        for (const item of cachedResponse) {
            if (item.type === 'metadata' && item.session_name) {
                sessionName = item.session_name;
            } else if (item.type === 'message' && item.message) {
                agentMessageContent = item.message;
            } else if (item.type === 'carousel_metadata' && item.carousel_metadata !== undefined) {
                carouselMetadata = normalizeCarouselMetadata(item.carousel_metadata);
            } else if (item.type === 'tool_metadata' && item.tool_metadata !== undefined) {
                toolMetadata = normalizeToolMetadata(item.tool_metadata) ?? null;
            }
        }

        // Build contentSequence based on what data is present
        // koah_ads always appears first for cached video prompt responses
        const contentSequence: ChatHistoryEvent['contentSequence'] = ['koah_ads'];
        if (agentMessageContent) contentSequence.push('agent_text');
        if (toolMetadata) contentSequence.push('inventory');
        if (carouselMetadata) contentSequence.push('videos');

        const agentMessageId = `agent-${Date.now()}`;
        const agentEvent: ChatHistoryEvent = {
            id: agentMessageId,
            message: { content: agentMessageContent },
            role: 'agent',
            is_cached: true, // Mark as cached so it animates
            isCompleted: true,
            carousel_metadata: carouselMetadata ?? undefined,
            metadata: toolMetadata ? { toolMetadata } : undefined,
            parent_id: '',
            feedback: null,
            created_at: new Date().toISOString(),
            contentSequence,
        };

        return { agentEvent, sessionName };
    }

    async function handleSendMessage(params: HandleSendMessageParams) {
        setLocalAllowPrompt(true);
        const { targetSessionId, messageInput, agent_id, editedChatId, onMessageQueued } = params;

        const currentSession = sessions.find((s: Session) => s.id === targetSessionId);
        if (!messageInput?.trim() || currentSession?.thinking || currentSession?.status === 'fetching') return;

        // Check if this prompt has a cached response (Type 2 caching)
        const cachedResponse = cachedPromptResponses.get(messageInput.trim());
        if (cachedResponse && !targetSessionId) {
            // Handle cached response - skip SSE call entirely

            const newNodeId = uuidv4();
            const timestamp = new Date().toISOString();
            const tempSessionId = `temp-${uuidv4()}`;

            // Create user message event
            const userEvent: ChatHistoryEvent = {
                id: newNodeId,
                message: { content: messageInput },
                role: 'user',
                parent_id: '',
                feedback: null,
                created_at: timestamp,
                isCompleted: true,
            };

            // Convert cached response to agent event
            const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedResponse, newNodeId);
            agentEvent.parent_id = userEvent.id;
            agentEvent.created_at = new Date().toISOString();

            trackChatStarted(messageInput);

            // Extract agent response content for previous_context
            const agentResponseContent =
                typeof agentEvent.message === 'string' ? agentEvent.message : agentEvent.message?.content || '';

            // Wait a small delay to ensure SDK has time to load
            // This prevents race condition where carousel renders before SDK is ready
            setTimeout(() => {
                // Create session with cached data
                const newSession: Session = {
                    id: tempSessionId,
                    name: sessionName || 'New chat',
                    chat: [userEvent, agentEvent],
                    updatedAt: timestamp,
                    thinking: false, // Not thinking - response is complete
                    agentId: agent_id || currentAgent || getInitialAgentId(),
                    hasNewName: false,
                    status: 'fetched',
                    hasNewMessage: false,
                    thinkingSteps: [],
                    // Mark as cached context session for handling follow-up messages
                    isCachedContextSession: true,
                    cachedContext: {
                        message: messageInput,
                        agent_response: agentResponseContent,
                        session_name: sessionName || 'New chat',
                    },
                };

                setSessions(prev => [...prev, newSession]);
                setCurrentSessionIdState(tempSessionId);
                setEnteredInChatMode(true);
                setCurrentAgentState(agent_id || currentAgent || getInitialAgentId());
            }, 100); // 100ms delay

            onMessageQueued?.();
            clearS3Keys();

            return; // Skip SSE call
        }

        const newNodeId = uuidv4();
        const sessionId = targetSessionId;
        let tempSessionId: string | undefined;
        // let chat_id: string | null = null;
        let parent_id: string | null = null;
        // let isRegeneration = false;
        const timestamp = new Date().toISOString();

        try {
            const sessionForChatId = sessions.find((s: Session) => s.id === sessionId);

            // Get the last message id (chat_id) BEFORE updating sessions
            if (editedChatId) {
                // When editing/regenerating a previous message, use the edited chat id
                // chat_id = editedChatId;
                // isRegeneration = true;
                // Find the parent_id from the chat array
                const editedEvent = sessionForChatId?.chat.find(e => e.id === editedChatId);
                parent_id = editedEvent?.parent_id || null;
            } else if (sessionId && sessionForChatId) {
                // Use the last message id as parent
                const lastEvent = sessionForChatId.chat[sessionForChatId.chat.length - 1];
                // chat_id = lastEvent?.id || null;
                parent_id = lastEvent?.id || null;
            }
            // For new sessions, chat_id and parent_id will be null (no previous message)

            // Create user message event
            const userEvent: ChatHistoryEvent = {
                id: newNodeId,
                message: { content: messageInput },
                role: 'user',
                parent_id: parent_id || '',
                feedback: null,
                created_at: timestamp,
                isCompleted: true,
            };

            if (!sessionId) {
                // Generate a temporary session ID for UI state
                // The real session_id will come from the first streaming chunk
                tempSessionId = `temp-${uuidv4()}`;

                trackChatStarted(messageInput);

                // Create empty agent event to show thinking indicator immediately
                const thinkingAgentEvent: ChatHistoryEvent = {
                    id: `agent-${Date.now()}`,
                    message: { content: '' },
                    role: 'agent',
                    parent_id: userEvent.id,
                    feedback: null,
                    created_at: new Date().toISOString(),
                };

                setSessions(prev => [
                    ...prev,
                    {
                        id: tempSessionId || '',
                        name: 'New chat',
                        chat: [userEvent, thinkingAgentEvent],
                        updatedAt: timestamp,
                        thinking: true,
                        agentId: agent_id || currentAgent || getInitialAgentId(),
                        hasNewName: false,
                        status: 'fetched',
                        hasNewMessage: false,
                        thinkingSteps: [],
                    },
                ]);
                setCurrentSessionIdState(tempSessionId);
                setEnteredInChatMode(true);
                setCurrentAgentState(agent_id || currentAgent || getInitialAgentId());
            } else {
                // Create empty agent event to show thinking indicator immediately
                const thinkingAgentEvent: ChatHistoryEvent = {
                    id: `agent-${Date.now()}`,
                    message: { content: '' },
                    role: 'agent',
                    parent_id: userEvent.id,
                    feedback: null,
                    created_at: new Date().toISOString(),
                };

                setSessions(prev =>
                    prev.map(s =>
                        s.id === sessionId
                            ? {
                                  ...s,
                                  chat: [...s.chat, userEvent, thinkingAgentEvent],
                                  updatedAt: timestamp,
                                  thinking: true,
                                  thinkingSteps: [],
                              }
                            : s
                    )
                );
            }
            const agentsIncludingMaya = [...agents, { type: 'maya' as AgentType, id: 'maya' }];
            const agent =
                agentsIncludingMaya.find(a => a.id === agent_id) ||
                agentsIncludingMaya.find(a => a.id === currentAgent);
            if (!agent) {
                toast.error('Agent not found.');
                return;
            }
            // Call callback after message is successfully queued and agent is found
            onMessageQueued?.();
            clearS3Keys();

            // Check if this is a follow-up to cached response
            const sessionForPayload = sessions.find((s: Session) => s.id === sessionId);
            const needsPreviousContext =
                sessionForPayload?.isCachedContextSession && !sessionForPayload?.backendSessionId;

            console.log('[Provider] Preparing payload:', {
                sessionId,
                hasSession: !!sessionForPayload,
                isCachedContextSession: sessionForPayload?.isCachedContextSession,
                hasBackendSessionId: !!sessionForPayload?.backendSessionId,
                needsPreviousContext,
                cachedContext: sessionForPayload?.cachedContext,
            });

            // const effectiveAgent = agent_id || currentAgent;
            const payload: SSEMessagePayload = {
                brand_id: brandId,
                message: messageInput,
                agent_id: agent.id,
                agent_type: agent.type,
                session_id: needsPreviousContext ? null : sessionId || null, // Send null if using previous_context
                user_id: userId,
                s3_keys: s3_keys,
                video_id: view === 'web-sdk' ? webSdkVideoId : undefined,
                // For cached context follow-ups, use sessionId as temp_session_id for tracking
                temp_session_id: (needsPreviousContext ? sessionId : tempSessionId) ?? undefined,
                previous_context: needsPreviousContext ? sessionForPayload?.cachedContext : undefined,
                // Integration fields for embed/placement context (only for web-sdk view)
                integration_type: view === 'web-sdk' ? integrationType : undefined,
                integration_id: view === 'web-sdk' ? integrationId : undefined,
                content_order: view === 'web-sdk' ? contentOrder : undefined,
            };

            console.log('[Provider] Sending SSE message with payload:', {
                hasSessionId: !!payload.session_id,
                hasPreviousContext: !!payload.previous_context,
                previousContext: payload.previous_context,
                view,
                integration_type: payload.integration_type,
                integration_id: payload.integration_id,
                content_order: payload.content_order,
                video_id: payload.video_id,
            });

            // if (effectiveAgent === 'video_generator_agent') {
            //     payload.metadata = buildVideoGenerationMetadata(userEmail, userUUID);
            // }

            await sendSSEMessage(payload);

            // Track message sent
            analytics.trackMessageSent({
                message_length: messageInput.length,
                is_first_message: !sessionId,
                is_auto_sent: false,
                used_suggested_prompt: false,
                session_id: sessionId || tempSessionId,
                agent_id: agent.id,
            });
        } catch (error) {
            handleOnSocketError(targetSessionId || tempSessionId || '', 'Failed to send message. Please try again.');

            // Track message send failed
            analytics.trackMessageSendFailed({
                error_message: error instanceof Error ? error.message : 'Unknown error',
                message_preview: messageInput.slice(0, 100),
            });
        }
    }

    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    }, [handleSendMessage]);

    function setS3Keys(s3Keys: string[]) {
        setS3KeysState(prev => [...prev, ...s3Keys]);
    }

    function clearS3Keys() {
        setS3KeysState([]);
    }

    function handleNewChat() {
        setCurrentSessionIdState(null);
        setCurrentAgent(getInitialAgentId());
        setEnteredInChatMode(isMaya ? true : false);
        clearS3Keys();
    }

    async function fetchAndSetSessions(currentSessionIdProp?: string, forceRefetch = false) {
        if (brandId === -1) {
            const sessions: Session[] = [];
            if (currentSessionIdProp) {
                sessions.push({
                    id: currentSessionIdProp,
                    name: 'New chat',
                    updatedAt: new Date().toISOString(),
                    agentId: getInitialAgentId(),
                    status: 'idle',
                    hasNewName: false,
                    hasNewMessage: false,
                    thinking: false,
                    chat: [],
                    thinkingSteps: [],
                });
            }
            return sessions;
        }
        if (sessionsFetched && !forceRefetch) return sessions;
        const res = await getBrandSessions(brandId);
        const fetchedSessions = res.data.sessions.map((s: any) => ({
            id: s.session_id,
            name: s.session_title,
            updatedAt: s.update_time,
            agentId: s.agent_id || getInitialAgentId(),
            status: 'idle',
            hasNewName: false,
            hasNewMessage: false,
            thinking: false,
            chat: [],
            thinkingSteps: [],
        }));
        // don't set if session already exists
        const existingSessions = sessions.map(s => s.id);
        const newSessions = fetchedSessions.filter((s: Session) => !existingSessions.includes(s.id));
        setSessions([...existingSessions, ...newSessions]);
        setSessionsFetched(true);
        return [...existingSessions, ...newSessions];
    }

    function refreshData() {
        return Promise.all([fetchAndSetSessions(currentSessionIdProp, true)]);
    }

    useAppBootstrap({
        brandId,
        userEmail,
        userUUID,
        userId,
        currentSessionIdProp,
        currentSessionId,
        setCurrentSessionId,
        setSessions,
        setSessionsFetched,
        setIpInfo,
        setAgentsState,
        setPendingMessages,
        setEnteredInChatMode,
        setCurrentAgent,
        handleSendMessage,
        view,
        isMaya: isMaya || false,
    });

    // Pending messages (process once per unique payload, avoid StrictMode double-mount duplication)
    useEffect(() => {
        (() => {
            if (!pendingMessages || pendingMessages.length === 0 || !sessionsFetched) return;

            const signature = JSON.stringify(pendingMessages);
            if (signature === lastProcessedPendingMessagesSignature) return;
            lastProcessedPendingMessagesSignature = signature;

            for (const message of pendingMessages) {
                handleSendMessage({
                    targetSessionId: message.session_id,
                    messageInput: message.message,
                    agent_id: message.agent_id,
                });
            }
            setPendingMessages([]);
        })();
    }, [pendingMessages, sessionsFetched, handleSendMessage]);

    useEffect(() => {
        if (webSdkRenderMode && webSdkRenderMode !== webSdkRenderModeState) {
            setWebSdkRenderModeState(webSdkRenderMode);
        }
    }, [webSdkRenderMode]);

    useEffect(() => {
        const listener = (event: Event) => {
            const { detail } = event as CustomEvent<{ mode?: 'compact' | 'full'; parentOctoPanelId?: string }>;
            const { mode, parentOctoPanelId: targetPanelId } = detail || {};

            if (!mode) {
                return;
            }

            if (targetPanelId && parentOctoPanelId && targetPanelId !== parentOctoPanelId) {
                return;
            }

            setWebSdkRenderModeState(mode);
        };

        window.addEventListener('genai:webSdkRenderMode', listener);
        return () => {
            window.removeEventListener('genai:webSdkRenderMode', listener);
        };
    }, [parentOctoPanelId]);

    const setWebSdkRenderModeValue = useCallback((mode: 'compact' | 'full') => {
        setWebSdkRenderModeState(prev => {
            if (prev === mode) {
                return prev;
            }
            return mode;
        });

        if (typeof window !== 'undefined') {
            const globalSdk = (
                window as unknown as { GenAISDK?: { setWebSdkRenderMode?: (mode: 'compact' | 'full') => void } }
            ).GenAISDK;
            try {
                globalSdk?.setWebSdkRenderMode?.(mode);
            } catch (error) {
                console.error('[AgentsProvider] Failed to propagate render mode to SDK', error);
            }
        }
    }, []);

    const contextValue = {
        // State
        initialAgent,
        isMaya: isMaya || false,
        currentAgent,
        currentSessionId,
        sessions,
        enteredInChatMode,
        creatingSession,
        agents: filteredAgents, // Use filtered agents (only Maya when isMaya: true)
        isSidebarCollapsed,
        s3_keys,
        showAllObjectives,
        user_id: userId,
        brand_id: brandId,
        isSuggestionsOpen,
        textAreaRef,
        sessionsFetched,
        ipInfo,
        view,
        allowAutoPrompt: localAllowAutoPrompt,
        globalAllowAutoPrompt: allowAutoPrompt,
        pendingMessages: pendingMessages || [],
        userEmail,
        videoStyles,
        onBoardingAgents,
        suggestedPrompts,
        isLoadingSuggestedPrompts,
        parentWebSdkInstanceId,
        parentWebSdkContainerId,
        parentWebSdkEmbedId,
        parentWebSdkPlacementId,
        parentOctoPanelId,
        webSdkVideoId,
        webSdkRenderMode: webSdkRenderModeState,
        // Actions
        setSessionsFetched,
        setAgents,
        setCurrentAgent,
        setSessions,
        setCurrentSessionId,
        deleteSession,
        handleSendMessage,
        stopSessionResponse,
        markSessionNameAnimationComplete,
        setIsSidebarCollapsed,
        setFeedback,
        removeSession,
        updateSessionName,
        setEnteteredInChatMode,
        handleOnSocketError,
        setS3Keys,
        clearS3Keys,
        setShowAllObjectives,
        handleNewChat,
        setIsSuggestionsOpen,
        setTextAreaRef,
        refreshData,
        toggleStyleSelection,
        toggleOptionSelection,
        resetVideoStyles,
        updateAgentMessageContent,
        setWebSdkRenderMode: setWebSdkRenderModeValue,
    };

    return <AgentsContext.Provider value={contextValue}>{children}</AgentsContext.Provider>;
};
