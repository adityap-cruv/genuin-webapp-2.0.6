import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { BaseContext } from '@/context/base'
import { FloatingContext } from '@/context/floating'
import { BasePlayer } from '@/components/player/base'
import { EmbedPlayerHeaderOverlay } from '@/components/player/embed'
import { getIconLink, resolveVideoUrl } from '@/utils'
import { Shimmer } from '@/components/shimmer'
import { Dialog, DialogPortal } from '@/components/ui/dialog'
import { useExpandViewContext } from '@/components/expand-view/context'

export const FloatingView = memo(() => {
  const {
    videos,
    activeIndex,
    muted,
    shouldPlay,
    rootFocusStatus,
    customizations,
    updateActiveIndex,
    brandDetails,
  } = useContext(BaseContext)
  const { isOpen, closeFloatingView } = useContext(FloatingContext)
  const [closedManually, setClosedManually] = useState(false)
  const { toggleFullScreen } = useExpandViewContext()
  const currentVideo = videos[activeIndex === -1 ? 0 : activeIndex]
  const playerShouldPlay = shouldPlay === 'FLOAT' && rootFocusStatus.isFocused
  const shouldShowFloatingPlayer = useMemo(
    () =>
      currentVideo &&
      isOpen &&
      !closedManually &&
      customizations?.is_floating_view,
    [currentVideo, isOpen, !closedManually, customizations?.is_floating_view],
  )

  useEffect(() => {
    const rootElement = customizations?.element
    if (!rootElement) return

    rootElement.classList.add('gen-sdk-pip-open')

    return () => {
      rootElement.classList.remove('gen-sdk-pip-open')
    }
  }, [])

  const handleOnEnded = useCallback(() => {
    if (!customizations?.is_loop_video) {
      updateActiveIndex((prev) => {
        if (prev + 1 < videos.length) {
          return prev + 1
        }
        return prev
      })
    }
  }, [videos])

  if (shouldShowFloatingPlayer)
    return (
      <Dialog defaultOpen>
        <DialogPortal container={customizations?.element}>
          <div
            className='fixed z-50 bottom-2 right-8 flex'
            style={{ width: 180, height: 300 }}>
            <div className='relative h-full w-full overflow-clip rounded-lg'>
              {!currentVideo ? (
                <Shimmer style={{ borderRadius: 8 }} />
              ) : (
                <BasePlayer
                  id={getFloatingPlayerId(currentVideo.video.uuid)}
                  src={resolveVideoUrl(
                    brandDetails?.brand_id,
                    currentVideo.video.media_url_m3u8,
                    currentVideo.video.media_url,
                  )}
                  poster={currentVideo.video.thumbnail_url}
                  shouldPlay={playerShouldPlay}
                  style={{ borderRadius: 8, cursor: 'pointer' }}
                  muted={muted}
                  considerFocusStatus={false}
                  loop={customizations?.is_loop_video}
                  // triggerAnalytics
                  onEnded={handleOnEnded}
                  onClick={() => {
                    toggleFullScreen(
                      undefined,
                      activeIndex,
                      currentVideo.video.share_url,
                    )
                  }}
                />
              )}
              <EmbedPlayerHeaderOverlay
                index={activeIndex}
                playerShouldPlay={playerShouldPlay}
                shouldPlayType='FLOAT'
                userShareUrl={currentVideo.owner.share_url}
                username={currentVideo.owner.username}
                videoShareUrl={currentVideo.video.share_url}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 10,
                cursor: 'pointer',
                transform: 'translate(100%, 0)',
                backgroundColor: '#495057',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
                padding: 4,
              }}
              onClick={() => {
                closeFloatingView()
                setClosedManually(true)
              }}
              className='__gen__sdk__flex__center'>
              <img
                height={15}
                width={15}
                src={getIconLink('icCloseWhite')}
                alt='close'
              />
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    )
})

function getFloatingPlayerId(id: string) {
  return '__gen__sdk__floating__player__' + id
}
