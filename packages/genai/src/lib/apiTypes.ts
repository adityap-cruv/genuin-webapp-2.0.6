// import type { CarousalMetadata } from "@/types";

export interface BaseResponse {
    status: number;
    message: string;
}

export interface GetAgentIdResponse extends BaseResponse {
    data: string;
}

export interface VideoSuggestedPromptItem {
    agent_id?: string;
    prompt?: string;
}

export interface VideoSuggestedPromptsResponse extends BaseResponse {
    data?: {
        response?: VideoSuggestedPromptItem[];
        is_contextual?: boolean;
        expires_at?: string;
    } | null;
}

export interface SubAgentV2 {
    id: string;
    brand_id: number;
    agent_dp: string;
    agent_name: string;
    agent_display_name: string;
    agent_description: string;
    agent_tools: string[];
    agent_instruction: string;
    of_genuin: boolean;
    agent_model: string;
    agent_type: string;
    agent_output_key: string;
    agent_output_schema: any;
    create_time: string;
    update_time: string;
}
export interface GetAgentsV2Response extends BaseResponse {
    data: { agents: SubAgentV2[] };
}

export interface Tool {
    tool_id: string;
    tool_name: string;
    tool_description: string;
    tool_type: 'inbuilt' | 'mcp' | 'api';
}

export interface GetBrandToolsResponse extends BaseResponse {
    data: { tools: Tool[] };
}

export interface SessionV2 {
    id: string;
    brand_id: number;
    user_id: string;
    session_name: string;
    last_update_time: string;
    agent_name: string;
    agent_id: string;
}
export interface GetSessionsV2Response extends BaseResponse {
    data: { sessions: SessionV2[] };
}

export interface CreateSessionV2Response extends BaseResponse {
    data: { session_id: string };
}

export interface ChatHistoryItem {
    id: string;
    session_id: string;
    author: 'user' | 'agent';
    message: string;
    timestamp: string;
}

export interface GetChatHistoryV2Response extends BaseResponse {
    data: {
        history: ChatHistoryItem[];
        agent_id: string;
    };
}

export interface SuggestedPromptsResponse extends BaseResponse {
    data: {
        agent_id: string;
        prompts: string[];
        is_contextual: boolean;
        expires_at: string;
    };
}

export interface StartChatResponse extends BaseResponse {
    data: {
        session_id: string;
        user_message_id: string;
    };
}
