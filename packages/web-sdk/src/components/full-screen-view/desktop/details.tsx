import { useCallback, type ComponentProps } from 'react'
import { useFullScreenModalContext } from '@/context/full-screen'
import {
  checkAndAppendHttps,
  cn,
  getIconLink,
  getRedirectionStatusForPaths,
  getTimeAgo,
} from '@/utils'
import { DecorativeList } from '../../decorative-list'
import { Linkouts } from '../../linkouts'
import type { CommunityJoinStatusType, FeedVideoType } from '@/type'
import { ReadMoreDynamic } from '../../read-more'
import { CommentProvider } from '@/context/comment'
import { type ShouldPlayType, useBaseContext } from '@/context/base'
import { CustomAvatar } from '@/components/custom-avatar'
import { ShareIcon } from '@/components/icons/share-icon'
import { useAdaptiveShare } from '@/hooks/useAdaptiveShare'
import { useToast } from '@/components/ui/use-toast'
import { CustomLink } from '@/router/custom-link'
import BrandBadgeIcon from '@/components/brand-badge-icon'
import { JoinButton } from '@/components/join-button'
import {
  CommunityUserRole,
  mapCommunityUserRole,
} from '@/components/tree-structure'
import { AuthenticationModal } from '@/components/authentication'
import { useBrandDetails } from '@/context/brand-details'
import CommentsLayout from '@/components/comments/comments-layout'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type DetailsPropsType = {
  videoDetails: FeedVideoType
  showCloseButton?: boolean
  renderedIn: ShouldPlayType
  closeModal?: () => void
  onCommunityRoleChanged?: (
    communityId: string,
    newState: CommunityUserRole,
  ) => void
  onCommentCountChange?: (videoId: string, count: number) => void
} & ComponentProps<'div'>

