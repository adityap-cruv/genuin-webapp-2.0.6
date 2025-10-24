import { useCallback, useRef } from "react";

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
 * const { onClick, onDoubleClick } = useDoubleClick({
 *   onSingleClick: () => console.log('Single click'),
 *   onDoubleClick: () => console.log('Double click'),
 *   delay: 300
 * });
 * 
 * return <div onClick={onClick} onDoubleClick={onDoubleClick}>Click me</div>
 * ```
 */
export function useDoubleClick({
  delay = 300,
  onSingleClick,
  onDoubleClick,
}: UseDoubleClickOptions): UseDoubleClickReturn {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const onClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const timeout = setTimeout(() => {
      if (clickCountRef.current === 1) {
        onSingleClick?.();
      }
      clickCountRef.current = 0;
    }, delay);

    clickTimeoutRef.current = timeout;
  }, [delay, onSingleClick]);

  const handleDoubleClick = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    clickCountRef.current = 0;

    onDoubleClick?.();
  }, [onDoubleClick]);

  return {
    onClick,
    onDoubleClick: handleDoubleClick,
  };
}
