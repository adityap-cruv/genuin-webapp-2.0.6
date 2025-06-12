import { useCallback } from 'react'
import { reportDeepLink } from '@/lib/get-deeplink'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { openModal } from '@/lib/utils'
import { DialogClose } from '@/components/ui/dialog'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { useMenuContext } from './context'

export function Menu() {
  const { videoSlug, shareUrl, contentId, changeModalType } = useMenuContext()
  const { user, webCTA, config } = useGenuinOptions(
    useShallow((state) => ({ user: state.user, webCTA: state.webCTA, config: state.config }))
  )
  const { playbackSpeed } = usePlayerControlStore(
    useShallow((state) => ({
      playbackSpeed: state.playbackSpeed,
    }))
  )

  const reportModalHandle = useCallback(async () => {
    if (webCTA === 'app') {
      await reportDeepLink(videoSlug, shareUrl).then((generatedLink) => {
        openModal({ deepLink: generatedLink, subtitle: 'Download app to report the video.' })
      })
      return
    }
    changeModalType('report')
  }, [user, contentId])

  return (
    <div>
      {config.web_configs?.playback_speed_enabled && (
        <div
          onClick={() => {
            changeModalType('playBackSpeed')
          }}
          className="cursor-pointer border-b border-tertiary-300 px-4 py-4 text-center text-title-3-med">
          Playback speed ({playbackSpeed.speed}x)
        </div>
      )}

      {!user?.isBrandSystemUser && (
        <div
          onClick={reportModalHandle}
          className="cursor-pointer border-b border-tertiary-300 px-12 py-4 text-center text-title-3-med text-red">
          Report Post
        </div>
      )}
      <DialogClose className="w-full cursor-pointer p-4 px-12 text-center text-title-3-med outline-none">
        Cancel
      </DialogClose>
    </div>
  )
}
