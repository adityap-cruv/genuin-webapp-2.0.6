/**
 * This helper provides a standardized way to track analytics events across
 * different components. It handles common properties like user ID and brand ID
 * and manages the different behavior for embedded vs non-embedded contexts.
 */
import Analytics from '@services/analytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function useAnalyticsTracker() {
  // Get user and brand info from the global store
  const { user } = useGenuinOptions((state) => ({
    brandId: state.brandId,
    user: state.user,
  }))

  /**
   * Track an analytics event with standardized properties
   * @param eventName - Name of the event to track
   * @param videoId - ID of the video content
   * @param additionalProps - Any additional properties to include
   */
  const trackEvent = (eventName: string, videoId: string, additionalProps = {}) => {
    // Set up base properties that all events will have
    const properties = {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: 'feed',
      event_target_screen: 'none',
      user_id: user?.id,
      ...additionalProps,
    }

    // // Add brand ID for embedded contexts
    // if (pathname.includes('embed')) {
    //   Object.assign(properties, {
    //     brand_id: brandId,
    //   })
    // }

    // Track the event using the Analytics service
    void Analytics.track({
      eventName,
      properties,
    })
  }

  return { trackEvent }
}
