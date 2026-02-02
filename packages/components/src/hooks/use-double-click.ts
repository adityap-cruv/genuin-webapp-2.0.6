"use client";
import { useCallback, useEffect, useRef } from "react";

export interface UseDoubleClickOptions {
  /**
   * Time window in milliseconds to detect a double-click
   * @default 300
   */
  delay?: number;
  /**
   * Callback to execute on single click
   */
  onSingleClick?: () => void;
  /**
   * Callback to execute on double click
   */
  onDoubleClick?: () => void;
}

export interface UseDoubleClickReturn {
  /**
   * Click handler to be attached to the element
   */
  onClick: () => void;
  /**
   * Double click handler to be attached to the element
   */
  onDoubleClick: () => void;
}

/**
 * Hook to handle single click vs double-click detection
 *
 * @example
 * ```tsx
 * const handleClick = useDoubleClick({
 *   onSingleClick: () => console.log('Single click'),
 *   onDoubleClick: () => console.log('Double click'),
 *   delay: 300
 * });
 *
 * return <div onClick={handleClick}>Click me</div>
 * ```
 */
export function useDoubleClick({
  delay = 300,
  onSingleClick,
  onDoubleClick,
}: UseDoubleClickOptions): (event: React.MouseEvent) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      // If timer exists, it's a double click
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        onDoubleClick?.();
        return;
      }

      // First click - set timer for single click
      timerRef.current = setTimeout(() => {
        // Check if timer still exists before executing single click
        if (timerRef.current) {
          onSingleClick?.();
          timerRef.current = null;
        }
      }, delay);
    },
    [delay, onSingleClick, onDoubleClick]
  );

  return handleClick;
}
