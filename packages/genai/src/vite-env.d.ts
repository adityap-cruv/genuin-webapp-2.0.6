/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GENAI_ASSETS_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
        GenAISDK: {
            forceOpen: boolean;
            init: (config: { containerId?: string; videoId?: string; [key: string]: unknown }) => void;
            destroy: () => void;
        };
    }
}

export {};
