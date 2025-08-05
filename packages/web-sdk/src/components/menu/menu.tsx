import { useCallback } from 'react'
import { useMenuContext } from './context'
import { useAuth } from '@/context/auth'
import { useBaseContext } from '@/context/base'
import { reportDeepLink } from '@/components/download-app/get-deeplink'
import { useModalHandler } from '@/hooks/useModalHandler'
import { DialogClose } from '@/components/ui/dialog'

export function Menu() {
  const { videoSlug, shareUrl, contentId, changeModalType } = useMenuContext()
  const { user } = useAuth()
  const { brandDetails, playbackSpeed, customizations } = useBaseContext()
  const { openModal } = useModalHandler()

  const reportModalHandle = useCallback(async () => {
    if (brandDetails?.web_cta === 'app') {
      await reportDeepLink(videoSlug, shareUrl).then((generatedLink) => {
        openModal({
          deepLink: generatedLink,
          subtitle: 'Download app to report the video.',
        })
      })
      return
    }
    changeModalType('report')
  }, [user, contentId])

  return (
    <div className='shadow-lg'>
      {brandDetails?.web_configs.playback_speed_enabled && (
        <div
          onClick={() => {
            changeModalType('playBackSpeed')
          }}
          className='cursor-pointer border-b border-tertiary-300 p-4 text-center text-title-3-med'>
          Playback speed ({playbackSpeed.speed}x)
        </div>
      )}

      {!user?.isBrandSystemUser &&
        customizations?.view === 'standard_wall' &&
        brandDetails?.web_configs.login_signup_popup.enable && (
          <div
            onClick={reportModalHandle}
            className='cursor-pointer border-b border-b-tertiary-300 py-4 text-center text-title-3-med text-red'>
            Report Post
          </div>
        )}

      <DialogClose className='w-full cursor-pointer py-4 px-16 text-center outline-none text-title-3-med'>
        Cancel
      </DialogClose>
    </div>
  )
}
