import { useEffect, useState } from 'react'

export function useHasUserFocus() {
  const [toReturn, setToReturn] = useState(true)
  function handleFocus() {
    setToReturn(true)
  }

  function handleBlur() {
    setToReturn(false)
  }
  useEffect(() => {
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return toReturn
}
