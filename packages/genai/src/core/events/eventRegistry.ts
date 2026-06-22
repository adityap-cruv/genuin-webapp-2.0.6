import type { OctoState } from '@/core/state-machine/octo-state';
import type { OctoPhase } from '@/modules/auto-prompt/phase';

/**
 * Single source of truth for every cross-boundary CustomEvent name used by
 * `packages/genai`. Wire strings are fixed contract — external host listeners
 * and `packages/web-sdk` consume them directly. Do not rename without a
 * coordinated migration.
 *
 * To add a new event:
 *   1. Add an entry here.
 *   2. Add the matching payload shape to `EventPayloads` below.
 * Nothing else is required.
 */
export const EVENTS = {
    WEB_SDK_STATE_CHANGE: 'genai:webSdkStateChange',
    WEB_SDK_SESSION_CHANGE: 'genai:webSdkSessionChange',
    WEB_SDK_REQUEST_EXPAND: 'genai:webSdkRequestExpand',
    WEB_SDK_THINKING_STARTED: 'genai:webSdkThinkingStarted',
    WEB_SDK_ERROR: 'genai:webSdkError',
    WEB_SDK_COUNTDOWN_ACTIVE: 'genai:webSdkCountdownActive',
    WEB_SDK_AUTO_CLOSE: 'genai:webSdkAutoClose',
    WEB_SDK_RENDER_MODE: 'genai:webSdkRenderMode',
    WEB_SDK_CANCEL_CYCLE: 'genai:webSdkCancelCycle',
    USER_INTERACTED: 'sdk:userInteracted',
    OCTO_LIFECYCLE: 'genai:octoLifecycle',
    OPEN_DIALOG: 'genai:openDialog',
    SEND_MESSAGE: 'genai:sendMessage',
    MESSAGE: 'genai:message',
    SESSION_ID_UPDATE: 'genai:sessionIdUpdate',
    SHARE_LINK: 'genai:shareLink',
    ONBOARDING_STEP_UPDATE: 'genai:onboardingStepUpdate',
} as const;

/** Union of all wire-level event-name strings the bus knows about. */
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** Onboarding step identifiers fired by BCC ingestion. */
export type OnboardingStep =
    | 'brand_ctkws'
    | 'brand_assets'
    | 'brand_guidelines'
    | 'brand_persona'
    | 'brand_consumer_brands';

/** Source tag attached to countdown-active events for analytics. */
export type CountdownActiveSource =
    | 'countdown_started'
    | 'session_exists'
    | 'auto_prompt_click'
    | 'input_start'
    | 'compact_prompt_send';

/** Payload shape attached to `CustomEvent.detail` for each event. */
export interface EventPayloads {
    [EVENTS.WEB_SDK_STATE_CHANGE]: { parentOctoPanelId: string; octoState: OctoState };
    [EVENTS.WEB_SDK_SESSION_CHANGE]: { parentOctoPanelId: string; sessionId: string | null };
    [EVENTS.WEB_SDK_REQUEST_EXPAND]: { parentOctoPanelId: string; sessionId: string | null };
    [EVENTS.WEB_SDK_THINKING_STARTED]: { parentOctoPanelId: string };
    [EVENTS.WEB_SDK_ERROR]: { parentOctoPanelId: string };
    [EVENTS.WEB_SDK_COUNTDOWN_ACTIVE]: {
        parentOctoPanelId: string;
        isActive: boolean;
        source: CountdownActiveSource;
    };
    [EVENTS.WEB_SDK_AUTO_CLOSE]: { parentOctoPanelId?: string };
    [EVENTS.WEB_SDK_RENDER_MODE]: { mode: 'compact' | 'full'; parentOctoPanelId?: string };
    [EVENTS.WEB_SDK_CANCEL_CYCLE]: { parentOctoPanelId?: string };
    [EVENTS.USER_INTERACTED]: void;
    [EVENTS.OCTO_LIFECYCLE]: { parentOctoPanelId: string; phase: OctoPhase };
    // External hosts may fire `new Event('genai:openDialog')` (see README + sample
    // HTML), which arrives with `detail: null` — payload must permit null.
    [EVENTS.OPEN_DIALOG]: { isMaya?: boolean } | null | void;
    [EVENTS.SEND_MESSAGE]: { message: string; agent_id?: string; session_id?: string };
    // External hosts may fire `new Event('genai:message')` with no detail; the
    // SDKLifecycle handler already coerces `detail || ({})`, so permit null here.
    [EVENTS.MESSAGE]: { message: string; agent_id?: string; session_id?: string } | null;
    [EVENTS.SESSION_ID_UPDATE]: { sessionId: string | null };
    [EVENTS.SHARE_LINK]: { sessionId: string | null };
    [EVENTS.ONBOARDING_STEP_UPDATE]: { step: OnboardingStep };
}
