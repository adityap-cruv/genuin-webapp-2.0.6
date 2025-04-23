import { useState, useEffect } from 'react'

export const useIheartBorderState = (condition: boolean, duration = 5000) => {
  const [showBorder, setShowBorder] = useState(false)

  useEffect(() => {
    if (condition) {
      setShowBorder(true)

      const timer = setTimeout(() => {
        setShowBorder(false)
      }, duration)

      return () => {
        clearTimeout(timer)
      }
    } else {
      setShowBorder(false)
    }
  }, [condition, duration])

  return showBorder
}
