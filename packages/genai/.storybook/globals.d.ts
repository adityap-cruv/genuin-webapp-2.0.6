/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GENAI_RUDDERSTACK_KEY: string;
  readonly VITE_GENAI_RUDDERSTACK_URL: string;
  readonly VITE_GENAI_API_URL: string;
  readonly VITE_GENAI_BCC_URL: string;
  readonly VITE_GENAI_BCC_API_URL: string;
  readonly VITE_GENAI_GEN_SDK_URL: string;
  readonly VITE_GENAI_ASSETS_BASE_URL: string;
  readonly VITE_GENAI_API_KEY: string;
  readonly VITE_GENAI_DS_BACKEND_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
