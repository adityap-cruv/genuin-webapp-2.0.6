import React, {
  useEffect,
  useState,
  useCallback,
  type ComponentProps,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react'
import { ShouldPlayType, useBaseContext } from '@/context/base'
import {
  checkAndAppendHttps,
  cn,
  getRedirectionStatusForPaths,
  getTimeAgo,
  isCheckFifthVideoType,
} from '@/utils'
import { FeedVideoType } from '@/type'
import { Linkouts } from '@/components/linkouts'
import { ReadMoreDynamic } from '@/components/read-more'
import { CommentProvider } from '@/context/comment'
import { CommentBox } from './comment-box'
import { CustomAvatar } from '@/components/custom-avatar'
import { CustomLink } from '@/router/custom-link'
import { useExpandViewContext } from '@/components/expand-view/context'
import useShowLinkouts from '@/hooks/useShowLinkouts'
import { CommunityPill } from '@/components/pills/community-pill'
import { GroupPill } from '@/components/pills/group-pill'
import { mapCommunityUserRole } from '@/components/tree-structure'

type MobileDetailsType = {
  videoData: FeedVideoType
  swiperRef?: React.MutableRefObject<any>
  index: number
  viewType: ShouldPlayType
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
  isCommentBoxOpen: boolean
  setCommentBox: Dispatch<SetStateAction<boolean>>
  isMobile?: boolean
} & ComponentProps<'div'>

export function MobileDetails({
  videoData,
  swiperRef,
  index,
  onClick,
  className,
  viewType,
  style,
  isCommentBoxOpen,
  setCommentBox,
  isMobile = false,
  // onSpark,
  onCommentCountChange,
  ...restProps
}: MobileDetailsType) {
  const {
    updateShouldPlay,
    customizations,
    baseSwiperRef,
    brandDetails,
    action,
    toggleAction,
    embedData,
  } = useBaseContext()
  const { isFullScreen } = useExpandViewContext()
  const { activeIndex } = useBaseContext()
  const { showLinkouts } = useShowLinkouts({
    isActive: activeIndex === index,
    linkoutId: videoData.video.linkouts_id,
  })
  // const [isCommentBoxOpen, setIsCommentBoxOpen] = React.useState(false)
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

  useEffect(() => {
    if (
      action &&
      action === 'comment' &&
      isMobile &&
      videoData.video.slug === embedData?.startVideoSlug
    ) {
      setCommentBox(true)
      toggleAction()
    }
  }, [action])

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
        )}
        {...restProps}>
        <div className='flex justify-between items-end relative h-fit w-full'>
          <div
            className={cn(
              'transition-all h-min flex flex-col justify-end w-full p-2',
              {
                'p-0 pb-4':
                  isCheckFifthVideoType(brandDetails?.brand_id) &&
                  customizations?.view === 'carousel',
              },
            )}>
            <div className='overflow-clip w-full pr-[50px]'>
              <div
                style={{
                  transform: videoData.video.linkouts
                    ? showLinkouts
                      ? 'translateY(0%)'
                      : 'translateY(calc(100% - 40px)'
                    : undefined,
                  transition: 'transform 0.5s ease-in',
                }}>
                {!(
                  isCheckFifthVideoType(brandDetails?.brand_id) &&
                  customizations?.view === 'carousel'
                ) && (
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
                )}
                {videoData.video.linkouts &&
                  customizations?.links.is_show_links && (
                    <div
                      className={cn('mb-2', {
                        'mb-3':
                          isCheckFifthVideoType(brandDetails?.brand_id) &&
                          customizations?.view === 'carousel',
                      })}
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
                className={cn('overflow-clip w-full pr-[50px]', {
                  '!text-[12px] !font-normal [&_span]:leading-[125%] leading-[125%] !tracking-[-0.042px] pl-4':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                })}
                position='overlay'
                text={videoData.video.description_data}
                maxLines={videoData.video.linkouts_id ? 1 : 2}
                shouldAnimate
                showViewMore={false}
                isExpanded={isDescriptionExpanded}
                setIsExpanded={setIsDescriptionExpanded}
              />
            )}
            <div
              className={cn(
                'flex relative w-full gap-1 __gen__sdk__hide__scrollbar overflow-auto pt-3',
                {
                  'pl-4':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel',
                },
              )}>
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }}
                className={cn({
                  'p-0':
                    isCheckFifthVideoType(brandDetails?.brand_id) &&
                    customizations?.view === 'carousel' &&
                    !isFullScreen,
                })}
              />
              {!(
                isCheckFifthVideoType(brandDetails?.brand_id) &&
                customizations?.view === 'carousel'
              ) && (
                <GroupPill
                  id={videoData.loop.uuid}
                  isSubscribed={videoData.loop.is_subscriber ?? false}
                  name={videoData.loop.group_name ?? ''}
                  shareUrl={videoData.loop.share_url ?? ''}
                  slug={videoData.loop.slug}
                  description={videoData.loop.group_description}
                  communityId={videoData.community.uuid}
                />
              )}
            </div>
          </div>
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
              setCommentBox(false)
              toggleAction()
            }}
            videoUrl={videoData.video.share_url}
            loopId={videoData.loop.uuid}
          />
        </CommentProvider>
      )}
    </>
  )
}
