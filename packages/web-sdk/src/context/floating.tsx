import React, { createContext, useEffect } from 'react'
import { useBaseContext } from './base'
import { Analytics } from '@/analytics'

type FloatingContextType = {
  isOpen: boolean
  openFloatingView: () => void
  closeFloatingView: () => void
}

export const FloatingContext = createContext<FloatingContextType>({
  isOpen: false,
  openFloatingView: () => {},
  closeFloatingView: () => {},
})

export function FloatingViewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { updateShouldPlay, customizations } = useBaseContext()
  const [isOpen, setIsOpen] = React.useState(false)

  function openFloatingView() {
    updateShouldPlay('FLOAT')
    setIsOpen(true)
    Analytics.track(Analytics.EventNames.FloatingEmbed)
  }

  function closeFloatingView() {
    updateShouldPlay('EMBED')
    setIsOpen(false)
  }

  useEffect(() => {
    let firstTime = true
    // Created different observer for floating view, because it has to do with the visibility of the element.
    // We can't make use of the states.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (firstTime) {
            firstTime = false
            return
          }
          if (entry.isIntersecting) {
            closeFloatingView()
          } else {
            openFloatingView()
          }
        })
      },
      { threshold: 0.5 },
    )
    if (customizations?.element) observer.observe(customizations.element)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <FloatingContext.Provider
      value={{ isOpen, openFloatingView, closeFloatingView }}>
      {children}
    </FloatingContext.Provider>
  )
}
