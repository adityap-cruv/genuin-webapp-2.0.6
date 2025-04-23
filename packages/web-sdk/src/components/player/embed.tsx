import React, {
  type ComponentProps,
  memo,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import {
  cn,
  formatNumber,
  getIconLink,
  getRedirectionStatusForPaths,
} from '@/utils'
import { BasePlayer } from '@/components/player/base'
import { Linkouts } from '@/components/linkouts'
import { ShouldPlayType, useBaseContext } from '@/context/base'
import { FeedVideoType } from '@/type'
import useDebounce from '@/hooks/useDebounce'
import { useFullScreenModalContext } from '@/context/full-screen'
import { Analytics } from '@/analytics'
import { MuteIcon } from '../icons/mute-icon'
import { UnmuteIcon } from '../icons/unmute-icon'
import { PlayIcon } from '../icons/play-icon'
import { PauseIcon } from '../icons/pause-icon'
import { ExpandIcon } from '../icons/expand-icon'
import { SparkIcon } from '../icons/spark-icon'
import { CommentIcon } from '../icons/comment-icon'
import { ShareIcon } from '../icons/share-icon'

type VideoProps = Omit<
  ComponentProps<'video'>,
  'src' | 'poster' | 'muted' | 'loop'
>

type PlayerProps = VideoProps & {
  index: number
  id: string
  videoData: FeedVideoType
  onHover: (index: number) => void
}

export const EmbedPlayer = memo(function Player({
  id,
  index,
  videoData,
  onHover,
  ...restProps
}: PlayerProps) {
  const { activeIndex, muted, shouldPlay, customizations } = useBaseContext()
  const { openFullScreenModal } = useFullScreenModalContext()
  const [mouseIn, setMouseIn] = React.useState(false)
  const showDataOutside =
    customizations?.is_show_social_interaction_data ||
    customizations?.links.is_show_links
  const playerShouldPlay = shouldPlay === 'EMBED' && index === activeIndex
  const isOpacityDown = useMemo(
    () =>
      customizations?.view === 'carousel' &&
      customizations?.carousel_style &&
      customizations?.carousel_style === 'focus' &&
      index !== activeIndex,
    [customizations, activeIndex],
  )
  const shouldOpenPopupView = customizations?.is_popup_view

  const showEngagementOptions = useMemo(() => {
    if (
      customizations?.view === 'feed' &&
      customizations.element.offsetWidth < 232
    ) {
      return false
    }
    if (
      customizations?.view === 'carousel' &&
      customizations.element.offsetHeight < 350
    ) {
      return false
    }
    return true
  }, [customizations])

  useEffect(() => {
    const element = document.getElementById(id)
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Analytics.track(Analytics.EventNames.VideoInview, {
              video_id: videoData.uuid,
              community_id: videoData.community.uuid,
              chat_id: videoData.loop.uuid,
            })
          }
        })
      },
      {
        threshold: 0.5,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [id, videoData])

  const [debouncedFunc, cancelDebounce] = useDebounce((index) => {
    onHover(index)
  }, 700)

  const handleOnClickOnVideo = useCallback(() => {
    if (showEngagementOptions) {
      if (videoData.video.clickable_url) {
        window.open(videoData.video.clickable_url, '_blank')
      } else {
        openFullScreenModal(index, 'EMBED')
      }
    } else {
      openFullScreenModal(index, 'EMBED')
    }
  }, [showEngagementOptions])

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col rounded-lg overflow-clip',
        { 'cursor-pointer': shouldOpenPopupView },
      )}
      style={{
        border: `${showDataOutside ? '1px solid var(--tertiary-300)' : 'none'}`,
        opacity: isOpacityDown ? '40%' : undefined,
      }}
      onClick={handleOnClickOnVideo}
      onMouseEnter={() => {
        debouncedFunc(index)
        setMouseIn(true)
      }}
      onMouseLeave={() => {
        cancelDebounce()
        setMouseIn(false)
      }}>
      <div
        className='relative h-full w-full overflow-clip rounded-lg'
        style={{
          borderBottomLeftRadius: showDataOutside ? 0 : 8,
          borderBottomRightRadius: showDataOutside ? 0 : 8,
        }}>
        <BasePlayer
          id={id}
          shouldPlay={playerShouldPlay}
          muted={muted}
          src={
            videoData.video.media_url_m3u8
              ? videoData.video.media_url_m3u8
              : videoData.video.media_url
          }
          poster={videoData.video.thumbnail_url}
          loop={mouseIn || customizations?.is_loop_video}
          index={index}
          triggerAnalytics
          {...restProps}
        />
        {showEngagementOptions &&
          (activeIndex === index ? (
            <>
              <EmbedPlayerHeaderOverlay
                index={index}
                playerShouldPlay={playerShouldPlay}
                shouldPlayType={'EMBED'}
                userShareUrl={videoData.owner.share_url}
                username={videoData.owner.username}
                shouldShowPopupButton={shouldOpenPopupView}
              />
              {customizations?.links.is_show_links &&
                customizations.links.position === 'overlay' &&
                videoData.video.linkouts && (
                  <div
                    className='absolute bottom-0 left-0 p-2 w-full'
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}>
                    <Linkouts
                      linkoutId={videoData.video.linkouts_id}
                      videoId={videoData.uuid}
                      linkouts={videoData.video.linkouts}
                      position='overlay'
                      imageSize={48}
                    />
                  </div>
                )}
            </>
          ) : (
            customizations?.is_show_view_count && (
              <div className='absolute bottom-2 left-2 flex items-center gap-2'>
                <img
                  alt='play'
                  src={getIconLink('playIcon')}
                  style={{ height: 20, width: 20 }}
                />
                <p className='__gen__sdk__font__weight__demi __gen__sdk__text__body__2 text-white'>
                  {formatNumber(videoData.video.no_of_views)}
                </p>
              </div>
            )
          ))}
      </div>
      {showDataOutside && showEngagementOptions && (
        <div
          className='py-0 px-2 bg-background'
          style={{
            width: 'initial',
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          {customizations.links.is_show_links &&
            customizations.links.position === 'outside' &&
            videoData.video.linkouts && (
              <Linkouts
                linkoutId={videoData.video.linkouts_id}
                videoId={videoData.uuid}
                linkouts={videoData.video.linkouts}
                position='outside'
              />
            )}
          {customizations.is_show_social_interaction_data && (
            <div className='flex justify-around items-center py-4 px-0'>
              <Stat
                icon={<SparkIcon className='h-4 w-4 fill-foreground' />}
                value={formatNumber(videoData.video.no_of_sparks)}
              />
              <Stat
                icon={
                  <CommentIcon className='h-4 w-4 fill-foreground stroke-foreground stroke-[3px]' />
                }
                value={formatNumber(videoData.video.no_of_comments)}
              />
              <Stat
                icon={<ShareIcon className='h-4 w-4 stroke-foreground' />}
                value={formatNumber(videoData.video.no_of_shares)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
})

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className='flex gap-1 items-center'>
      {icon}
      <p className=' __gen__sdk__font__weight__medium __gen__sdk__text__caption'>
        {value}
      </p>
    </div>
  )
}

type EmbedPlayerHeaderOverlayProps = {
  username: string
  userShareUrl: string
  playerShouldPlay: boolean
  index: number
  shouldPlayType: ShouldPlayType
  shouldShowPopupButton?: boolean
}

export const EmbedPlayerHeaderOverlay = memo(function EmbedPlayerHeaderOverlay({
  username,
  userShareUrl,
  index,
  playerShouldPlay,
  shouldPlayType,
  shouldShowPopupButton = true,
}: EmbedPlayerHeaderOverlayProps) {
  const {
    customizations,
    updateMuted,
    muted,
    updateShouldPlay,
    shouldPlay: stateShouldPlay,
  } = useBaseContext()
  const { openFullScreenModal } = useFullScreenModalContext()
  const redirectionStatus = getRedirectionStatusForPaths()

  return (
    <>
      <div
        className='absolute top-0 left-0 z-10 w-full flex justify-between items-center p-2'
        style={{
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
        }}
        onClick={(e) => {
          e.stopPropagation()
        }}>
        {customizations?.is_show_username ? (
          <a
            target='_blank'
            href={userShareUrl}
            className={cn(
              '__gen__sdk__text__body__2 font-medium w-1/2 text-white line-clamp-1',
              redirectionStatus.profile && 'pointer-events-none',
            )}>
            @{username}
          </a>
        ) : (
          <span></span>
        )}
        <div className='flex gap-2'>
          <span
            onClick={() => {
              updateMuted(!muted)
            }}
            className='flex h-8 w-8 flex-shrink-0 items-center z-30 justify-center rounded-full bg-black/40'>
            {muted ? (
              <MuteIcon
                variant='light'
                className='h-4 w-4'
              />
            ) : (
              <UnmuteIcon
                variant='light'
                className='h-4 w-4'
              />
            )}
          </span>

          <span
            onClick={
              stateShouldPlay !== 'NONE'
                ? () => {
                    updateShouldPlay('NONE')
                  }
                : () => {
                    updateShouldPlay(shouldPlayType)
                  }
            }
            className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/40'>
            {!playerShouldPlay ? (
              <PlayIcon
                variant='light'
                className='h-4 w-4'
              />
            ) : (
              <PauseIcon
                variant='light'
                className='h-4 w-4'
              />
            )}
          </span>

          {shouldShowPopupButton && (
            <div
              onClick={() => {
                openFullScreenModal(index, shouldPlayType)
              }}
              className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/40'>
              <ExpandIcon
                variant='light'
                className='h-4 w-4'
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
})
