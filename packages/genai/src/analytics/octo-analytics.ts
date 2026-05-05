/**
 * Octo Analytics Service
 * Wraps AnalyticsClient to provide type-safe tracking for Octo events
 */

import { AnalyticsClient, RudderstackProvider, ConsoleProvider, type AnalyticsProvider } from '@genuin/analytics';
import { enrichmentMiddleware, loggingMiddleware } from '@genuin/analytics/middleware';

import { OctoEventNames } from './octo-events';
import type {
    OctoSDKLoadedPayload,
    OctoSDKInitializedPayload,
    OctoSDKLoadFailedPayload,
    OctoSDKInitFailedPayload,
    OctoMessageSentPayload,
    OctoResponseReceivedPayload,
    OctoMessageSendFailedPayload,
    OctoAutoPromptCountdownStartedPayload,
    OctoAutoPromptCancelledPayload,
    OctoAutoPromptExecutedPayload,
    OctoPresetPromptOpenedPayload,
    OctoPresetPromptSelectedPayload,
    OctoCarouselRenderedPayload,
    OctoCarouselVideoClickedPayload,
    OctoVideoForwardedToParentPayload,
    OctoVideoForwardFailedPayload,
    OctoSessionCreatedPayload,
    OctoSessionSwitchedPayload,
    KoahAdProcessingStartedPayload,
    KoahAdServedPayload,
    KoahAdNoFillPayload,
    KoahAdProcessingFailedPayload,
    KoahSdkLoadTimeoutPayload,
    KoahAdClickedPayload,
} from './octo-events';

/**
 * Configuration for OctoAnalytics
 */
export interface OctoAnalyticsConfig {
    /**
     * Brand ID
     */
    brandId: number;

    /**
     * User ID
     */
    userId: string;

    /**
     * Genuin user ID (same as userId or different)
     */
    genUserId?: string;

    /**
     * Model being used (e.g., 'gpt-4', 'claude-3')
     */
    model?: string;

    /**
     * Current video ID
     */
    videoId?: string;

    /**
     * Environment (staging, production)
     */
    environment?: string;

    /**
     * Parent Web SDK instance ID
     */
    parentWebSdkInstanceId?: string;

    /**
     * Parent Web SDK container ID
     */
    parentWebSdkContainerId?: string;

    /**
     * Parent Web SDK embed ID
     */
    parentWebSdkEmbedId?: string;

    /**
     * Parent Web SDK placement ID
     */
    parentWebSdkPlacementId?: string;

    /**
     * Parent Octo Panel ID
     */
    parentOctoPanelId?: string;

    /**
     * Rudderstack write key
     */
    rudderstackWriteKey: string;

    /**
     * Rudderstack dataplane URL
     */
    rudderstackDataplaneUrl: string;

    /**
     * Enable debug mode
     */
    debug?: boolean;
}

/**
 * OctoAnalytics service provides type-safe tracking for all Octo events
 */
export class OctoAnalytics {
    private client: AnalyticsClient;
    private sessionId: string;
    private _config: OctoAnalyticsConfig;
    private initPromise: Promise<void> | null = null;

    constructor(config: OctoAnalyticsConfig) {
        this._config = config;
        this.sessionId = this.generateSessionId();

        // Create analytics client with Rudderstack provider
        const providers: AnalyticsProvider[] = [
            new RudderstackProvider({
                writeKey: config.rudderstackWriteKey,
                dataplaneUrl: config.rudderstackDataplaneUrl,
            }),
        ];

        // Add console provider in debug mode for testing
        if (config.debug) {
            providers.push(
                new ConsoleProvider({
                    useColors: true,
                    showTimestamps: true,
                    prettyPrint: true,
                })
            );
        }

        this.client = new AnalyticsClient({
            providers,
            defaultPayload: {
                // GenAI specific fields
                ai_session_id: this.sessionId,
                model: config.model || 'unknown',
                sdk_version: this.getSDKVersion(),

                // Common fields
                brand_id: config.brandId,
                user_id: config.userId,
                gen_user_id: config.genUserId || config.userId,
                channel: 'genai sdk',
                environment: config.environment || 'production',

                // Parent context (from OctoPanel)
                parent_web_sdk_instance_id: config.parentWebSdkInstanceId,
                parent_web_sdk_container_id: config.parentWebSdkContainerId,
                parent_web_sdk_embed_id: config.parentWebSdkEmbedId,
                parent_web_sdk_placement_id: config.parentWebSdkPlacementId,
                parent_octo_panel_id: config.parentOctoPanelId,

                // Video context
                video_id: config.videoId,
            },
            debug: config.debug || false,
            queue: {
                maxSize: 50,
                maxAge: 300000, // 5 minutes
                persist: true,
                persistKey: 'genuin-octo-analytics-queue',
            },
        });

        // Add middleware
        this.client.use(enrichmentMiddleware);
        if (config.debug) {
            this.client.use(loggingMiddleware);
        }
    }

