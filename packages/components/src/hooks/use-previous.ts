import { useEffect, useRef } from "react";

/**
 * Custom hook that returns the previous value of a given value.
 * Useful for comparing current and previous values in effects or renders.
 *
 * @template T - The type of the value to track
 * @param value - The current value to track
 * @returns The previous value, or undefined on first render
 *
 * @example
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * useEffect(() => {
 *   if (previousCount !== undefined && count > previousCount) {
 *     console.log('Count increased');
 *   }
 * }, [count, previousCount]);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
