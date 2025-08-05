import React, { createContext, useEffect, useCallback } from 'react'
import { useBaseContext } from './base'
import { Analytics } from '@/analytics'
import { TOPICS } from '@/const'

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
  const { updateShouldPlay, customizations, muted } = useBaseContext()
  const [isOpen, setIsOpen] = React.useState(false)

  const publishFloating = useCallback(
    (floating: boolean) => {
      PubSub.publish(TOPICS.FLOATING, {
        floating,
        sourceId: customizations?.element?.getAttribute('data-instance-id'),
      })
    },
    [customizations?.element],
  )

  const openFloatingView = useCallback(() => {
    if (!muted) {
      publishFloating(false)
    }
    updateShouldPlay('FLOAT')
    setIsOpen(true)
    Analytics.track(Analytics.EventNames.FloatingEmbed)
  }, [muted, publishFloating, updateShouldPlay])

  const closeFloatingView = useCallback(() => {
    updateShouldPlay('EMBED')
    setIsOpen(false)
  }, [updateShouldPlay])

  useEffect(() => {
    if (!muted && isOpen) {
      publishFloating(false)
    }
  }, [muted, isOpen, publishFloating])

  useEffect(() => {
    if (!customizations?.element) return

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

    observer.observe(customizations.element)
    return () => observer.disconnect()
  }, [customizations?.element, closeFloatingView, openFloatingView])

  const handleExternalFloating = useCallback(
    (event: CustomEvent) => {
      setIsOpen(!event.detail.floating)
      updateShouldPlay(event.detail.floating ? 'FLOAT' : 'EMBED')
    },
    [updateShouldPlay],
  )

  useEffect(() => {
    const element = customizations?.element
    if (!element) return

    element.addEventListener(
      'external-floating',
      handleExternalFloating as EventListener,
    )

    return () => {
      element.removeEventListener(
        'external-floating',
        handleExternalFloating as EventListener,
      )
    }
  }, [customizations?.element, updateShouldPlay, handleExternalFloating])

  return (
    <FloatingContext.Provider
      value={{ isOpen, openFloatingView, closeFloatingView }}>
      {children}
    </FloatingContext.Provider>
  )
}
