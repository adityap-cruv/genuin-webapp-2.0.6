import type {
    AgentType,
    BrandAssetsJsonData,
    BrandConsumerBrand,
    BrandCTKWsData,
    BrandGuidelinesData,
    BrandIndustryTypeData,
    BrandPersonaData,
    GuidelineItem
} from '@/types';
import axios from 'axios';
import type {
    CreateSessionV2Response,
    GetAgentIdResponse,
    GetAgentsV2Response,
    GetChatHistoryV2Response,
    GetSessionsV2Response,
    StartChatResponse,
    StopChatResponse,
    SuggestedPromptsResponse,
    VideoSuggestedPromptsResponse
} from './apiTypes';

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_URL + '/api/v1/ds/agents',
    // baseURL: import.meta.env.VITE_API_URL + '/agents',
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "ngrok-skip-browser-warning": "true"
    }
});

const bccApi = axios.create({
    baseURL: import.meta.env.VITE_BCC_API_URL,
});

const dsBackendApi = axios.create({
    baseURL: import.meta.env.VITE_DS_BACKEND_API_URL,
});

// Singleton class to store user context
class UserContext {
    private static instance: UserContext;
    private userEmail?: string;
    private userUUID?: string;
    private brandId?: number;
    private userId?: string;
    private constructor() {}

    static getInstance(): UserContext {
        if (!UserContext.instance) {
            UserContext.instance = new UserContext();
        }
        return UserContext.instance;
    }

    setUserInfo(email?: string, uuid?: string, brandId?: number, userId?: string) {
        this.userEmail = email;
        this.userUUID = uuid;
        this.brandId = brandId;
        this.userId = userId;
    }

    getUserEmail(): string | undefined {
        return this.userEmail;
    }

    getUserUUID(): string | undefined {
        return this.userUUID;
    }

    getBrandId(): number | undefined {
        return this.brandId;
    }

    getToken(): string | undefined {
        return localStorage.getItem('auth-token') || undefined;
    }

    getUserId(): string | undefined {
        return this.userId;
    }
}

export const userContext = UserContext.getInstance();

const routes = {
    // agents api
    getSubAgents: `/sub_agents/sub_agents`,
    responseFeedback: `/response_feedback`,
    getBrandSessions: `/brand_sessions`,
    deleteSession: `/session`,
    updateSessionTitle: `/session_title`,
    getChatHistory: `/chat_graph`,
    createSession: `/session`,
    migrateGAISession: `/migrate_session`,
    stopAgent: `/stop_agent`,
    updateAgentMessage: `/agent_message`,

    // new agents api
    getSubAgentsV2: `/api/v1/maya/sub_agents`,
    getSessionsV2: `/api/v1/maya/sessions`,
    createSessionV2: `/api/v1/maya/sessions`,
    getChatHistoryV2: `/api/v1/maya/chat_history`,
    deleteSessionV2: `/api/v1/maya/sessions`,
    startChat: `/api/v1/maya/chat/start`,
    chatStream: `/api/v1/maya/chat/stream`,
    stopChat: `/api/v1/maya/chat/stop`,
    getAgentId: `/api/v1/maya/agent_id`,
    getVideoSuggestedPrompts: `/api/v1/maya/agents/get_video_suggested_prompts`,
    renderInventory: `/api/v1/maya/inventory/render`,

    // bcc api
    updateBrandAssets: `/api/v2/brand_details/brand_assets`,
    insertCTKWs: `/api/v1/upsert_categories`,
    getBrandDetails: `/api/v2/brand_details`,
    insertBrandDetails: `/api/v2/brand_details/persona`,
    insertBrandGuidelines: `/api/v1/brand_guidelines`,
    insertBrandIndustryType: `/api/v2/brand_details/brand_type`,
    validateSocialHandle: `/api/v1/ds/ds-backend/api/v3/ee/si/validate-social`,
    insertSocialHandle: `/api/v1/ds/ds-backend/api/v4/ee/si/bulk-social`,
    socialImport: `/api/v1/ds/ds-backend/api/v3/ee/si/import`,
    insertExistingBrandAsConsumerBrand: `api/v1/associate_brands`,
    insertNewBrandAsConsumerBrand: `api/v1/ds/bcc_brand/create`,

    // ds-backend api
    getBGMs: `/ds-backend/api/v1/ai-director/bg_music`,
    getCaptions: `/ds-backend/api/v1/ai-director/captions`,
};


