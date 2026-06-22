import { State } from './states';

/** Semantic lifecycle phase emitted to the components shell. The whole up-channel API. */
export type OctoPhase =
  | 'idle' | 'countdown' | 'thinking' | 'response' | 'collapsed' | 'error';

export interface PhaseInput {
  state: State;
  /** session.thinking */
  thinking: boolean;
  /** session.status */
  status?: string;
  /** A completed agent message is present in the current session. */
  hasVisibleResponse: boolean;
}

/**
 * Pure projection of the FSM state (+ session signals) to the lifecycle phase.
 * Single source of the phase the SDK publishes; no I/O.
 */
export function phaseForState(input: PhaseInput): OctoPhase {
  if (input.status === 'error') return 'error';
  switch (input.state) {
    case State.COUNTDOWN:
    case State.NEXT_PROMPT_COUNTDOWN:
    case State.PANEL_CARRY_OVER:
      return 'countdown';
    case State.SENDING:
      return 'thinking';
    case State.AWAITING_RESPONSE:
      return input.hasVisibleResponse ? 'response' : 'thinking';
    case State.CHAT_CLOSE_DELAY:
      return 'response';
    case State.POST_CLOSE_IDLE:
      return 'collapsed';
    case State.IDLE:
    default:
      return 'idle';
  }
}
