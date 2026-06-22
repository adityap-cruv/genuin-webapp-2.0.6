export type CarousalMetadata = {
    brand_ids: number[];
    cta: string;
    url: string;
    h1: string;
    h2: string;
    keywords: string;
    video_ids: string[];
};

export type VideoMetadata = {
    url?: string;
    thumbnail?: string;
    community_meta?: {
        community_id: string;
        community_name: string;
        community_dp_url: string | null;
    };
    loop_meta?: {
        loop_id: string;
        loop_name: string;
    };
};

export type ToolMetadataContent = {
    type: string;
    text?: string;
};

export type InventoryTemplateInfo = {
    template_id: string;
    brand_id: string;
    display_name?: string;
    [key: string]: unknown;
};

export type InventoryItemInfo = {
    inventory_id: string;
    template_id: string;
    brand_id: string;
    [key: string]: unknown;
};

export type InventoryStructuredContent = {
    request_id?: string;
    query?: string;
    brand_id?: string;
    templates?: InventoryTemplateInfo;
    inventory?: InventoryItemInfo[];
    total_count?: number;
    [key: string]: unknown;
};

export type ToolMetadataPayload = {
    _meta?: {
        request_id?: string;
        [key: string]: unknown;
    };
    content?: ToolMetadataContent[];
    structuredContent?: InventoryStructuredContent;
    isError?: boolean;
    [key: string]: unknown;
};

export type MessageMetadata = {
    video_meta?: VideoMetadata;
    status?: boolean;
    toolMetadata?: ToolMetadataPayload;
    [key: string]: unknown;
};

export type Artifact = {
    id: string;
    name: string;
    type: string;
    s3_key: string;
};

export type AgentPreset = {
    prompt?: string;
    objective?: string;
};

export type AgentType = 'octo_head' | 'octo_leg' | 'maya';

export type Agent = {
    type: AgentType;
    id: string;
    name: string;
    description: string;
    image: string;
    presets?: AgentPreset[];
    question?: string; // question on AgentIntro page
};

// Base chat message structure shared across history event and node types
export type BaseChatMessage = {
    id: string;
    message: {
        content: string;
        function_name?: string | null;
        function_response?: any | null;
    };
    role: 'user' | 'agent';
    parent_id: string | null;
    feedback: boolean | null;
    created_at: string;
    carousel_metadata?: CarousalMetadata;
    artifacts?: Artifact[];
    metadata?: MessageMetadata;
};

// Unified chat history event structure (matches API response)
export type ChatHistoryEvent = BaseChatMessage & {
    // Additional fields for UI state
    isCompleted?: boolean;
    error?: string;
    agent_id?: string | null;
    is_cached?: boolean; // Flag to indicate if this message is from cached response
    contentSequence?: ('koah_ads' | 'inventory' | 'agent_text' | 'videos')[]; // Order in which content events arrived
};

export type ThinkingStepType = 'metadata' | 'function_call' | 'function_response' | 'message' | 'tool';

export type ThinkingStep = {
    id: string;
    type: ThinkingStepType;
    title: string;
    detail?: string;
    functionName?: string;
};

export type Session = {
    id: string;
    thinking: boolean;
    status: 'idle' | 'fetching' | 'fetched' | 'error';
    chat: ChatHistoryEvent[];
    name: string;
    agentId: string;
    updatedAt: string;
    hasNewName: boolean; // Flag to trigger typewriter effect for new session names
    hasNewMessage: boolean; // Flag to indicate if there are new messages in the session
    thinkingSteps: ThinkingStep[];
    // Cached context fields for Type 2 caching
    isCachedContextSession?: boolean; // True if session started with cached response
    cachedContext?: {
        message: string; // Original user prompt
        agent_response: string; // Cached agent response we showed
        session_name: string; // Session name from cached metadata
    };
    backendSessionId?: string; // Real session ID from backend after first follow-up
};

export type UploadedFile = {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    preview?: string;
    s3Key?: string;
    uploadStatus?: 'uploading' | 'success' | 'error';
};

export type IpInfo = {
    ip: string;
    city: string;
    region: string;
    country: string;
    location: string;
    postal: string;
    timezone: string;
    latitude: number;
    longitude: number;
};

export type BrandAssetsJsonData = {
    brand_url?: string;
    brand_logo?: {
        favicon?: string;
        profile?: string;
        banner?: string;
    };
    brand_slogan?: {
        slogan?: string;
    };
    mobile_app_urls?: {
        app_store_url?: string;
        play_store_url?: string;
    };
    policy_urls?: {
        privacy_policy?: string;
        terms_of_service?: string;
    };
    shared_url_metadata?: {
        page_title?: string;
        meta_description?: string;
        image?: string;
    };
    brand_colors?: {
        primary_color?: string;
        secondary_color?: string;
        tertiary_color?: string;
    };
    industry_type?: {
        industry?: number;
    };
    inserted?: boolean;
};

export type Topic = {
    name: string;
    keywords: string[];
};

export type Category = {
    name: string;
    topics: Topic[];
    inserted?: boolean;
    regenerating?: boolean;
};

export type BrandCTKWsData = {
    categories: Category[];
};

export type GuidelineItem = {
    title: string;
    description: string;
};

export type BrandGuidelinesData = {
    guidelines: GuidelineItem[];
    inserted?: boolean;
};

export type BrandPersonaData = {
    mission: string;
    vision: string;
    values: string[];
    policies: string;
    procedures: string;
    working_conditions: string;
    code_of_conduct: string;
    dos: string[];
    donts: string[];
    inserted?: boolean;
};

export type BrandIndustryTypeData = {
    industry_type?: string;
    bussiness_category?: string;
    traffic_range?: string;
    inserted?: boolean;
    brand_website?: string;
};

export type BrandConsumerBrandSocial = {
    platform: string;
    username: string;
};

export type BrandConsumerBrand = {
    id: number;
    brand_name: string;
    relationship: string;
    master_relationship: string;
    website: string;
    earnings: number;
    contact_email: string | null;
    socials: BrandConsumerBrandSocial[];
    inserted: boolean;
    isNew: boolean;
};

export type HandleSSEMessageData = {
    user_message_id?: string;
    message?: string;
    agent_message_id?: string;
    session_id?: string;
    response_completed?: boolean;
    session_name?: string | null;
    function_name?: string;
    function_response?: string;
    carousel_metadata?: string;
    type?: string;
    tool_metadata?: string | ToolMetadataPayload;
    is_cached?: boolean; // Flag to indicate if this message is from cached response
};

export type PendingMessage = {
    message: string;
    agent_id?: string;
    session_id?: string;
};
