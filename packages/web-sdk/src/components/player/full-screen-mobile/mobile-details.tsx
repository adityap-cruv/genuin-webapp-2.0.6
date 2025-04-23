import React, {
  useEffect,
  useState,
  useCallback,
  type ComponentProps,
} from 'react'
import { ShouldPlayType, useBaseContext } from '@/context/base'
import {
  checkAndAppendHttps,
  cn,
  getRedirectionStatusForPaths,
  getTimeAgo,
} from '@/utils'
import { FeedVideoType } from '@/type'
import { Actions } from '@/components/actions'
import { Linkouts } from '@/components/linkouts'
import { ReadMoreDynamic } from '@/components/read-more'
import { CommentProvider } from '@/context/comment'
import { CommentBox } from './comment-box'
import { CustomAvatar } from '@/components/custom-avatar'
import { GroupIcon } from '@/components/icons/group-icon'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { useExpandViewContext } from '@/context/expand-view'
import useShowLinkouts from '@/hooks/useShowLinkouts'

type MobileDetailsType = {
  videoData: FeedVideoType
  swiperRef?: React.MutableRefObject<any>
  index: number
  viewType: ShouldPlayType
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
} & ComponentProps<'div'>

export function MobileDetails({
  videoData,
  swiperRef,
  index,
  onClick,
  className,
  viewType,
  style,
  onSpark,
  onCommentCountChange,
  ...restProps
}: MobileDetailsType) {
  const { updateShouldPlay, customizations, baseSwiperRef } = useBaseContext()
  const { isFullScreen } = useExpandViewContext()
  const { activeIndex } = useBaseContext()
  const { showLinkouts } = useShowLinkouts({
    isActive: activeIndex === index,
    linkoutId: videoData.video.linkouts_id,
  })
  const [isCommentBoxOpen, setIsCommentBoxOpen] = React.useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const redirectionStatus = getRedirectionStatusForPaths()

  useEffect(() => {
    const swiper = swiperRef?.current ?? baseSwiperRef.current.swiper
    if (!swiper || swiper.destroyed) return
    if (isCommentBoxOpen) {
      updateShouldPlay('COMMENT')
      swiper?.disable()
    } else {
      updateShouldPlay(viewType)
      swiper?.enable()
    }
  }, [isCommentBoxOpen])

  const handleClick = useCallback(
    (e: any) => {
      if (isDescriptionExpanded) {
        setIsDescriptionExpanded(false)
        e.stopPropagation()
      } else {
        onClick?.(e)
      }
    },
    [isDescriptionExpanded, onClick],
  )

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          backgroundColor: isDescriptionExpanded
            ? 'rgba(0, 0, 0, 0.40)'
            : 'transparent',
          ...style,
        }}
        className={cn(
          'absolute inset-0 transition-colors flex h-full flex-col justify-end w-full',
          className,
          { 'pointer-events-none': isFullScreen },
        )}
        {...restProps}>
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(17, 17, 17, 0.00) 0%, rgba(17, 17, 17, 0.70) 100%)',
            pointerEvents: 'auto',
          }}
          className='flex justify-between items-end relative h-fit w-full'>
          <div
            className='transition-all h-min flex flex-col justify-end w-full p-2'
            style={{
              maxWidth: isFullScreen ? '100%' : 'calc(80% - 16px)',
            }}>
            <div className='overflow-clip'>
              <div
                style={{
                  transform: videoData.video.linkouts
                    ? showLinkouts
                      ? 'translateY(0%)'
                      : 'translateY(calc(100% - 40px)'
                    : undefined,
                  transition: 'transform 0.5s ease-in',
                }}>
                <div
                  className={cn(
                    'flex gap-2 items-center',
                    videoData.video.linkouts_id &&
                      customizations?.links.is_show_links &&
                      'pb-2',
                  )}>
                  <CustomAvatar
                    fallbackString={videoData.owner.username}
                    isAvatar={videoData.owner.is_avatar}
                    imageUrl={
                      videoData.owner.profile_image_m ??
                      videoData.owner.profile_image
                    }
                    className='h-9 w-9'
                  />
                  <CustomLink
                    className={cn(
                      '__gen__sdk__text__title__2 font-bold text-white line-clamp-1 break-all',
                      !redirectionStatus.profile ? 'pointer-events-none' : '',
                    )}
                    href={checkAndAppendHttps(videoData.owner.share_url)}
                    target='_blank'>
                    @{videoData.owner.username}
                  </CustomLink>
                  <p className='__gen__sdk__text__body__2 font-medium text-white whitespace-nowrap'>
                    {getTimeAgo(videoData.video.conversation_at) + ' ago'}
                  </p>
                </div>
                {videoData.video.linkouts &&
                  customizations?.links.is_show_links && (
                    <div
                      className='mb-2'
                      style={{
                        opacity: showLinkouts ? 1 : 0,
                        transition: showLinkouts
                          ? 'opacity 0.5s ease-in'
                          : 'opacity 0s',
                      }}>
                      <Linkouts
                        linkoutId={videoData.video.linkouts_id}
                        linkouts={videoData.video.linkouts}
                        position='overlay'
                        imageSize={60}
                        videoId={videoData.uuid}
                        forMobile
                      />
                    </div>
                  )}
              </div>
            </div>
            {videoData.video.description_data && (
              <ReadMoreDynamic
                className='overflow-clip'
                position='overlay'
                text={videoData.video.description_data}
                maxLines={videoData.video.linkouts_id ? 1 : 2}
                shouldAnimate
                showViewMore={false}
                isExpanded={isDescriptionExpanded}
                setIsExpanded={setIsDescriptionExpanded}
              />
            )}
            <Badges
              communityImage={
                videoData.community.dp_s ?? videoData.community.dp
              }
              communityName={videoData.community.name}
              communitySlug={videoData.community.slug}
              loopName={videoData.loop.group_name}
              loopSlug={videoData.loop.slug}
            />
          </div>
          {customizations?.is_enable_engagement_tools && !isFullScreen && (
            <Actions
              videoId={videoData.uuid}
              noOfSparks={videoData.video.no_of_sparks}
              shareUrl={videoData.video.share_url}
              isSparked={videoData.video.is_sparked}
              noOfComments={videoData.video.no_of_comments}
              onCommentClick={() => {
                setIsCommentBoxOpen(true)
              }}
              showComment
              forMobile
              className='pr-4 pb-2'
              onSpark={onSpark}
            />
          )}
        </div>
      </div>
      {isCommentBoxOpen && (
        <CommentProvider onCommentCountChange={onCommentCountChange}>
          <CommentBox
            shareUrl={videoData.video.share_url}
            videoId={videoData.uuid}
            videoSlug={videoData.video.slug}
            communityId={videoData.community.uuid}
            noOfComments={videoData.video.no_of_comments}
            close={() => {
              setIsCommentBoxOpen(false)
            }}
            videoUrl={videoData.video.share_url}
            loopId={videoData.loop.uuid}
          />
        </CommentProvider>
      )}
    </>
  )
}

