/** Finite states of the auto-prompt cycle machine. */
export enum State {
    /** No cycle armed. Waiting for `CONFIG_READY` to start a countdown. */
    IDLE = 'IDLE',
    /** Compact-idle initial countdown ticking before the first prompt. */
    COUNTDOWN = 'COUNTDOWN',
    /** `handleSendMessage` dispatched; waiting for `onMessageQueued`. */
    SENDING = 'SENDING',
    /** Session exists; agent is producing a response. */
    AWAITING_RESPONSE = 'AWAITING_RESPONSE',
    /** Post-response idleDelay wait before auto-closing the panel. */
    CHAT_CLOSE_DELAY = 'CHAT_CLOSE_DELAY',
    /** Panel closed; waiting `nextPromptDelayMs` before the next countdown. */
    POST_CLOSE_IDLE = 'POST_CLOSE_IDLE',
    /** Post-close countdown ticking before the next prompt is sent. */
    NEXT_PROMPT_COUNTDOWN = 'NEXT_PROMPT_COUNTDOWN',
    /** Carry-over countdown when compact→full happened mid-countdown. */
    PANEL_CARRY_OVER = 'PANEL_CARRY_OVER',
    /** Cycle terminated by user interaction. Reset gated on PROMPTS_REFRESHED or SESSION_STARTED. */
    CANCELLED = 'CANCELLED',
    /** Permanently terminated by explicit user interaction. Never re-arms within this component lifetime. */
    TERMINATED = 'TERMINATED',
}

/** All events the machine reacts to. Payload shapes live in `EventPayload`. */
export enum EventKind {
    /** Mode != disabled, prompts available, no active session, not busy. */
    CONFIG_READY = 'CONFIG_READY',
    /** suggestedPrompts array changed. Resets rotation index. */
    PROMPTS_REFRESHED = 'PROMPTS_REFRESHED',
    /** Internal: 1s countdown tick. */
    COUNTDOWN_TICK = 'COUNTDOWN_TICK',
    /** Internal: countdown reached 0. */
    COUNTDOWN_COMPLETE = 'COUNTDOWN_COMPLETE',
    /** ChatProvider's `onMessageQueued` fired after the user event was queued. */
    SEND_QUEUED = 'SEND_QUEUED',
    /** currentSessionId went null → non-null. */
    SESSION_STARTED = 'SESSION_STARTED',
    /** currentSessionId went non-null → null. */
    SESSION_CLEARED = 'SESSION_CLEARED',
    /** Last agent message in current session became `isCompleted = true`. */
    AGENT_RESPONSE_DONE = 'AGENT_RESPONSE_DONE',
    /** idealDelayMs elapsed in CHAT_CLOSE_DELAY. */
    CHAT_CLOSE_DUE = 'CHAT_CLOSE_DUE',
    /** nextPromptDelayMs elapsed in POST_CLOSE_IDLE. */
    NEXT_PROMPT_DUE = 'NEXT_PROMPT_DUE',
    /** Any cancel — global USER_INTERACTED, local pointer/key/touch, host CANCEL_CYCLE, handler. */
    USER_INTERACTED = 'USER_INTERACTED',
    /**
     * User clicked a counting-down prompt to take it over and send immediately.
     * Skips the remaining countdown, expands to full-view, and sends the active
     * prompt now — the cycle then continues normally (response → close → loop).
     * Distinct from USER_INTERACTED so it does NOT terminate the cycle.
     */
    COUNTDOWN_TAKEOVER = 'COUNTDOWN_TAKEOVER',
    /** External WEB_SDK_AUTO_CLOSE received from another source. */
    EXTERNAL_AUTO_CLOSE = 'EXTERNAL_AUTO_CLOSE',
    /** webSdkRenderMode changed. */
    RENDER_MODE_CHANGED = 'RENDER_MODE_CHANGED',
    /** isBusy changed (derived from octoState). */
    BUSY_CHANGED = 'BUSY_CHANGED',
}

import type { CountdownActiveSource } from '@/core/events/eventRegistry';

/** Source attached to USER_INTERACTED — drives analytics + countdown-active emit. */
export type CancelSource =
    | 'global'
    | 'local'
    | 'external'
    | 'auto_prompt_click'
    | 'input_start'
    | 'compact_prompt_send'
    | 'dispose';

/** Discriminated payload union — keep narrow so transitions can switch exhaustively. */
export type Event =
    | { kind: EventKind.CONFIG_READY }
    | { kind: EventKind.PROMPTS_REFRESHED }
    | { kind: EventKind.COUNTDOWN_TICK }
    | { kind: EventKind.COUNTDOWN_COMPLETE }
    | { kind: EventKind.SEND_QUEUED }
    | { kind: EventKind.SESSION_STARTED; sessionId: string }
    | { kind: EventKind.SESSION_CLEARED }
    | { kind: EventKind.AGENT_RESPONSE_DONE; messageId: string }
    | { kind: EventKind.CHAT_CLOSE_DUE }
    | { kind: EventKind.NEXT_PROMPT_DUE }
    | { kind: EventKind.USER_INTERACTED; source: CancelSource }
    | { kind: EventKind.COUNTDOWN_TAKEOVER }
    | { kind: EventKind.EXTERNAL_AUTO_CLOSE }
    | { kind: EventKind.RENDER_MODE_CHANGED; mode: 'compact' | 'full' }
    | { kind: EventKind.BUSY_CHANGED; isBusy: boolean };

/** Maps a cancel source to the analytics/event source string. */
export function cancelSourceToCountdownSource(src: CancelSource): CountdownActiveSource {
    switch (src) {
        case 'auto_prompt_click':
            return 'auto_prompt_click';
        case 'input_start':
            return 'input_start';
        case 'compact_prompt_send':
            return 'compact_prompt_send';
        default:
            // External / global / local / dispose all map to input_start for the panel —
            // the panel cares about "user took control", not the precise source.
            return 'input_start';
    }
}
