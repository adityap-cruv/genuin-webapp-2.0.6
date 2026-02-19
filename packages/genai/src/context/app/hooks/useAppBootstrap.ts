import { getBrandOctoHead, getIpInfo, getSessionsV2, getSubAgentsV2, userContext } from '@/lib/api';
import type { GetBrandOctoHeadResponse, SessionV2, SubAgentV2 } from '@/lib/apiTypes';
import type { AxiosResponse } from 'axios';
import type { Agent, AgentType, PendingMessage, Session } from '@/types';
import type { HandleSendMessageParams } from '../provider';
import { useEffect } from 'react';

interface UseAppBootstrapParams {
    brandId: number;
    userEmail?: string;
    userUUID?: string;
    currentSessionIdProp?: string;
    currentSessionId: string | null;
    userId: string;
    // callbacks
    setCurrentSessionId: (sessionId: string | null, forceSessionsFetched?: boolean, fetchedSessions?: Session[]) => void;
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    setSessionsFetched: (value: boolean) => void;
    setIpInfo: (value: any) => void;
    setAgentsState: React.Dispatch<React.SetStateAction<Agent[]>>;
    setPendingMessages: React.Dispatch<
        React.SetStateAction<Array<PendingMessage>>
    >;
    setEnteredInChatMode: (entered: boolean) => void;
    setCurrentAgent: (agentId: string) => void;
    handleSendMessage: (params: HandleSendMessageParams) => Promise<void>;
    inputController?: {
        setInput: (input: string) => void;
    };
    isMaya: boolean;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
}

