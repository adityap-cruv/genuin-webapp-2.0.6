import { useEffect, useRef, useState } from 'react'
import copyToClipboard from 'copy-to-clipboard'

const defaultOptions = {
  successDuration: 2000
}

export function useClipboard (value, options = defaultOptions) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef()

  useEffect(() => {
    if (isCopied && options.successDuration) {
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false)
      }, options.successDuration)
    }
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [isCopied, options.successDuration])

  const copy = async () => {
    try {
      const didCopy = copyToClipboard && copyToClipboard(value)
      setIsCopied(didCopy)
    } catch (e) {
      console.log(e)
    }
  }

  return [isCopied, copy]
}
