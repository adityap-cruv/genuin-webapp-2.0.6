// Type definitions for @genuin/genai-sdk

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
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
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
