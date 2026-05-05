/**
 * Analytics Context
 * Provides Octo analytics instance to all GenAI SDK components
 */

import { createContext } from 'react'

import type { OctoAnalytics } from '@/analytics'

/**
 * Analytics context value
 */
export interface AnalyticsContextValue {
  /**
   * Octo analytics instance
   */
  analytics: OctoAnalytics

  /**
   * Whether analytics is initialized and ready
   */
  isReady: boolean
}

/**
 * Analytics context
 */
export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)
