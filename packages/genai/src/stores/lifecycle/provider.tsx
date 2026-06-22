import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type AutoPromptConfig,
  type LegacyAutoPromptConfig,
  DEFAULT_AUTO_PROMPT_CONFIG,
  normalizeAutoPromptConfig,
} from '@/modules/lifecycle/auto-prompt-config';
import { InvalidStateTransitionError, isValidTransition, OctoState } from '@/core/state-machine/octo-state';

import { LifecycleContext } from './context';

interface LifecycleProviderProps {
    /**
     * Optional auto-prompt configuration. Accepts the current `AutoPromptConfig` shape or the
     * legacy `LegacyAutoPromptConfig` shape for backward compatibility. Falls back to
     * `DEFAULT_AUTO_PROMPT_CONFIG` when omitted.
     */
    autoPromptConfig?: AutoPromptConfig | LegacyAutoPromptConfig;
    children: ReactNode;
}

/**
 * Owns the global `OctoState` lifecycle state machine and resolved
 * `autoPromptConfig`. Must wrap all other sub-providers.
 *
 * - Transitions to `INITIALIZING` on mount.
 * - Transitions to `DESTROYED` on unmount.
 */
export function LifecycleProvider({ autoPromptConfig: autoPromptConfigProp, children }: LifecycleProviderProps) {
    const [octoState, setOctoState] = useState<OctoState>(OctoState.IDLE);
    const stateRef = useRef<OctoState>(OctoState.IDLE);
    const subscribersRef = useRef<Set<(prev: OctoState, next: OctoState) => void>>(new Set());

    // Normalize once per raw-input identity so downstream consumers always see the new shape.
    const autoPromptConfig: AutoPromptConfig = useMemo(
        () => (autoPromptConfigProp ? normalizeAutoPromptConfig(autoPromptConfigProp) : DEFAULT_AUTO_PROMPT_CONFIG),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [autoPromptConfigProp],
    );

    const transitionOctoState = useCallback((next: OctoState) => {
        const current = stateRef.current;
        if (!isValidTransition(current, next)) {
            throw new InvalidStateTransitionError(current, next);
        }
        stateRef.current = next;
        setOctoState(next);
        subscribersRef.current.forEach(cb => cb(current, next));
    }, []);

    const onStateChange = useCallback((cb: (prev: OctoState, next: OctoState) => void): (() => void) => {
        subscribersRef.current.add(cb);
        return () => {
            subscribersRef.current.delete(cb);
        };
    }, []);

    useEffect(() => {
        try {
            transitionOctoState(OctoState.INITIALIZING);
        } catch {
            /* StrictMode double-mount — ignore */
        }
        return () => {
            try {
                transitionOctoState(OctoState.DESTROYED);
            } catch {
                /* ignore */
            }
        };
    }, []);

    return (
        <LifecycleContext.Provider value={{ octoState, onStateChange, autoPromptConfig, transitionOctoState }}>
            {children}
        </LifecycleContext.Provider>
    );
}
