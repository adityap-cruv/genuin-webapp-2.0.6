// Type definitions for @genuin/genai-sdk

import type { ComponentType } from 'react';

export interface KoahAdWidgetProps {
    userMessage: string | null;
    aiResponse: string;
    messageId: string;
    standalone?: boolean;
}

export const KoahAdWidget: ComponentType<KoahAdWidgetProps>;

export interface GenAISDKConfig {
    userId: string;
    brandId: number;
    view?: 'page' | 'dialog' | 'floater' | 'web-sdk';
    containerId?: string;
    containerElement?: HTMLElement;
    sessionId?: string;
    draggable?: boolean;
    userEmail?: string;
    userUUID?: string;
    isMaya?: boolean;
    skipCssInjection?: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    videoId?: string;
    renderMode?: 'compact' | 'full';
    /**
     * UI density level for the ad slot hosting this SDK instance.
     * Controls the scale of all sizing-sensitive UI elements from init.
     * - `'xs'`   — compact strips (320×100, 320×50)
     * - `'sm'`   — larger ad tiles (300×250 split view)
     * - `'base'` — standard full UI (default, omit for normal usage)
     */
    uiDensity?: 'xs' | 'sm' | 'base';
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
    autoPromptConfig?: {
        mode?: 'full' | 'countdown-only';
        countdownMs?: number;
        idealDelayMs?: number;
        nextPromptDelayMs?: number;
        disableAutoClose?: boolean;
    };
}

export interface GenAISDKInstance {
    init: (config: GenAISDKConfig) => Promise<void>;
    destroy: () => void;
    forceOpen?: boolean;
}

declare global {
    interface Window {
        GenAISDK?: GenAISDKInstance;
    }
}

export function init(config: GenAISDKConfig): Promise<void>;
export function destroy(): void;
