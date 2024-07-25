import { Analytics } from '@services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'

export function triggerAnalyticsForVideoComplete(videoId: string) {
  const { currentTime, duration } = usePlayerControlStore.getState()
  const properties = {
    content_category: 'loop',
    content_id: videoId,
    event_record_screen: 'feed',
    event_target_screen: 'none',
    video_length: duration,
    video_view_length: currentTime,
  }

  void Analytics.track({
    eventName: 'Video First Quartile',
    properties,
  })

  void Analytics.track({
    eventName: 'Video Watched',
    properties,
  })

  void Analytics.track({
    eventName: 'Video Third Quartile',
    properties,
  })

  void Analytics.track({
    eventName: 'Video Complete',
    properties,
  })
}
