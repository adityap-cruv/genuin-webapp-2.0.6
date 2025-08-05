import { useRef, useEffect } from 'react'

/**
 * Custom React hook to store the previous value of a variable.
 * @param value The current value to track.
 * @returns The previous value before the last render.
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default usePrevious