type BadgesType = {
  communitySlug: string
  communityImage: string
  communityName: string
  loopSlug: string
  loopName: string
} & ComponentProps<'div'>

function Badges({
  communityImage,
  communityName,
  communitySlug,
  loopName,
  loopSlug,
  className,
  ...restProps
}: BadgesType) {
  const redirectionStatus = getRedirectionStatusForPaths()
  const pathName = usePathNameWithSubdomain()

  return (
    <div
      className={cn(
        'flex relative w-full gap-1 __gen__sdk__hide__scrollbar overflow-auto pt-3',
        className,
      )}
      {...restProps}>
      <CustomLink
        target='_blank'
        href={pathName.community(communitySlug)}
        className={cn(
          'flex items-center gap-1 rounded-full bg-black/40 p-1 pr-2',
          !redirectionStatus.community && 'pointer-events-none',
        )}>
        <CustomAvatar
          className='h-6 w-6'
          imageUrl={communityImage ?? ''}
          fallbackString='U'
          isAvatar={false}
        />
        <p className='whitespace-nowrap break-all text-cap-1-med leading-5 text-white'>
          {communityName.length > 24
            ? communityName.slice(0, 24) + '...'
            : communityName}
        </p>
      </CustomLink>
      <CustomLink
        target='_blank'
        href={pathName.loop(loopSlug)}
        className={cn(
          'flex items-center gap-1 rounded-full bg-black/40 p-1 pr-2',
          !redirectionStatus.loop && 'pointer-events-none',
        )}>
        <div className='rounded-full bg-background/20 p-1'>
          <GroupIcon className='h-4 w-4' />
        </div>
        <p className='line-clamp-1 whitespace-nowrap text-cap-1-med leading-5 text-white'>
          {loopName}
        </p>
      </CustomLink>
    </div>
  )
}
