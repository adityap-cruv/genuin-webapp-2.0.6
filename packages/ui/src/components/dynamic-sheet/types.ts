import type { ComponentProps, ReactNode, RefObject } from "react";

// ─── Sheet States ─────────────────────────────────────────────────────────────

export const DYNAMIC_SHEET_STATES = [
  "default",
  "default-active",
  "expand-view",
  "panel-view",
  "full-view",
] as const;

export type DynamicSheetState = (typeof DYNAMIC_SHEET_STATES)[number];

// ─── Height Configuration ─────────────────────────────────────────────────────

export type HeightValue = string | number;

export type DynamicSheetHeightConfig = Partial<
  Record<DynamicSheetState, HeightValue>
>;

export const DEFAULT_HEIGHTS: Record<DynamicSheetState, HeightValue> = {
  default: 15,
  "default-active": 18,
  "expand-view": 40,
  "panel-view": 70,
  "full-view": 100,
};

// ─── Render Mode ──────────────────────────────────────────────────────────────

/**
 * "fixed"     → portal into document.body, covers the full viewport.
 * "container" → position:absolute inside nearest positioned ancestor.
 * "inline"    → no positioning at all; renders in normal document flow.
 *               Parent fully controls placement. Height animates 0 → computed.
 *               Pass `containerRef` (or the sheet measures itself) for
 *               percentage-based snap heights.
 */
export type DynamicSheetRenderMode = "fixed" | "container" | "inline";

// ─── Auto-Advance Rules ──────────────────────────────────────────────────────

/**
 * Automatically transition from one state to another after a delay.
 *
 * @example
 * // Go from "default" to "expand-view" after 2 s
 * { from: "default", to: "expand-view", delayMs: 2000 }
 */
export interface AutoAdvanceRule {
  /** The state that triggers the timer */
  from: DynamicSheetState;
  /** The state to transition to once the timer fires */
  to: DynamicSheetState;
  /** Delay in milliseconds before transitioning (default: 3000) */
  delayMs?: number;
}

// ─── Sheet Config ─────────────────────────────────────────────────────────────

export interface DynamicSheetConfig {
  /** Which sheet states are enabled */
  enabledStates?: DynamicSheetState[];
  /** Height per state – number = % of container, or CSS string */
  heights?: DynamicSheetHeightConfig;
  /** State the sheet opens to */
  initialState?: DynamicSheetState;
  /** Show the semi-transparent backdrop overlay */
  showOverlay?: boolean;
  /** Show the drag indicator pill */
  showIndicator?: boolean;
  /** Show the built-in close button in header */
  showClose?: boolean;
  /** Show the footer section */
  showFooter?: boolean;
  /** Title shown in the center of the built-in header */
  navTitle?: string;
  /** Visual theme */
  theme?: "light" | "dark";
  /** Step-by-step swipe down (true) or jump to lowest state (false) */
  stepByStepSwipeDown?: boolean;
  /** Disable all drag/swipe interactions */
  disableDragAndSwipe?: boolean;
  /** Disable all open/close/height animations (instant transitions) */
  disableAnimation?: boolean;
  /** Called when the sheet state changes */
  onStateChange?: (state: DynamicSheetState) => void;
  /** Called when the sheet requests to close */
  onClose?: () => void;
  /**
   * When true, the close button/gesture calls onClose but does NOT collapse
   * the sheet (no setIsVisible(false)). Useful for inline/embed variants where
   * "close" should snap back to a default state rather than disappear entirely.
   */
  preventCloseCollapse?: boolean;
  /**
   * Rules that automatically advance the sheet from one state to another
   * after an optional delay. Replaces the previous hardcoded
   * default-active → expand-view behaviour.
   *
   * @example
   * autoAdvance={[
   *   { from: "default",        to: "expand-view", delayMs: 2000 },
   *   { from: "default-active", to: "expand-view", delayMs: 3000 },
   * ]}
   */
  autoAdvance?: AutoAdvanceRule[];
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface DynamicSheetProps extends ComponentProps<"div">  {
  /** Controls the open/close animation */
  isOpen: boolean;
  /** Called after the close animation completes so the parent can unmount */
  onDismissed?: () => void;
  /** Sheet behaviour configuration */
  config?: DynamicSheetConfig;
  /**
   * Controlled state - when provided, the sheet will transition to this state
   * instead of using initialState when opening. Useful when parent manages state.
   */
  controlledState?: DynamicSheetState;
  /** Render strategy – "fixed" (portal) or "container" (inline absolute) */
  renderMode?: DynamicSheetRenderMode;
  /**
   * Required when renderMode="container".
   * Optional for renderMode="inline" – used to compute percentage-based heights
   * against the container. If omitted in "inline" mode the sheet measures its
   * own parent via an internal ref.
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** Custom header content (replaces built-in header) */
  header?: ReactNode;
  /** Footer content (visible in panel-view and above) */
  footer?: ReactNode;
  /** Sheet body content */
  children?: ReactNode;
  /** Root element className override */
  className?: string;
  /** Header section className */
  headerClassName?: string;
  /** Scrollable content section className */
  contentClassName?: string;
  /** Footer section className */
  footerClassName?: string;
  /** Called when dragging state changes */
  onDragging?: (isDragging: boolean) => void;
  /** Callback to enable/disable swipers when interacting with the sheet */
  onSwiperToggle?: (disable: boolean) => void;
} 

// ─── Hook Types ───────────────────────────────────────────────────────────────

export interface UseDynamicSheetOptions {
  enabledStates: DynamicSheetState[];
  heights: Record<DynamicSheetState, HeightValue>;
  initialState: DynamicSheetState;
  containerHeight: number;
  stepByStepSwipeDown: boolean;
  disableDragAndSwipe: boolean;
  onStateChange?: (state: DynamicSheetState) => void;
  onRequestClose?: () => void;
  /** Auto-advance rules forwarded from DynamicSheetConfig */
  autoAdvance?: AutoAdvanceRule[];
}

export interface DragTrackingState {
  initialY: number;
  initialHeightPx: number;
  lastY: number;
  lastTimestamp: number;
  flickVelocity: number;
  hasMoved: boolean;
}
