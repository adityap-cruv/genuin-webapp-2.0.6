import {
  getTimeAgo,
  tryJsonParse,
  getRedirectionStatusForPaths,
  cn,
} from '@/utils'
import { Shimmer } from '../shimmer'
import { ReadMoreDynamic } from '../read-more'
import { CustomAvatar } from '../custom-avatar'
import { CustomLink } from '@/router/custom-link'
import BrandBadgeIcon from '../brand-badge-icon'
import { Reaction } from '../reaction'
import { CommentDetailsType } from './schema'
import { Content } from './content'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type CommentItemPropsType = {
  commentDetails: CommentDetailsType
  /**
   * Share url of video.
   */
  shareUrl: string
  onReactionChange: (commentId: string, isReacted: boolean) => void
}

export function CommentItem({
  commentDetails: { owner, ...commentDetails },
  shareUrl,
  onReactionChange,
}: CommentItemPropsType) {
  const redirectionStatus = getRedirectionStatusForPaths()
  const pathName = usePathNameWithSubdomain()

  return (
    <div className='flex py-2 px-0 gap-2'>
      <CustomAvatar
        className='h-6 w-6'
        isAvatar={owner.is_avatar}
        imageUrl={owner.profile_image_m ?? owner.profile_image}
        fallbackString={owner.name ?? ''}
      />
      <div className='w-full'>
        <div className='flex items-center gap-2'>
          <CustomLink
            href={
              owner.brand
                ? pathName.brand(owner.brand.brand_slug)
                : pathName.profile(owner.nickname)
            }
            target='_blank'
            className={cn(
              'text-body-1-bold',
              !redirectionStatus.profile && 'pointer-events-none',
            )}>
            @{owner.nickname}
          </CustomLink>
          {owner.brand && (
            <BrandBadgeIcon
              variant='dark'
              userLogoType={owner.brand?.brand_user_logo}
            />
          )}
          <p className='text-cap-1-med text-tertiary'>
            {getTimeAgo(commentDetails.created_at) + ' ago'}
          </p>
        </div>
        <div className='pt-0.5'>
          {commentDetails.type === 'TEXT' && commentDetails.comment_data && (
            <ReadMoreDynamic
              position='outside'
              text={
                tryJsonParse(commentDetails.comment_data) ??
                commentDetails.comment_text
              }
              maxLines={2}
              className='text-body-1-med font-medium'
            />
          )}
          {commentDetails.type === 'VIDEO' && commentDetails.url && (
            <Content.video
              id={commentDetails.comment_id}
              src={commentDetails.video_url_m3u8 ?? commentDetails.url}
              thumbnail={commentDetails.thumbnail ?? ''}
            />
          )}
          {commentDetails.type === 'AUDIO' && commentDetails.url && (
            <Content.audio
              commentId={commentDetails.comment_id}
              src={commentDetails.url}
            />
          )}
        </div>
        <Reaction
          className='flex-row pt-0.5 gap-1 w-fit [&_p]:!text-cap-1-med'
          iconHeight={16}
          iconWidth={16}
          contentId={commentDetails.comment_id}
          forComment
          isReacted={commentDetails.is_sparked}
          noOfReactions={commentDetails.no_of_sparks}
          shareUrl={shareUrl}
          onReactionStatusChange={onReactionChange}
        />
      </div>
    </div>
  )
}

export function CommentItemShimmer() {
  return (
    <div className='my-4'>
      <div className='flex items-center gap-x-2'>
        <Shimmer className='h-7 w-7 rounded-full' />
        <Shimmer className='h-4 w-1/3 rounded-full' />
      </div>
      <Shimmer className='my-2 h-4 w-full' />
      <Shimmer className='h-4 w-full' />
    </div>
  )
}