    /**
     * Initialize the analytics client
     * Uses deferred initialization for better performance
     */
    async initialize(): Promise<void> {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise<void>((resolve, reject) => {
            const doInitialize = async () => {
                try {
                    await this.client.initialize();
                    resolve();
                } catch (error) {
                    console.error('[OctoAnalytics] Initialization failed:', error);
                    reject(error);
                }
            };

            // Defer initialization using requestIdleCallback for low priority
            // This ensures analytics doesn't block critical app initialization
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                window.requestIdleCallback(
                    () => {
                        doInitialize();
                    },
                    { timeout: 2000 } // Max 2 seconds delay
                );
            } else if (typeof window !== 'undefined') {
                // Fallback for browsers that don't support requestIdleCallback (e.g., iOS Safari)
                setTimeout(() => {
                    doInitialize();
                }, 500); // 500ms delay for iOS/older browsers
            } else {
                // Non-browser environment, initialize immediately
                doInitialize();
            }
        });

        return this.initPromise;
    }

    /**
     * Get SDK version
     */
    private getSDKVersion(): string {
        // Try to get from window.GenAISDK if available
         
        if (typeof window !== 'undefined' && (window as any).GenAISDK?.version) {
             
            return (window as any).GenAISDK.version;
        }
        return '1.0.0'; // Default fallback
    }

    /**
     * Generate a new AI session ID
     */
    private generateSessionId(): string {
        return `ai-session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Update video context
     */
    updateVideoContext(videoId: string): void {
        this.client.updateDefaultPayload({ video_id: videoId });
    }

    /**
     * Track SDK Loaded event
     */
    async trackSDKLoaded(payload: OctoSDKLoadedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SDK_LOADED, payload);
    }

    /**
     * Track SDK Initialized event
     */
    async trackSDKInitialized(payload: OctoSDKInitializedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SDK_INITIALIZED, payload);
    }

    /**
     * Track SDK Load Failed event
     */
    async trackSDKLoadFailed(payload: OctoSDKLoadFailedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SDK_LOAD_FAILED, payload);
    }

    /**
     * Track SDK Init Failed event
     */
    async trackSDKInitFailed(payload: OctoSDKInitFailedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SDK_INIT_FAILED, payload);
    }

    /**
     * Track Message Sent event
     */
    async trackMessageSent(payload: OctoMessageSentPayload): Promise<void> {
        return this.client.track(OctoEventNames.MESSAGE_SENT, payload);
    }

    /**
     * Track Response Received event
     */
    async trackResponseReceived(payload: OctoResponseReceivedPayload): Promise<void> {
        return this.client.track(OctoEventNames.RESPONSE_RECEIVED, payload);
    }

    /**
     * Track Message Send Failed event
     */
    async trackMessageSendFailed(payload: OctoMessageSendFailedPayload): Promise<void> {
        return this.client.track(OctoEventNames.MESSAGE_SEND_FAILED, payload);
    }

    /**
     * Track Auto Prompt Countdown Started event
     */
    async trackAutoPromptCountdownStarted(payload: OctoAutoPromptCountdownStartedPayload): Promise<void> {
        return this.client.track(OctoEventNames.AUTO_PROMPT_COUNTDOWN_STARTED, payload);
    }

    /**
     * Track Auto Prompt Cancelled event
     */
    async trackAutoPromptCancelled(payload: OctoAutoPromptCancelledPayload): Promise<void> {
        return this.client.track(OctoEventNames.AUTO_PROMPT_CANCELLED, payload);
    }

    /**
     * Track Auto Prompt Executed event
     */
    async trackAutoPromptExecuted(payload: OctoAutoPromptExecutedPayload): Promise<void> {
        return this.client.track(OctoEventNames.AUTO_PROMPT_EXECUTED, payload);
    }

    /**
     * Track Preset Prompt Opened event
     */
    async trackPresetPromptOpened(payload: OctoPresetPromptOpenedPayload): Promise<void> {
        return this.client.track(OctoEventNames.PRESET_PROMPT_OPENED, payload);
    }

    /**
     * Track Preset Prompt Selected event
     */
    async trackPresetPromptSelected(payload: OctoPresetPromptSelectedPayload): Promise<void> {
        return this.client.track(OctoEventNames.PRESET_PROMPT_SELECTED, payload);
    }

    /**
     * Track Carousel Rendered event
     */
    async trackCarouselRendered(payload: OctoCarouselRenderedPayload): Promise<void> {
        return this.client.track(OctoEventNames.CAROUSEL_RENDERED, payload);
    }

    /**
     * Track Carousel Video Clicked event
     */
    async trackCarouselVideoClicked(payload: OctoCarouselVideoClickedPayload): Promise<void> {
        return this.client.track(OctoEventNames.CAROUSEL_VIDEO_CLICKED, payload);
    }

    /**
     * Track Video Forwarded to Parent event
     */
    async trackVideoForwardedToParent(payload: OctoVideoForwardedToParentPayload): Promise<void> {
        return this.client.track(OctoEventNames.VIDEO_FORWARDED_TO_PARENT, payload);
    }

    /**
     * Track Video Forward Failed event
     */
    async trackVideoForwardFailed(payload: OctoVideoForwardFailedPayload): Promise<void> {
        return this.client.track(OctoEventNames.VIDEO_FORWARD_FAILED, payload);
    }

    /**
     * Track Session Created event
     */
    async trackSessionCreated(payload: OctoSessionCreatedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SESSION_CREATED, payload);
    }

    /**
     * Track Session Switched event
     */
    async trackSessionSwitched(payload: OctoSessionSwitchedPayload): Promise<void> {
        return this.client.track(OctoEventNames.SESSION_SWITCHED, payload);
    }

    /**
     * Track Koah Ad Processing Started event
     */
    async trackKoahAdProcessingStarted(payload: KoahAdProcessingStartedPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_AD_PROCESSING_STARTED, payload);
    }

    /**
     * Track Koah Ad Served event
     */
    async trackKoahAdServed(payload: KoahAdServedPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_AD_SERVED, payload);
    }

    /**
     * Track Koah Ad No Fill event
     */
    async trackKoahAdNoFill(payload: KoahAdNoFillPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_AD_NO_FILL, payload);
    }

    /**
     * Track Koah Ad Processing Failed event
     */
    async trackKoahAdProcessingFailed(payload: KoahAdProcessingFailedPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_AD_PROCESSING_FAILED, payload);
    }

    /**
     * Track Koah SDK Load Timeout event
     */
    async trackKoahSdkLoadTimeout(payload: KoahSdkLoadTimeoutPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_SDK_LOAD_TIMEOUT, payload);
    }

    /**
     * Track Koah Ad Clicked event
     */
    async trackKoahAdClicked(payload: KoahAdClickedPayload): Promise<void> {
        return this.client.track(OctoEventNames.KOAH_AD_CLICKED, payload);
    }

    /**
     * Get analytics client (for advanced usage)
     */
    getClient(): AnalyticsClient {
        return this.client;
    }

    /**
     * Get current configuration
     */
    getConfig(): OctoAnalyticsConfig {
        return this._config;
    }

    /**
     * Check if analytics is ready
     */
    isReady(): boolean {
        return this.client.isReady();
    }

    /**
     * Destroy analytics client
     */
    destroy(): void {
        this.client.destroy();
    }
}
