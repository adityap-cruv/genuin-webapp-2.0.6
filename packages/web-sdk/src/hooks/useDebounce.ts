import { useCallback, useState } from 'react'

type CallbackFunction = (...args: any[]) => void

function useDebounce(
  callback: CallbackFunction,
  delay: number,
): [debouncedFunction: CallbackFunction, cancelDebounce: () => void] {
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutId) return

      const newTimeoutId = window.setTimeout(() => {
        callback(...args)
      }, delay)

      setTimeoutId(newTimeoutId)
    },
    [callback],
  )
  const cancelDebounce = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [callback])

  return [debouncedFunction, cancelDebounce]
}

export default useDebounce
