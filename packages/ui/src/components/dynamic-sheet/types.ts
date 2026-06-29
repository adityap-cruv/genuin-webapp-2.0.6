import type { ComponentProps, ReactNode, RefObject } from "react";

// ─── Sheet States ─────────────────────────────────────────────────────────────

export const DYNAMIC_SHEET_STATES = [
  // Compact placement chips. Upstream of `default`; used as the entry
  // point for narrow embeds and the mobile-expand flow's first frame
  // (auto-advances to `default` after 3 s in that flow).
  "pl-xs",
  "pl-sml",
  "default",
  "default-active",
  "expand-view",
  "panel-view",
  "full-view",
  // Responsive wide-card layout (post-detail / ad slots). Single
  // self-contained card that fills its host container; adapts to
  // width AND height via size buckets + orientation. Only enabled
  // by the `responsive` scenario in `linkouts-sheet-config.ts` —
  // every other scenario keeps its existing state machine
  // unchanged. See RESPONSIVE_LINKOUT_PLAN.md.
  "responsive",
] as const;

export type DynamicSheetState = (typeof DYNAMIC_SHEET_STATES)[number];

// ─── Height Configuration ─────────────────────────────────────────────────────

export type HeightValue = string | number;

export type DynamicSheetHeightConfig = Partial<Record<DynamicSheetState, HeightValue>>;

// Numbers are % of container (per the `DynamicSheetConfig` doc-comment),
// strings are CSS values. Per-scenario overrides in linkouts-sheet-config.ts
// pin the chip states to fixed pixel heights ("32px" for pl-xs, "40px" for
// pl-sml) — the percentages here are sensible fallbacks when a scenario
// doesn't specify.
export const DEFAULT_HEIGHTS: Record<DynamicSheetState, HeightValue> = {
  "pl-xs": 5,
  "pl-sml": 6,
  default: 15,
  "default-active": 18,
  "expand-view": 40,
  "panel-view": 70,
  "full-view": 100,
  // `responsive` fills its host container — the responsive scenario
  // overrides this with `100%`, but the default keeps it numeric so
  // snap math stays well-defined in any other (unintended) scenario.
  responsive: 100,
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
  /**
   * When true, each upward drag advances exactly one snap state regardless of
   * distance. Default `false` snaps to nearest (can skip states on a long drag).
   */
  stepByStepSwipeUp?: boolean;
  /** Disable all drag/swipe interactions */
  disableDragAndSwipe?: boolean;
  /** Disable all open/close/height animations (instant transitions) */
  disableAnimation?: boolean;
  /**
   * When true, `currentState` updates only at drag end (skips mid-drag proximity
   * commits). Avoids layout flicker when the host swaps surrounding layout per
   * state and the user crosses several snap points. Default `false`.
   */
  commitOnDragEnd?: boolean;
  /** Called when the sheet state changes */
  onStateChange?: (state: DynamicSheetState) => void;
  /** Called when the sheet requests to close */
  onClose?: () => void;
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

export interface DynamicSheetProps extends ComponentProps<"div"> {
  /** Controls the open/close animation */
  isOpen: boolean;
  /** Called after the close animation completes so the parent can unmount */
  onDismissed?: () => void;
  /** Sheet behaviour configuration */
  config?: DynamicSheetConfig;
  /** Render strategy – "fixed" (portal) or "container" (inline absolute) */
  renderMode?: DynamicSheetRenderMode;
  /**
   * Bottom inset in CSS px for bottom-anchored (positioned, non-inline-flow)
   * sheets. Applied as the panel's `style.bottom` so the sheet's bottom edge
   * can be re-anchored to the visual-viewport bottom — e.g. above the iOS
   * on-screen keyboard. Typically sourced from a keyboard-inset hook.
   *
   * Only takes effect when the sheet is rendered bottom-anchored (the consumer
   * pins it with `position: fixed`/`absolute` + `bottom`). When `undefined`,
   * no inline `bottom` is applied and behaviour is unchanged.
   *
   * NOTE: an inline `bottom` cannot override a `bottom-0 !important` Tailwind
   * class — remove any such class from the panel className for this to apply.
   */
  bottomInset?: number;
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
  /** Externally-controlled sheet state (octo flow); when set, the sheet
   *  transitions to it. */
  controlledState?: DynamicSheetState;
  /**
   * Per-state body renderer used to measure `"auto"` heights for
   * states whose body differs from the currently-mounted `children`.
   *
   * Background: the engine measures `children` (the active body) to
   * resolve `"auto"` heights. When two adjacent enabled states are
   * both `"auto"` but render *different* bodies (e.g. `default-active`
   * = compact card, `expand-view` = rich card), the engine would
   * collapse both states onto the active body's measured height and
   * the snap chain breaks.
   *
   * Hosts that hit that case can pass `autoHeightProvider(state)`.
   * The engine mounts the returned node in a hidden measurement well
   * (one per `"auto"` state) and uses each well's `offsetHeight` as
   * the snap target for that state. Wells are `aria-hidden`,
   * `inert`, pointer-event-disabled, and absolutely positioned off
   * the visible flow so they don't affect layout or interaction.
   *
   * Optional: when omitted, the engine falls back to the legacy
   * shared `measuredAutoPx` from the active body.
   */
  autoHeightProvider?: (state: DynamicSheetState) => ReactNode;
}

// ─── Hook Types ───────────────────────────────────────────────────────────────

export interface UseDynamicSheetOptions {
  enabledStates: DynamicSheetState[];
  heights: Record<DynamicSheetState, HeightValue>;
  initialState: DynamicSheetState;
  containerHeight: number;
  stepByStepSwipeDown: boolean;
  stepByStepSwipeUp?: boolean;
  disableDragAndSwipe: boolean;
  commitOnDragEnd?: boolean;
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
