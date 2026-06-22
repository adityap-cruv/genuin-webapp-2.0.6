import type { AxiosResponse } from 'axios';
import { useEffect } from 'react';

import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { getBrandAgentId, getIpInfo, getSessionsV2, getSubAgentsV2, userContext } from '@/services/api';
import type { GetAgentIdResponse, SessionV2, SubAgentV2 } from '@/services/apiTypes';
import type { Agent, AgentType, IpInfo, Session } from '@/types';

interface UseAppBootstrapParams {
    brandId: number;
    userEmail?: string;
    userUUID?: string;
    currentSessionIdProp?: string;
    currentSessionId: string | null;
    userId: string;
    // callbacks
    setCurrentSessionId: (
        sessionId: string | null,
        forceSessionsFetched?: boolean,
        fetchedSessions?: Session[]
    ) => void;
    initSessions: (
        rawSessions: SessionV2[],
        opts?: { initialSessionId?: string; localFallback?: Session; ipInfo?: IpInfo | null }
    ) => void;
    setAgentsState: (agents: Agent[]) => void;
    setEnteredInChatMode: (entered: boolean) => void;
    setCurrentAgent: (agentId: string) => void;
    isMaya: boolean;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    onBootstrapComplete?: () => void;
}

export const useAppBootstrap = ({
    brandId,
    userEmail,
    userUUID,
    currentSessionIdProp,
    currentSessionId,
    userId,
    setCurrentSessionId,
    initSessions,
    setAgentsState,
    setEnteredInChatMode,
    setCurrentAgent,
    isMaya,
    view,
    onBootstrapComplete,
}: UseAppBootstrapParams) => {
    // Initial data + user context
    useEffect(() => {
        // Run once on mount – brand/user/session props are treated as static
        userContext.setUserInfo(userEmail, userUUID, brandId, userId);

        const fetchInitialData = async () => {
            const shouldFetchBackendData = brandId !== -1;
            const isWebSdkView = view === 'web-sdk';
            const shouldFetchAgents = shouldFetchBackendData && !isWebSdkView;

            const [agentIdRes, agentsRes, sessionsRes, ipRes] = await Promise.allSettled([
                shouldFetchBackendData && isWebSdkView
                    ? getBrandAgentId(brandId, { agent_facing: 'consumer_facing' })
                    : Promise.resolve(null),
                shouldFetchAgents ? getSubAgentsV2(brandId) : Promise.resolve(null),
                shouldFetchBackendData && !isWebSdkView ? getSessionsV2(brandId, isMaya) : Promise.resolve(null),
                getIpInfo(),
            ]);

            let webSdkAgentId: string | undefined;

            if (isWebSdkView) {
                if (agentIdRes.status === 'fulfilled' && agentIdRes.value) {
                    const response = agentIdRes.value as AxiosResponse<GetAgentIdResponse> | null;
                    const agentId = response?.data?.data;

                    if (typeof agentId === 'string' && agentId.length > 0) {
                        webSdkAgentId = agentId;
                    } else {
                        console.error('Agent id response missing agent id');
                    }
                } else if (agentIdRes.status === 'rejected') {
                    console.error('Failed to fetch agent id:', agentIdRes.reason);
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
                    const agentToUse = matchedAgent || {
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

            const ipInfo = ipRes.status === 'fulfilled' ? ipRes.value : null;

            if (sessionsRes.status === 'fulfilled') {
                const rawSessions: SessionV2[] = sessionsRes.value?.data?.sessions ?? [];
                initSessions(rawSessions, {
                    initialSessionId: currentSessionIdProp,
                    ipInfo,
                });
            } else if (brandId === -1 && currentSessionIdProp) {
                // For local sessions (brandId === -1), use the initial agent slug as placeholder.
                // It will be updated to the proper agent ID once agents are loaded.
                const initialAgentSlug = isMaya ? 'maya' : 'bcc_octo_head';
                const agentId = Array.isArray(agentsResult?.data?.agents)
                    ? agentsResult.data.agents.find((a: SubAgentV2) => a.agent_name === initialAgentSlug)?.id ||
                      initialAgentSlug
                    : initialAgentSlug;
                const localFallback: Session = {
                    id: currentSessionIdProp,
                    name: 'New chat',
                    updatedAt: new Date().toISOString(),
                    agentId,
                    status: 'idle',
                    hasNewName: false,
                    hasNewMessage: false,
                    thinking: false,
                    chat: [],
                    thinkingSteps: [],
                };
                initSessions([], { localFallback, ipInfo });
            }

            onBootstrapComplete?.();
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
        }
    }, [currentSessionIdProp]);

    // Broadcast session id changes
    useEffect(() => {
        eventBus.emit(EVENTS.SESSION_ID_UPDATE, { sessionId: currentSessionId });
    }, [currentSessionId]);
};
