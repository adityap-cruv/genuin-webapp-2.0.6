/**
 * Local augmentation for `@genuin/genai-sdk`.
 *
 * The package's shipped `index.d.ts` types `init` + `destroy` but omits
 * `setWebSdkRenderMode`, which the runtime entry (`src/index.ts`) exports. We
 * declare the full module surface the contextual-reels widget consumes so the
 * direct module import type-checks without a cast.
 */
declare module "@genuin/genai-sdk" {
  /** Auto-prompt configuration forwarded to `init`. */
  export interface GenAiAutoPromptConfig {
    mode: "disabled" | "countdown-only" | "full";
    countdownMs?: number;
    idealDelayMs?: number;
    nextPromptDelayMs?: number;
    disableAutoClose?: boolean;
  }

  /** Init config — only the fields the widget sends are typed. */
  export interface GenAISDKConfig {
    userId: string;
    brandId: number | null;
    view?: "page" | "dialog" | "floater" | "web-sdk";
    containerId?: string;
    containerElement?: HTMLElement;
    videoId?: string;
    renderMode?: "compact" | "full";
    /**
     * UI density level for the ad slot hosting this SDK instance.
     * Controls the scale of all sizing-sensitive UI elements from init.
     * - `"xs"`   — compact strips (320×100, 320×50)
     * - `"sm"`   — larger ad tiles (300×250 split view)
     * - `"base"` — standard full UI (default, omit for normal usage)
     */
    uiDensity?: "xs" | "sm" | "base";
    parentOctoPanelId?: string;
    skipCssInjection?: boolean;
    autoPromptConfig?: GenAiAutoPromptConfig;
    integrationType?: "embed" | "placement";
  }

  export function init(config: GenAISDKConfig): Promise<void>;
  export function destroy(): void;
  export function setWebSdkRenderMode(mode: "compact" | "full"): void;
}
