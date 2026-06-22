import { useEffect } from 'react';

import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import type { OctoPhase } from '@/modules/auto-prompt/phase';

interface UseOctoBridgeParams {
  parentOctoPanelId: string | null | undefined;
  phase: OctoPhase;
}

/**
 * The single outward voice of the Octo engine. Emits one `octo:lifecycle` event
 * whenever the projected phase changes. Replaces the per-concept emits
 * (countdownActive / thinkingStarted / requestExpand / autoClose / error).
 */
export function useOctoBridge({ parentOctoPanelId, phase }: UseOctoBridgeParams): void {
  useEffect(() => {
    if (!parentOctoPanelId) return;
    eventBus.emit(EVENTS.OCTO_LIFECYCLE, { parentOctoPanelId, phase });
  }, [parentOctoPanelId, phase]);
}
