import { WebConfigsType } from "@/type"

/**
 * Determines video playback configuration based on web configs
 * @param webConfigs Configuration object containing feed video play settings
 * @returns Object containing repeatCount and shouldSwipeNext flags
 *
 * If feed_video_play.type is 2:
 * - repeatCount is set to swipe_after value
 * - shouldSwipeNext is true (auto swipe enabled)
 *
 * Otherwise:
 * - repeatCount is set to repeat_video value or 0
 * - shouldSwipeNext is false (auto swipe disabled)
 */
export const getVideoPlayerConfigs = (webConfigs?: WebConfigsType) => {
  let repeatCount: number

  // Check if feed_video_play.type is 2, (auto swipe enabled)
  if (webConfigs?.feed_video_play.type === 2) {
    repeatCount = webConfigs.feed_video_play.swipe_after
    // Check if feed_video_play.repeat_video is 0 (infinite repeats)
  } else if (webConfigs?.feed_video_play.type === 1 && webConfigs?.feed_video_play.repeat_video === 0) {
    repeatCount = Infinity // infinite repeats
    // Otherwise, set repeatCount to the value of repeat_video
  } else {
    repeatCount = webConfigs?.feed_video_play.repeat_video ?? 0
  }

  const shouldSwipeNext = webConfigs?.feed_video_play.type === 2

  let autoplay: boolean = true
  let autoplayAfter: number = 0

  // if type is 2 than don't autoplay video
  if (webConfigs?.video_autoplay.type === 2) {
    autoplay = false
  }

  // if type is 3 than autoplay video after auto_play_after
  if (webConfigs?.video_autoplay.type === 3) {
    autoplayAfter = webConfigs.video_autoplay.auto_play_after
  }

  const unmuteVideo = webConfigs?.is_start_with_sound ?? false

  return { repeatCount: repeatCount - 1, shouldSwipeNext, autoplay, autoplayAfter, unmuteVideo }
}
