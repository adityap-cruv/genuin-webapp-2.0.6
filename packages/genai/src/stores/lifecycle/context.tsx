import { createContext, useContext } from 'react';

import { DEFAULT_AUTO_PROMPT_CONFIG } from '@/modules/lifecycle/auto-prompt-config';
import { OctoState } from '@/core/state-machine/octo-state';
import type { LifecycleContextType } from '@/modules/lifecycle/types';

/**
 * No-op stub returned when `useLifecycleContext` is called outside `LifecycleProvider`
 * (i.e. in page/floater/dialog views where lifecycle is not mounted).
 * All `transitionOctoState` call sites already wrap in try/catch so silent no-ops are safe.
 */
const NOOP_LIFECYCLE: LifecycleContextType = {
  octoState: OctoState.IDLE,
  onStateChange: () => () => {},
  autoPromptConfig: DEFAULT_AUTO_PROMPT_CONFIG,
  transitionOctoState: () => {},
};

/** React context for the lifecycle domain. */
export const LifecycleContext = createContext<LifecycleContextType>(NOOP_LIFECYCLE);

/**
 * Returns the nearest `LifecycleProvider` context value.
 * Returns a no-op stub when called outside `LifecycleProvider` (non-web-sdk views).
 */
export function useLifecycleContext(): LifecycleContextType {
  return useContext(LifecycleContext);
}