export async function getBrandAgentId(
    brand_id: number,
    options?: {
        agent_facing?: string | null;
        agent_type?: string | null;
    }
) {
    const params: Record<string, string | number> = {
        brand_id,
    };

    const agentFacing = options?.agent_facing ?? 'consumer_facing';
    if (agentFacing) {
        params.agent_facing = agentFacing;
    }

    if (options?.agent_type) {
        params.agent_type = options.agent_type;
    }

    return api.get<GetAgentIdResponse>(routes.getAgentId, {
        params,
    });
}


export async function getVideoSuggestedPrompts(params: { video_id: string; includeCarouselMetadata: boolean; includeAgentResponse: boolean; user_journey?: string | null }) {
    return api
        .post<VideoSuggestedPromptsResponse>(routes.getVideoSuggestedPrompts, {
            video_id: params.video_id,
            include_carousel_metadata: params.includeCarouselMetadata,
            include_agent_response: params.includeAgentResponse,
            user_journey: params.user_journey ?? undefined,
        })
        .then(res => res.data);
}


export async function getSubAgentsV2(brand_id: number): Promise<GetAgentsV2Response> {
    console.log('getSubAgentsV2', brand_id);
    const genuinBccs = ['brands.begenuin.com', 'brands.qa.begenuin.com', 'bcc.begenuin.com', 'bcc.qa.begenuin.com'];
    const brand_ids = genuinBccs.includes(window.location.hostname) ? [99, brand_id] : [99, brand_id];

    console.log('brand_ids', brand_ids.map(id => `brand_ids=${id}`).join('&'));
    return api
        .get(routes.getSubAgentsV2 + `?${brand_ids.map(id => `brand_ids=${id}`).join('&')}`)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function createSessionV2(payload: {user_id: string, brand_id:number,agent_type:AgentType}): Promise<CreateSessionV2Response> {
    return api
        .post(routes.createSessionV2, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getSessionsV2(brand_id: number, is_maya: boolean): Promise<GetSessionsV2Response> {
    const params: Record<string, any> = {
        brand_id,
    }
    if(is_maya) {
        params.agent_type = 'maya';
        params.brand_id = 99;
    }
    return api
        .get(routes.getSessionsV2, { params })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getChatHistoryV2(session_id: string): Promise<GetChatHistoryV2Response> {
    return api
        .get(routes.getChatHistoryV2, {
            params: {
                session_id,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export type InventoryRenderRequest = {
    template_id: string;
    inventory_id: string;
    brand_id: string;
};

export type InventoryRenderResponse = string | { html?: string };

export async function renderInventoryWidget(payload: InventoryRenderRequest): Promise<InventoryRenderResponse> {
    return api
        .post(routes.renderInventory, payload)
        .then(res => res.data)
        .catch(error => {
            throw error;
        });
}

export async function deleteSessionV2(session_id: string): Promise<void> {
    return api
        .delete(`${routes.deleteSessionV2}/${session_id}`)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getSubAgents(brand_id: number) {
    return api
        .get(routes.getSubAgents, {
            params: {
                brand_id,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function responseFeedback(payload: { session_id: string; response_id: string; feedback: boolean }) {
    return api
        .post(routes.responseFeedback, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getBrandSessions(brand_id: number) {
    return api
        .get(`${routes.getBrandSessions}/${brand_id.toString()}`)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function deleteSession(payload: { session_id: string }) {
    return api
        .delete(routes.deleteSession, {
            data: payload,
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function updateSessionTitle(payload: { session_id: string; title: string }) {
    return api
        .patch(routes.updateSessionTitle, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getChatHistory(session_id: string) {
    return api
        .get(`${routes.getChatHistory}/${session_id}`)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function createSession(payload: { brand_id: number; user_id: string }) {
    return api
        .post(routes.createSession, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function migrateGAISession(payload: { session_id: string; brand_id: string; user_id: string }) {
    return api
        .post(routes.migrateGAISession, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function stopAgent(payload: { session_id: string; user_id: string }) {
    return api
        .post(routes.stopAgent, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getIpInfo() {
    return api
        .get('https://api.begenuin.com/goservices/data/ip_info')
        .then(res => {
            return res.data;
        })
        .catch(_error => {
            // IP info is optional - fail silently
            return null;
        });
}

export async function updateBrandAssets(payload: BrandAssetsJsonData) {
    const token = userContext.getToken();
    const preparedJsonData: any = {
        is_onboarding_step: true, // always include, as per original code
    };

    if (payload.brand_url) {
        preparedJsonData.website = payload.brand_url;
    }

    // Add favicon if exists
    const favicon = payload.brand_logo?.favicon?.split('/').pop();
    if (favicon) {
        preparedJsonData.favicon = favicon;
    }

    // Add brand_web_logo if exists
    const brandWebLogo = payload.brand_logo?.profile?.split('/').pop();
    if (brandWebLogo) {
        preparedJsonData.brand_web_logo = brandWebLogo;
    }

    // Add profile_logo if exists (matches favicon again per original code)
    const profileLogo = payload.brand_logo?.favicon?.split('/').pop();
    if (profileLogo) {
        preparedJsonData.profile_logo = profileLogo;
    }

    // Add appstore_link if exists
    if (payload.mobile_app_urls?.app_store_url) {
        preparedJsonData.appstore_link = payload.mobile_app_urls.app_store_url;
    }

    // brand_colors only if at least one color exists
    const brandColors: any = {};
    if (payload.brand_colors?.primary_color) {
        brandColors.primary = payload.brand_colors.primary_color;
    }
    if (payload.brand_colors?.secondary_color) {
        brandColors.secondary = payload.brand_colors.secondary_color;
    }
    if (payload.brand_colors?.tertiary_color) {
        brandColors.tertiary = payload.brand_colors.tertiary_color;
    }
    if (Object.keys(brandColors).length > 0) {
        preparedJsonData.brand_colors = brandColors;
    }

    // playstore_link if exists
    if (payload.mobile_app_urls?.play_store_url) {
        preparedJsonData.playstore_link = payload.mobile_app_urls.play_store_url;
    }

    // privacy_policy if exists
    if (payload.policy_urls?.privacy_policy) {
        preparedJsonData.privacy_policy = payload.policy_urls.privacy_policy;
    }

    // slogan.text required to include (empty string is valid)
    if (payload.brand_slogan?.slogan) {
        preparedJsonData.slogan = {
            text: payload.brand_slogan.slogan,
            font: {
                id: import.meta.env.VITE_FONT_ID,
                style: 'normal',
                weight: 'lighter',
            },
        };
    }

    // terms_and_condition if exists
    if (payload.policy_urls?.terms_of_service) {
        preparedJsonData.terms_and_condition = payload.policy_urls.terms_of_service;
    }

    // web_meta_data block
    const webMetaData: any = {};
    if (payload.shared_url_metadata?.page_title) {
        webMetaData.title = payload.shared_url_metadata.page_title;
    }
    if (payload.shared_url_metadata?.meta_description) {
        webMetaData.description = payload.shared_url_metadata.meta_description;
    }
    const previewImage = payload.shared_url_metadata?.image?.split('/').pop();
    if (previewImage) {
        webMetaData.preview_image = previewImage;
    }
    if (Object.keys(webMetaData).length > 0) {
        preparedJsonData.web_meta_data = webMetaData;
    }
    return bccApi
        .patch(routes.updateBrandAssets, preparedJsonData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function insertCTKWs(payload: BrandCTKWsData) {
    const token = userContext.getToken();
    const preparedPayload = {
        categories: {
            add: payload.categories.map(cat => {
                return {
                    category_name: cat.name,
                    topics: cat.topics.map(top => {
                        return { topic_name: top.name, keywords: top.keywords };
                    }),
                };
            }),
            remove: [],
        },
        keywords: {
            add: [],
            remove: [],
        },
        topics: {
            add: [],
            remove: [],
        },
    };
    return bccApi
        .post(routes.insertCTKWs, preparedPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function insertBrandDetails(payload: BrandPersonaData) {
    const token = userContext.getToken();
    const preparedPayload = {
        is_onboarding_step: true,
        persona: {
            code_of_conduct: payload.code_of_conduct,
            donts: payload.donts,
            dos: payload.dos,
            mission: payload.mission,
            policies: payload.policies,
            procedures: payload.procedures,
            values: payload.values,
            vision: payload.vision,
            working_conditions: payload.working_conditions,
        },
    };
    return bccApi
        .patch(routes.insertBrandDetails, preparedPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function insertBrandGuidelines(payload: BrandGuidelinesData) {
    const token = userContext.getToken();
    const preparedPayload = {
        guidelines: {
            added: payload.guidelines.map((guideline: GuidelineItem, index: number) => {
                return { title: guideline.title, description: guideline.description, position: index + 1 };
            }),
        },
    };
    return bccApi
        .patch(routes.insertBrandGuidelines, preparedPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function insertBrandIndustryType(payload: BrandIndustryTypeData) {
    const token = userContext.getToken();
    const mapping = {
        brand_type: {
            RMN: 1,
            Media: 2,
            Consumer: 3,
        },
        industry_type: {
            Automotive: 1,
            'Delivery/E-commerce': 2,
            Fintech: 3,
            Food: 4,
            Healthcare: 5,
            'Media & Entertainment': 6,
            Retail: 7,
        },
    };
    const preparedPayload = {
        industry_type: mapping.industry_type[payload.industry_type as keyof typeof mapping.industry_type],
        type: mapping.brand_type[payload.bussiness_category as keyof typeof mapping.brand_type],
        traffic: payload.traffic_range,
    };
    return bccApi
        .patch(routes.insertBrandIndustryType, preparedPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function updateAgentMessage(payload: { chat_id: string; agent_message: string }) {
    return api
        .patch(routes.updateAgentMessage, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function validateSocialHandle(params: { platform: string; handle: string }) {
    const token = userContext.getToken();
    const brand_id = userContext.getBrandId();
    if (token && brand_id) {
        const payload = {
            main_brand_id: brand_id,
            socials: [
                {
                    handle: params.handle,
                    platform: params.platform,
                },
            ],
        };
        return bccApi
            .post(routes.validateSocialHandle, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                throw error;
            });
    }
    return Promise.reject(new Error('Brand ID not found'));
}

export async function insertSocialHandle(params: { platform: string; handle: string }) {
    const token = userContext.getToken();
    const brand_id = userContext.getBrandId();
    const userUUID = userContext.getUserUUID();
    if (token && brand_id && userUUID) {
        const payload = {
            user_id: userUUID,
            added_socials: [
                {
                    handle: params.handle,
                    platform: params.platform,
                },
            ],
        };
        return bccApi
            .patch(routes.insertSocialHandle, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                throw error;
            });
    }
    return Promise.reject(new Error('Either token, brand id, or user uuid is not set'));
}

export async function SocialImport(socialIds: string[]) {
    const token = userContext.getToken();
    const userEmail = userContext.getUserEmail();
    const brand_id = userContext.getBrandId();
    if (token && brand_id && userEmail) {
        const payload = {
            brand_id: brand_id,
            imported_by: userEmail,
            social_ids: socialIds,
        };
        return bccApi
            .post(routes.socialImport, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                return res.data;
            })
            .catch(error => {
                throw error;
            });
    }
    return Promise.reject(new Error('Either token, brand id, or user email is not set'));
}

interface PreSignedUrlResponse {
    data: {
        content_type: string;
        s3_key: string;
        url: string;
    };
}

export async function getPreSignedUrl(params: { file_name: string; brand_id: number; user_id: string }) {
    return api
        .get('/presigned-url', {
            params: {
                file_name: params.file_name,
                brand_id: params.brand_id,
                user_id: params.user_id,
            },
        })
        .then(res => {
            return res.data as PreSignedUrlResponse;
        })
        .catch(error => {
            throw error;
        });
}

export async function getBGMs(params: { brand_id: number }) {
    return dsBackendApi
        .get(routes.getBGMs, {
            params: {
                brand_id: params.brand_id,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getCaptions(params: { brand_id: number }) {
    return dsBackendApi
        .get(routes.getCaptions, {
            params: {
                brand_id: params.brand_id,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}


export async function insertExistingBrandAsConsumerBrand(brand: BrandConsumerBrand) {
    const token = userContext.getToken();
    if(!token) return Promise.reject(new Error('Token not found'));
    const preparedPayload = {
        brand_id: brand.id,
        cpm: brand.earnings,
        website: brand.website,
        start_date: new Date().toISOString(),
        socials: brand.socials.map(s=>({
            platform: s.platform,
            handle: s.username,
        })),
    };
    return bccApi
        .post(routes.insertExistingBrandAsConsumerBrand, [preparedPayload], {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function insertNewBrandAsConsumerBrand(brand: BrandConsumerBrand) {
    const token = userContext.getToken();
    const brand_id = userContext.getBrandId();
    const userId = userContext.getUserId();
    if(!token || !brand_id || !userId) return Promise.reject(new Error('Either token, brand id, or user id is not set'));
    const preparedPayload = {
        cpm: brand.earnings,
        brand_name: brand.brand_name,
        brand_url: brand.website,
        email_id: brand.contact_email || brand.brand_name.toLocaleLowerCase().replace(/ /g, '_') + '@creatives.begenuin.com',
        socials: brand.socials.map(s=>({
            platform: s.platform,
            handle: s.username,
        })),
        start_date: new Date().toISOString(),
        logged_in_user_id: userId,
        parent_brand_id: brand_id,
        add_user_as_admin: []
    };
    return bccApi
        .post(routes.insertNewBrandAsConsumerBrand, preparedPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function getSuggestedPrompts(
    agent_id: string,
    params?: { user_query: string; agent_response: string }
): Promise<SuggestedPromptsResponse> {
    return api
        .post(`/api/v1/maya/agents/${agent_id}/suggested_prompts`, params || {})
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export interface StartChatPayload {
    brand_id: number;
    message: string;
    agent_id: string;
    agent_type: string;
    session_id: string | null;
    user_id: string;
    s3_keys: string[];
    video_id?: string;
    previous_context?: {
        message: string;
        agent_response: string;
        session_name: string;
    };
    // Integration fields for embed/placement context
    integration_type?: 'embed' | 'placement';
    integration_id?: string;
    content_order?: string[];
}

export async function startChatSession(payload: StartChatPayload): Promise<StartChatResponse> {
    return api
        .post(routes.startChat, payload)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export async function stopChatSession(sessionId: string): Promise<StopChatResponse> {
    return api
        .post(`${routes.stopChat}/${sessionId}`)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        });
}

export function getChatStreamUrl(sessionId: string): string {
    return `${import.meta.env.VITE_API_URL}${routes.chatStream}/${sessionId}`;
}
