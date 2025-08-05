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
  resolveVideoUrl,
  isCheckFifthVideoType,
  modReactionUrlForTheme,
} from '@/utils'
import { BasePlayer } from '@/components/player/base'
import { Linkouts } from '@/components/linkouts'
import { ShouldPlayType, useBaseContext } from '@/context/base'
import { FeedVideoType } from '@/type'
import useDebounce from '@/hooks/useDebounce'
import { Analytics } from '@/analytics'
import { MuteIcon } from '../icons/mute-icon'
import { UnmuteIcon } from '../icons/unmute-icon'
import { PlayIcon } from '../icons/play-icon'
import { PauseIcon } from '../icons/pause-icon'
import { ExpandIcon } from '../icons/expand-icon'
import { CommentIcon } from '../icons/comment-icon'
import { ShareIcon } from '../icons/share-icon'
import { PlayerProvider } from './context'
import { useBrandDetails } from '@/context/brand-details'
import { useExpandViewContext } from '../expand-view/context'
import { ReadMoreDynamic } from '../read-more'
import { CommunityPill } from '../pills/community-pill'
import { mapCommunityUserRole } from '@/components/tree-structure'

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
  const { brandDetails } = useBrandDetails()
  const { toggleFullScreen } = useExpandViewContext()
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
      { threshold: 0.5 },
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
    if (showEngagementOptions && videoData.video.clickable_url) {
      window.open(videoData.video.clickable_url, '_blank')
    } else {
      toggleFullScreen(videoData.uuid, index, videoData.video.share_url)
    }
  }, [showEngagementOptions, toggleFullScreen])

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col rounded-lg overflow-clip',
        { 'cursor-pointer': shouldOpenPopupView },
      )}
      style={{
        border:
          isCheckFifthVideoType(brandDetails.brand_id) &&
          customizations?.view === 'carousel'
            ? 'none'
            : `${showDataOutside ? '1px solid var(--tertiary-300)' : 'none'}`,
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
        <PlayerProvider>
          <BasePlayer
            id={id}
            shouldPlay={playerShouldPlay}
            muted={muted}
            src={resolveVideoUrl(
              brandDetails.brand_id,
              videoData.video.media_url_m3u8,
              videoData.video.media_url,
            )}
            poster={videoData.video.thumbnail_url}
            loop={mouseIn || customizations?.is_loop_video}
            index={index}
            triggerAnalytics
            {...restProps}
          />
          {isCheckFifthVideoType(brandDetails.brand_id) &&
            customizations?.view === 'carousel' && (
              <div className='z-10 bottom-0 pb-4 absolute px-3 flex flex-col gap-2 bg-[linear-gradient(180deg,_rgba(0,0,0,0)_0%,_#000_100%)] w-full'>
                {videoData.video.description_data && (
                  <ReadMoreDynamic
                    className='w-full overflow-clip text-white text-[12px] not-italic font-normal [&_span]:leading-[125%] leading-[125%] tracking-[-0.042px]'
                    position='overlay'
                    text={videoData.video.description_data}
                    maxLines={videoData.video.linkouts_id ? 1 : 3}
                    shouldAnimate
                    showViewMore={false}
                  />
                )}
                <CommunityPill
                  handle={videoData.community.handle}
                  id={videoData.community.uuid}
                  name={videoData.community.name ?? ''}
                  shareUrl={videoData.community.share_url}
                  slug={videoData.community.slug}
                  userRole={mapCommunityUserRole(
                    videoData.community.logged_in_user_role,
                    videoData.community.is_join_requested,
                  )}
                  profileImage={videoData.community.dp ?? ''}
                  type={videoData.community.type}
                  className='p-0 bg-transparent pointer-events-none'
                  showJoinButton={false}
                />
              </div>
            )}
        </PlayerProvider>
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
                videoShareUrl={videoData.video.share_url}
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
          style={{ width: 'initial' }}
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
              <div className='flex gap-1 items-center'>
                <img
                  src={modReactionUrlForTheme(
                    brandDetails.reactions.keys.comment_unselected.svg,
                    customizations?.theme,
                  )}
                  className='h-4 w-4'
                />
                <p className=' __gen__sdk__font__weight__medium __gen__sdk__text__caption'>
                  {formatNumber(videoData.video.no_of_sparks)}
                </p>
              </div>
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
  videoShareUrl: string
}

export const EmbedPlayerHeaderOverlay = memo(function EmbedPlayerHeaderOverlay({
  username,
  userShareUrl,
  index,
  playerShouldPlay,
  shouldPlayType,
  shouldShowPopupButton = true,
  videoShareUrl,
}: EmbedPlayerHeaderOverlayProps) {
  const {
    customizations,
    updateMuted,
    muted,
    updateShouldPlay,
    shouldPlay: stateShouldPlay,
    brandDetails,
  } = useBaseContext()
  const { toggleFullScreen } = useExpandViewContext()
  const redirectionStatus = getRedirectionStatusForPaths()

  return (
    <>
      <div
        className={cn(
          'absolute top-0 left-0 z-10 w-full flex justify-between items-center p-2',
          {
            'px-3':
              isCheckFifthVideoType(brandDetails?.brand_id) &&
              customizations?.view === 'carousel',
          },
        )}
        style={{
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
        }}
        onClick={(e) => {
          e.stopPropagation()
        }}>
        {customizations?.is_show_username &&
        shouldPlayType !== 'FLOAT' &&
        !(
          isCheckFifthVideoType(brandDetails?.brand_id) &&
          customizations.view === 'carousel'
        ) ? (
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
        <div
          className={cn('flex gap-2', {
            'gap-3':
              isCheckFifthVideoType(brandDetails?.brand_id) &&
              customizations?.view === 'carousel',
          })}>
          <span
            onClick={() => {
              updateMuted(!muted)
            }}
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center z-30 justify-center rounded-full bg-black/40',
              {
                'h-6 w-6':
                  isCheckFifthVideoType(brandDetails?.brand_id) &&
                  customizations?.view === 'carousel',
              },
            )}>
            {muted ? (
              <MuteIcon
                variant='light'
                className={cn('h-4 w-4', {
                  'h-3 w-3':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
              />
            ) : (
              <UnmuteIcon
                variant='light'
                className={cn('h-4 w-4', {
                  'h-3 w-3':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
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
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/40',
              {
                'w-6 h-6':
                  isCheckFifthVideoType(brandDetails?.brand_id) &&
                  customizations?.view === 'carousel',
              },
            )}>
            {!playerShouldPlay ? (
              <PlayIcon
                variant='light'
                className={cn('h-4 w-4', {
                  'h-3 w-3':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
              />
            ) : (
              <PauseIcon
                variant='light'
                className={cn('h-4 w-4', {
                  'h-3 w-3':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
              />
            )}
          </span>

          {shouldShowPopupButton && (
            <div
              onClick={() => {
                toggleFullScreen(undefined, index, videoShareUrl)
              }}
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black/40',
                {
                  'w-6 h-6':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                },
              )}>
              <ExpandIcon
                variant='light'
                className={cn('h-4 w-4', {
                  'h-3 w-3':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
})
