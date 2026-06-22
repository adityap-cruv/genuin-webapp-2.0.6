import type { AutoPromptConfig } from './auto-prompt-config';
import type { OctoState } from '@/core/state-machine/octo-state';

/** Callback signature for OctoState change subscribers. */
export type OctoStateChangeCallback = (prev: OctoState, next: OctoState) => void;

/** Context value exposed by `LifecycleProvider`. */
export interface LifecycleContextType {
  /** Current global lifecycle state of this SDK instance. */
  octoState: OctoState;
  /**
   * Subscribe to OctoState changes. Returns an unsubscribe function.
   * Safe to call outside React render — uses a stable ref internally.
   */
  onStateChange: (cb: OctoStateChangeCallback) => () => void;
  /** Resolved auto-prompt configuration for this instance. */
  autoPromptConfig: AutoPromptConfig;
  /**
   * Transition the lifecycle state machine to `state`.
   * Throws `InvalidStateTransitionError` for illegal transitions.
   */
  transitionOctoState: (state: OctoState) => void;
}