// TODO: separate this component.
export function FullScreenDesktopDetailsView({
  videoDetails,
  showCloseButton = true,
  className,
  renderedIn,
  closeModal,
  onCommunityRoleChanged,
  onCommentCountChange,
  ...restProps
}: DetailsPropsType) {
  const { closeFullScreenModal } = useFullScreenModalContext()
  const { customizations, updateCommunityJoinState } = useBaseContext()
  const redirectionStatus = getRedirectionStatusForPaths()
  const { toast } = useToast()
  const { shareFn } = useAdaptiveShare()
  const { embedStyle } = useBrandDetails()
  const pathName = usePathNameWithSubdomain()

  const fallbackFuncForJoinButton = useCallback(() => {
    if (embedStyle !== 'standard_wall') {
      window.open(pathName.community(videoDetails.community.slug), '_blank')
      return
    }
    AuthenticationModal.open()
  }, [])

  // TODO: Remove this show_comments_section condition after removing it from customizations.
  const showCommentSection =
    customizations?.show_comments_section === undefined
      ? customizations?.enable_engagement_tools?.comment
      : customizations.show_comments_section ||
        customizations.enable_engagement_tools?.comment

  return (
    <div
      className={cn('relative h-full overflow-clip bg-background', className)}
      {...restProps}>
      {showCloseButton && (
        <img
          className='absolute top-4 right-4 cursor-pointer'
          src={getIconLink('icCloseGray')}
          height={24}
          width={24}
          onClick={closeModal ?? closeFullScreenModal}
        />
      )}
      <div className='p-4 pb-1'>
        <div className='flex gap-2 items-center'>
          <CustomLink
            target='_blank'
            href={
              videoDetails.owner.brand
                ? pathName.brand(videoDetails.owner.brand.brand_slug)
                : pathName.profile(videoDetails.owner.username)
            }
            className={!redirectionStatus.profile ? 'pointer-events-none' : ''}>
            <CustomAvatar
              fallbackString={videoDetails.owner.name}
              isAvatar={videoDetails.owner.is_avatar}
              imageUrl={
                videoDetails.owner.profile_image_m ??
                videoDetails.owner.profile_image
              }
              className='shrink-0 h-9 w-9 rounded-full'
            />
          </CustomLink>
          <CustomLink
            href={
              videoDetails.owner.brand
                ? pathName.brand(videoDetails.owner.brand.brand_slug)
                : pathName.profile(videoDetails.owner.username)
            }
            target='_blank'
            className={cn(
              'flex items-center gap-x-2',
              !redirectionStatus.profile ? 'pointer-events-none' : '',
            )}>
            <p className='text-title-3-demi line-clamp-1'>
              @{videoDetails.owner.username}
            </p>
            {videoDetails.owner.brand && (
              <BrandBadgeIcon
                userLogoType={videoDetails.owner.brand.brand_user_logo}
                variant='dark'
              />
            )}
          </CustomLink>
          <p className='__gen__sdk__text__caption text-tertiary'>
            {getTimeAgo(videoDetails.video.conversation_at) + ' ago'}
          </p>
        </div>
      </div>
      {/* Have to include CommentInputBox and Comments into same provider that's why CommentProvider is here. */}
      <CommentProvider
        renderedIn={renderedIn}
        onCommentCountChange={onCommentCountChange}>
        <div className='__gen__sdk__hide__scrollbar h-full pb-14 overflow-auto'>
          <div className='p-4 pt-0 border-b border-tertiary-200 border-solid'>
            <ReadMoreDynamic
              position='outside'
              text={
                videoDetails.video.description_data ??
                videoDetails.video.description_text
              }
              maxLines={2}
              className='text-body-1-med mt-2'
            />
          </div>
          <div className='p-4'>
            <p className='__gen__sdk__font__title_3 font-bold'>Posted In</p>
            <div className='mt-4'>
              <div className='flex justify-between'>
                <CustomLink
                  target='_blank'
                  href={checkAndAppendHttps(videoDetails.community.share_url)}
                  className={cn(
                    'flex gap-2 items-center',
                    !redirectionStatus.community ? 'pointer-events-none' : '',
                  )}>
                  <CustomAvatar
                    isAvatar={false}
                    imageUrl={
                      videoDetails.community.dp_s ?? videoDetails.community.dp
                    }
                    fallbackString={videoDetails.community.name}
                    className='w-9 h-9'
                  />
                  <div>
                    <p
                      title={videoDetails.community.name}
                      className='text-title-3-bold line-clamp-2 break-words'>
                      {videoDetails.community.name}
                    </p>
                    {videoDetails.community.brand && (
                      <p
                        className='line-clamp-1 max-w-[30ch] break-words text-body-1-demi text-tertiary-400'
                        title={videoDetails.community.brand.name}>
                        on {videoDetails.community.brand?.name}
                      </p>
                    )}
                  </div>
                </CustomLink>
                <div className='flex items-center gap-2'>
                  {customizations?.show_join_community_button && (
                    <JoinButton
                      communitySlug={videoDetails.community.slug}
                      communityId={videoDetails.community.uuid}
                      isPrivate={videoDetails.community.type === 2}
                      role={mapCommunityUserRole(
                        videoDetails.community.logged_in_user_role,
                        videoDetails.community.is_join_requested,
                      )}
                      onCommunityRoleChanged={(newRole) => {
                        onCommunityRoleChanged?.(
                          videoDetails.community.uuid,
                          newRole,
                        )
                        // TODO: Join community button with old approach remove this when all the apis functions are moved to react-query.
                        if (!onCommunityRoleChanged) {
                          updateCommunityJoinState(
                            videoDetails.community.uuid,
                            mapCommunityUserRoleToJoinStatus(newRole),
                          )
                        }
                      }}
                      fallbackFunc={fallbackFuncForJoinButton}
                    />
                  )}
                  {(customizations?.show_share_icon ||
                    customizations?.show_community_share_button) && (
                    <div
                      className='p-[3px] border border-primary rounded-md'
                      onClick={() => {
                        shareFn({
                          shareLink: videoDetails.community.share_url,
                          toast: () => {
                            toast({
                              description: 'Link Copied!',
                              duration: 1000,
                            })
                          },
                        })
                      }}>
                      <ShareIcon className='h-6 w-6 stroke-primary' />
                    </div>
                  )}
                </div>
              </div>
              <DecorativeList className='pt-4'>
                <li className='bg-tertiary-200 rounded-xl relative'>
                  <CustomLink
                    href={pathName.loop(videoDetails.loop.slug)}
                    target='_blank'
                    className={cn(
                      '!p-4 flex justify-between',
                      !redirectionStatus.loop && 'pointer-events-none',
                    )}>
                    <p className='__gen__sdk__text__body__2 font-semibold line-clamp-1'>
                      {videoDetails.loop.group_name}
                    </p>
                    {customizations?.show_view_loop_button && (
                      <p className='__gen__sdk__text__caption text-primary whitespace-nowrap'>
                        View Group
                      </p>
                    )}
                  </CustomLink>
                </li>
              </DecorativeList>
            </div>
          </div>
          {customizations?.links.is_show_links &&
            videoDetails.video.linkouts && (
              <div className='border-t border-tertiary-200 border-solid p-4'>
                <p className='__gen__sdk__text__body__2 font-bold pb-4'>
                  Links
                </p>
                <Linkouts
                  linkoutId={videoDetails.video.linkouts_id}
                  linkouts={videoDetails.video.linkouts}
                  position='outside'
                  videoId={videoDetails.uuid}
                />
              </div>
            )}
          {showCommentSection && <CommentsLayout videoDetails={videoDetails} />}
        </div>
      </CommentProvider>
    </div>
  )
}

// TODO: this function is used here only, scrap this when all the standard-wall components are moved to new approach.
export const mapCommunityUserRoleToJoinStatus = (
  role: CommunityUserRole,
): CommunityJoinStatusType => {
  switch (role) {
    case CommunityUserRole.LEADER:
      return 'leader'
    case CommunityUserRole.MEMBER:
      return 'joined'
    case CommunityUserRole.REQUESTED:
      return 'requested'
    case CommunityUserRole.MODERATOR:
      return 'joined' // Assuming moderators are also considered as joined members
    case CommunityUserRole.UNJOINED:
    default:
      return 'unjoined'
  }
}
