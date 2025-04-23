import { type ComponentProps } from 'react'
import type { LoopDetailsType } from './schema'
import { cn } from '@/utils'
import { ReadMoreDynamic } from '@/components/read-more'
import { LoopPrivacyInfo } from '@/components/loop-privacy-info'
import { PrivateGroup } from './private'
import { Posts } from './posts'
import { Members } from './members'
import { useSizeContext } from '@/context/size'
import { LoopTabs } from './tabs'
import { LoopOwnerDetails } from './owner-details'
import { CTAButtons } from './cta-buttons'

type DetailsPropsType = {
  loopDetails: LoopDetailsType
  /**
   * Id of element based on which top bar will be shown.
   */
  detailsId: string
} & ComponentProps<'section'>

export function Details({
  loopDetails,
  detailsId,
  className,
  ...restProps
}: DetailsPropsType) {
  const { isMobile } = useSizeContext()
  const isLoopPrivate = !loopDetails.is_view_allowed
  return (
    <section
      className={cn(
        'h-full w-full overflow-auto pl-6 px-4 pb-20 md:pb-0 md:px-6',
        className,
      )}
      {...restProps}>
      <div id={detailsId}>
        <div className='mt-6 flex justify-between'>
          <p className='text-title-1-bold text-secondary'>
            {loopDetails.group.group_name}
          </p>
          {!isMobile && (
            <CTAButtons
              isPrivate={isLoopPrivate}
              isSubscriber={loopDetails.is_subscriber ?? false}
              loopId={loopDetails.chat_id}
              shareUrl={loopDetails.share_url}
              name={loopDetails.group.group_name}
              slug={loopDetails.slug}
            />
          )}
        </div>
        <LoopPrivacyInfo
          actionId={loopDetails?.actions?.[0]?.action_id ?? 0}
          accessTypeId={loopDetails?.actions?.[0]?.access_type_id ?? 0}
        />
        <div className='w-full md:w-1/2'>
          <ReadMoreDynamic
            position='outside'
            text={loopDetails.group.group_description ?? ''}
            maxLines={2}
            className='my-1 w-full text-body-1-med text-secondary'
          />
          <LoopOwnerDetails
            loopOwner={loopDetails.owner}
            loopCommunity={loopDetails.community}
            noOfMembers={loopDetails.group.no_of_members ?? 0}
            noOfPosts={loopDetails.group.no_of_videos ?? 0}
          />
        </div>
        {isMobile && (
          <>
            <CTAButtons
              isPrivate={isLoopPrivate}
              isSubscriber={loopDetails.is_subscriber ?? false}
              loopId={loopDetails.chat_id}
              shareUrl={loopDetails.share_url}
              name={loopDetails.group.group_name}
              slug={loopDetails.slug}
            />
            <hr className='border-t my-2 border-tertiary-200' />
          </>
        )}
      </div>
      {isLoopPrivate ? (
        <PrivateGroup />
      ) : isMobile ? (
        <LoopTabs slug={loopDetails.slug} />
      ) : (
        <div className='grid w-full grid-cols-2 gap-4 overflow-hidden'>
          <div className='h-full scroll-smooth'>
            <Posts slug={loopDetails.slug} />
          </div>
          <div className='scroll-smooth py-2'>
            <Members slug={loopDetails.slug} />
          </div>
        </div>
      )}
    </section>
  )
}
