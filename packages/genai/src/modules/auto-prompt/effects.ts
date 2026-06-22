import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';

import type { MachineContext } from './context';
import { EventKind, type Event } from './states';
import type { Effect } from './transitions';

/**
 * Executes one effect against live deps + ctx. The machine runner calls
 * this per effect in declaration order after applying snapshot/cycle patches
 * and running step exits, but before running step enters.
 *
 * `send` lets effects feed synthetic events back into the machine —
 * cached-response branch fires SEND_QUEUED synchronously.
 */
export function runEffect(effect: Effect, ctx: MachineContext, send: (e: Event) => void): void {
    switch (effect.kind) {
        case 'emitCountdownActive': {
            const panelId = ctx.deps.getParentOctoPanelId();
            if (!panelId) return;
            eventBus.emit(EVENTS.WEB_SDK_COUNTDOWN_ACTIVE, {
                parentOctoPanelId: panelId,
                isActive: effect.isActive,
                source: effect.source,
            });
            return;
        }
        case 'setRenderMode': {
            ctx.deps.setWebSdkRenderMode(effect.mode);
            return;
        }
        case 'setInput': {
            ctx.deps.setInput(effect.value);
            return;
        }
        case 'clearSession': {
            ctx.deps.handleNewChat();
            return;
        }
        case 'invokeSend': {
            const prompt = ctx.cycle.activePrompt;
            if (!prompt) return;
            const targetSessionId = ctx.cycle.targetSessionId;
            const cached = ctx.deps.getCachedResponses().get(prompt);
            if (cached && cached.length > 0 && targetSessionId) {
                // Direct cache injection — bypass ChatProvider.
                ctx.deps.playCachedResponse(targetSessionId, cached, prompt);
                // Synthesize SEND_QUEUED so the machine moves to AWAITING_RESPONSE.
                send({ kind: EventKind.SEND_QUEUED });
                return;
            }
            ctx.deps.handleSendMessage({
                targetSessionId,
                messageInput: prompt,
                onMessageQueued: () => send({ kind: EventKind.SEND_QUEUED }),
            });
            return;
        }
        case 'trackCountdownStarted': {
            ctx.deps.analytics.trackAutoPromptCountdownStarted({
                prompt: effect.prompt,
                countdown_duration: effect.countdown_duration,
            });
            return;
        }
        case 'trackExecuted': {
            ctx.deps.analytics.trackAutoPromptExecuted({ prompt: effect.prompt });
            return;
        }
        case 'trackCancelled': {
            ctx.deps.analytics.trackAutoPromptCancelled({
                prompt: effect.prompt,
                seconds_remaining: effect.seconds_remaining,
            });
            return;
        }
    }
}
