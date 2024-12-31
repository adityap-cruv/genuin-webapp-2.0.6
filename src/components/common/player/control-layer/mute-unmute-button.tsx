import { useCallback } from 'react'
import Analytics from '@/services/analytics'
import { MuteIcon } from '@icons/player-controls/mute-icon'
import { UnmuteIcon } from '@icons/player-controls/unmute-icon'
import { usePlayerControlStore } from '../player-control-store'

export const MuteUnmuteButton = ({ videoId }: { videoId: string }) => {
  const { muted, toggleMuted } = usePlayerControlStore()
  // const muteAnimationController = useAnimationControls()
  // useEffect(() => {
  //   muteAnimationController
  //     ?.start({
  //       width: 0,
  //       transition: {
  //         delay: 4,
  //         duration: 0.5,
  //         repeatType: 'mirror',
  //         repeatDelay: 3,
  //         repeat: Infinity,
  //       },
  //     })
  //     .catch((_e) => {})
  // }, [])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      toggleMuted()
      void Analytics.track({
        eventName: muted ? 'Unmute' : 'Mute',
        properties: { video_id: videoId },
      })
    },
    [muted, toggleMuted, videoId]
  )

  return (
    <div onClick={handleClick} className="flex w-fit items-center overflow-hidden rounded-lg bg-monochrome-white p-2">
      {muted ? <MuteIcon className="h-6 w-6 stroke-secondary" /> : <UnmuteIcon className="h-6 w-6 stroke-secondary" />}
    </div>
  )
}
