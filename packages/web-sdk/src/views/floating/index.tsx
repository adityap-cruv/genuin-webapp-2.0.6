import { memo, useCallback, useContext, useState } from 'react'
import { BaseContext } from '@/context/base'
import { FloatingContext } from '@/context/floating'
import { CustomPortal } from '@/components/custom-portal'
import { BasePlayer } from '@/components/player/base'
import { EmbedPlayerHeaderOverlay } from '@/components/player/embed'
import { getIconLink } from '@/utils'
import { FullScreenModalContext } from '@/context/full-screen'
import { Shimmer } from '@/components/shimmer'

export const FloatingView = memo(() => {
  const {
    videos,
    activeIndex,
    muted,
    shouldPlay,
    rootFocusStatus,
    customizations,
    updateActiveIndex,
  } = useContext(BaseContext)
  const { isOpen, closeFloatingView } = useContext(FloatingContext)
  const { openFullScreenModal } = useContext(FullScreenModalContext)
  const [closedManually, setClosedManually] = useState(false)
  const currentVideo = videos[activeIndex === -1 ? 0 : activeIndex]
  const playerShouldPlay = shouldPlay === 'FLOAT' && rootFocusStatus.isFocused

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

  if (
    currentVideo &&
    isOpen &&
    !closedManually &&
    customizations?.is_floating_view
  )
    return (
      <CustomPortal
        hideScrollbar={false}
        style={{
          position: 'fixed',
          bottom: 8,
          right: 32,
          height: 300,
          width: 180,
          display: 'flex',
        }}>
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'clip',
            borderRadius: 8,
          }}>
          {!currentVideo ? (
            <Shimmer style={{ borderRadius: 8 }} />
          ) : (
            <BasePlayer
              id={getFloatingPlayerId(currentVideo.video.uuid)}
              src={
                currentVideo.video.media_url_m3u8
                  ? currentVideo.video.media_url_m3u8
                  : currentVideo.video.media_url
              }
              poster={currentVideo.video.thumbnail_url}
              shouldPlay={playerShouldPlay}
              style={{ borderRadius: 8, cursor: 'pointer' }}
              muted={muted}
              considerFocusStatus={false}
              loop={customizations?.is_loop_video}
              // triggerAnalytics
              onEnded={handleOnEnded}
              onClick={() => {
                openFullScreenModal(activeIndex, 'FLOAT')
              }}
            />
          )}
          <EmbedPlayerHeaderOverlay
            index={activeIndex}
            playerShouldPlay={playerShouldPlay}
            shouldPlayType='FLOAT'
            userShareUrl={currentVideo.owner.share_url}
            username={currentVideo.owner.username}
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
      </CustomPortal>
    )
})

function getFloatingPlayerId(id: string) {
  return '__gen__sdk__floating__player__' + id
}