export const useAppBootstrap = ({
    brandId,
    userEmail,
    userUUID,
    currentSessionIdProp,
    currentSessionId,
    userId,
    setCurrentSessionId,
    setSessions,
    setSessionsFetched,
    setIpInfo,
    setAgentsState,
    setEnteredInChatMode,
    setCurrentAgent,
    inputController,
    isMaya,
    view,
}: UseAppBootstrapParams) => {
    // Initial data + user context
    useEffect(() => {
        // Run once on mount – brand/user/session props are treated as static
        userContext.setUserInfo(userEmail, userUUID, brandId, userId);

        const fetchInitialData = async () => {
            const shouldFetchBackendData = brandId !== -1;
            const isWebSdkView = view === 'web-sdk';
            const shouldFetchAgents = shouldFetchBackendData && !isWebSdkView;

            const [brandOctoHeadRes, agentsRes, sessionsRes, ipRes] = await Promise.allSettled([
                shouldFetchBackendData && isWebSdkView ? getBrandOctoHead(brandId) : Promise.resolve(null),
                shouldFetchAgents ? getSubAgentsV2(brandId) : Promise.resolve(null),
                shouldFetchBackendData ? getSessionsV2(brandId, isMaya) : Promise.resolve(null),
                getIpInfo(),
            ]);

            let webSdkAgentId: string | undefined;

            if (isWebSdkView) {
                if (brandOctoHeadRes.status === 'fulfilled' && brandOctoHeadRes.value) {
                    const response = brandOctoHeadRes.value as AxiosResponse<GetBrandOctoHeadResponse> | null;
                    const payload = response?.data;
                    const data = payload?.data;

                    if (typeof data === 'string') {
                        webSdkAgentId = data;
                    } else if (data && typeof data === 'object') {
                        const possibleId = (data as { agent_id?: string; id?: string }).agent_id || (data as { id?: string }).id;
                        if (typeof possibleId === 'string') {
                            webSdkAgentId = possibleId;
                        }
                    }

                    if (!webSdkAgentId) {
                        console.error('Brand octo head response missing agent id');
                    }
                } else if (brandOctoHeadRes.status === 'rejected') {
                    console.error('Failed to fetch brand octo head agent id:', brandOctoHeadRes.reason);
                }
            }

            const agentsResult = agentsRes.status === 'fulfilled' ? agentsRes.value : null;
            const questions = {
                bcc_octo_head: 'What can I help with your business?',
                brand_strategy_agent: 'What can I help with your objective?',
                content_strategy_agent: 'What can I help with your use case?',
                data_strategy_agent: 'What can I help with your industry?',
                yield_optimizer_agent: 'What can I help with your business?',
            } as const;

            const mappedAgents = Array.isArray(agentsResult?.data?.agents)
                ? agentsResult.data.agents.map((a: SubAgentV2) => ({
                      type: a.agent_type as AgentType,
                      id: a.id,
                      name: a.agent_display_name,
                      description: a.agent_description,
                      image: a.agent_dp,
                      presets: [],
                      question: questions[a.agent_name as keyof typeof questions],
                  }))
                : [];

            if (isWebSdkView) {
                if (webSdkAgentId) {
                    const matchedAgent = mappedAgents.find(agent => agent.id === webSdkAgentId);
                    const agentToUse =
                        matchedAgent || {
                            type: 'octo_head' as AgentType,
                            id: webSdkAgentId,
                            name: 'Octo Head',
                            description: '',
                            image: '',
                            presets: [],
                        };

                    setAgentsState([agentToUse]);
                    setCurrentAgent(agentToUse.id);
                    setEnteredInChatMode(true);
                } else {
                    setAgentsState([]);
                }
            } else {
                setAgentsState(mappedAgents);
            }

            if (sessionsRes.status === 'fulfilled') {
                const data = sessionsRes.value?.data ?? { sessions: [] };
                const fetchedSessions = data.sessions.map((s: SessionV2): Session => ({
                    id: s.id,
                    name: s.session_name,
                    updatedAt: s.last_update_time,
                    agentId: s.agent_id,
                    status: 'idle',
                    hasNewName: false,
                    hasNewMessage: false,
                    thinking: false,
                    chat: [],
                }));

                setSessions(prev => {
                    const existingIds = prev.map(s => s.id);
                    const newSessions = fetchedSessions.filter((s: Session) => !existingIds.includes(s.id));
                    const merged = [...prev, ...newSessions];

                    if (currentSessionIdProp) {
                        setCurrentSessionId(currentSessionIdProp, true, merged);
                    }

                    return merged;
                });
                setSessionsFetched(true);
            } else if (brandId === -1 && currentSessionIdProp) {
                // For local sessions (brandId === -1), use the initial agent slug as placeholder
                // It will be updated to proper agent ID once agents are loaded
                const initialAgentSlug = isMaya ? 'maya' : 'bcc_octo_head';
                const agentId = Array.isArray(agentsResult?.data?.agents)
                    ? agentsResult.data.agents.find((a: SubAgentV2) => a.agent_name === initialAgentSlug)?.id || initialAgentSlug
                    : initialAgentSlug;
                const localSession: Session = {
                    id: currentSessionIdProp,
                    name: 'New chat',
                    updatedAt: new Date().toISOString(),
                    agentId,
                    status: 'idle',
                    hasNewName: false,
                    hasNewMessage: false,
                    thinking: false,
                    chat: [],
                };
                setSessions([localSession]);
            }

            if (ipRes.status === 'fulfilled') {
                setIpInfo(ipRes.value);
            }
        };

        void fetchInitialData();
    }, []);

    // Sync external session id prop (mirror original provider behavior)
    useEffect(() => {
        if (currentSessionIdProp && currentSessionIdProp !== currentSessionId) {
            setCurrentSessionId(currentSessionIdProp);
        } else if (!currentSessionIdProp) {
            setCurrentSessionId(null);
            setEnteredInChatMode(isMaya ? true : false);
            // setCurrentAgent('bcc_octo_head');
            inputController?.setInput('');
        }
    }, [currentSessionIdProp]);

    // Broadcast session id changes
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('genai:sessionIdUpdate', {
                detail: {
                    sessionId: currentSessionId,
                },
            })
        );
    }, [currentSessionId]);
};
