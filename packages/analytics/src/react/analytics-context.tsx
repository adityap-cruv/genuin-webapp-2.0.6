/**
 * Analytics React Context
 * Provides analytics client to React components
 */

import { createContext } from "react";
import type { AnalyticsClient } from "../core/analytics-client";
import type { EventPayload } from "../types/events";
import type { UserTraits, PageProperties, GroupTraits } from "../types/provider";

/**
 * Analytics context value
 */
export interface AnalyticsContextValue {
  /**
   * Analytics client instance
   */
  client: AnalyticsClient;

  /**
   * Track an analytics event
   */
  track: (eventName: string, payload?: EventPayload) => Promise<void>;

  /**
   * Identify a user
   */
  identify: (userId: string, traits?: UserTraits) => Promise<void>;

  /**
   * Track a page view
   */
  page: (pageName: string, properties?: PageProperties) => Promise<void>;

  /**
   * Associate a user with a group
   */
  group: (groupId: string, traits?: GroupTraits) => Promise<void>;

  /**
   * Whether the analytics client is ready
   */
  isReady: boolean;
}

/**
 * Analytics context
 */
export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);
