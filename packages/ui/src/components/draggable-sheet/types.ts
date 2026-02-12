import type { ComponentProps, ReactNode } from "react";

export const DRAGGABLE_SHEET_STATES = [
  "default",
  "default-active",
  "expand-view",
  "panel-view",
  "full-view",
] as const;

export type DraggableSheetState = (typeof DRAGGABLE_SHEET_STATES)[number];

export type HeightValue = string | number;

export type DraggableSheetHeightConfig = Partial<
  Record<DraggableSheetState, HeightValue>
>;

export interface DraggableSheetProps extends ComponentProps<"div"> {
  enabledStates?: DraggableSheetState[];
  initialState?: DraggableSheetState;
  expandDelay?: number;
  showOverlay?: boolean;
  showIndicator?: boolean;
  showNav?: boolean;
  navTitle?: string;
  showClose?: boolean;
  closeIcon?: ReactNode;
  onStateChange?: (state: DraggableSheetState) => void;
  onClose?: () => void;
  visible?: boolean;
  theme?: "light" | "dark";
  heights?: DraggableSheetHeightConfig;
  overlayClassName?: string;
  contentClassName?: string;
  navClassName?: string;
  transitionDuration?: number;
  stepByStepSwipeDown?: boolean;
  footer?: ReactNode;
  footerClassName?: string;
  loading?: boolean;
}

export interface DragState {
  initialY: number;
  initialHeightPx: number;
  lastY: number;
  lastTimestamp: number;
  flickVelocity: number;
  hasMovedBeyondThreshold: boolean;
}
