import type { ComponentProps } from "react";

export const DRAGGABLE_SHEET_STATES = [
  "default",
  "default-active",
  "expand-view",
  "panel-view",
  "full-view",
] as const;

export type DraggableSheetState = (typeof DRAGGABLE_SHEET_STATES)[number];

export type HeightValue = string | number;

export type DraggableSheetHeightConfig = Record<
  DraggableSheetState,
  HeightValue
>;

export interface DraggableSheetConfig {
  heights?: DraggableSheetHeightConfig;
  showOverlay?: boolean;
  showIndicator?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showClose?: boolean;
  headerTitle?: string;
  navTitle?: string;
  closeIcon?: React.ReactNode;
  theme?: "light" | "dark";
  overlayClassName?: string;
  transitionDuration?: number;
  stepByStepSwipeDown?: boolean;
  expandDelay?: number;
  enabledStates?: DraggableSheetState[];
  initialState?: DraggableSheetState;
  onStateChange?: (state: DraggableSheetState) => void;
  onClose?: () => void;
  visible?: boolean;
  loading?: boolean;
}

export interface DraggableSheetProps extends ComponentProps<"div"> {
  config: DraggableSheetConfig;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface DragState {
  initialY: number;
  initialHeightPx: number;
  lastY: number;
  lastTimestamp: number;
  flickVelocity: number;
  hasMovedBeyondThreshold: boolean;
}

export const DEFAULT_HEIGHTS: Record<DraggableSheetState, HeightValue> = {
  default: 15,
  "default-active": 18,
  "expand-view": 40,
  "panel-view": 70,
  "full-view": 100,
};

export const DEFAULT_CONFIG: DraggableSheetConfig = {
  heights: DEFAULT_HEIGHTS,
  showOverlay: false,
  showIndicator: true,
  showClose: false,
  theme: "light",
  transitionDuration: 350,
  stepByStepSwipeDown: true,
  expandDelay: 3000,
  enabledStates: [...DRAGGABLE_SHEET_STATES],
  initialState: "default",
  visible: true,
  loading: false,
};