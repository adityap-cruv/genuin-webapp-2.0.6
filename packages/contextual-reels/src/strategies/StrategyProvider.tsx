/**
 * StrategyProvider — distributes resolved {@link Strategies} to the tree.
 *
 * Resolves strategies once per tag and shares the result so providers and
 * components read decisions instead of recomputing allowlist checks.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  DEFAULT_STRATEGIES,
  resolveStrategies,
  type Strategies,
} from "@cxr/strategies/strategies";

const StrategyContext = createContext<Strategies | undefined>(undefined);

interface StrategyProviderProps {
  children: ReactNode;
  /** Tag the strategy decisions are resolved for. */
  tagId: string;
}

/**
 * Provide feature decisions for the active tag.
 *
 * @example
 * ```tsx
 * <StrategyProvider tagId={tagId}>
 *   <Feed ... />
 * </StrategyProvider>
 * ```
 */
export function StrategyProvider({ children, tagId }: StrategyProviderProps): ReactNode {
  const value = useMemo(() => resolveStrategies(tagId), [tagId]);
  return <StrategyContext.Provider value={value}>{children}</StrategyContext.Provider>;
}

/**
 * Read the active strategies.
 *
 * Does not throw outside a provider: strategies are an enhancement layer, so a
 * missing provider degrades to {@link DEFAULT_STRATEGIES} (every feature off).
 */
export function useStrategy(): Strategies {
  return useContext(StrategyContext) ?? DEFAULT_STRATEGIES;
}
