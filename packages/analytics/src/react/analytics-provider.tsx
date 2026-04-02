/**
 * Analytics Provider Component
 * Wraps app with analytics context
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { AnalyticsContext } from './analytics-context'
import type { AnalyticsContextValue } from './analytics-context'
import type { AnalyticsClient } from '../core/analytics-client'

/**
 * Analytics provider props
 */
export interface AnalyticsProviderProps {
  /**
   * Pre-configured analytics client
   */
  client: AnalyticsClient

  /**
   * Children components
   */
  children: ReactNode
}

/**
 * AnalyticsProvider provides analytics client to child components
 */
export function AnalyticsProvider({ client, children }: AnalyticsProviderProps) {
  const [isReady, setIsReady] = useState(client.isReady())

  useEffect(() => {
    // Initialize client if not already initialized
    if (!client.isReady()) {
      client.initialize().then(() => {
        setIsReady(true)
      }).catch((error) => {
        console.error('[AnalyticsProvider] Initialization failed:', error)
      })
    }

    // Cleanup on unmount
    return () => {
      client.destroy()
    }
  }, [client])

  // Memoize tracking functions
  const track = useCallback(
    (eventName: string, payload?: Record<string, any>) => {
      return client.track(eventName, payload)
    },
    [client]
  )

  const identify = useCallback(
    (userId: string, traits?: Record<string, any>) => {
      return client.identify(userId, traits)
    },
    [client]
  )

  const page = useCallback(
    (pageName: string, properties?: Record<string, any>) => {
      return client.page(pageName, properties)
    },
    [client]
  )

  const group = useCallback(
    (groupId: string, traits?: Record<string, any>) => {
      return client.group(groupId, traits)
    },
    [client]
  )

  // Memoize context value
  const value: AnalyticsContextValue = useMemo(
    () => ({
      client,
      track,
      identify,
      page,
      group,
      isReady,
    }),
    [client, track, identify, page, group, isReady]
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}
