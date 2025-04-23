import ShareButton from '@/components/share-button'
import { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'
import { Subscription } from './subscription'

type CTAButtonsPropsType = ComponentProps<'div'> & {
  isPrivate: boolean
  isSubscriber: boolean
  loopId: string
  shareUrl: string
  slug: string
  name?: string | null
}

export function CTAButtons({
  isPrivate,
  isSubscriber,
  loopId,
  shareUrl,
  className,
  name,
  slug,
  ...restProps
}: CTAButtonsPropsType) {
  return (
    <div
      className={cn('flex items-center gap-x-3', className)}
      {...restProps}>
      {!isPrivate && (
        <Subscription
          name={name ?? ''}
          slug={slug}
          isSubscribed={!!isSubscriber}
          loopId={loopId}
        />
      )}

      {isPrivate && (
        <Button
          size='custom'
          variant='outline'
          className='border border-primary'
          onClick={async () => {
            // TODO: Handle this link as well.
            // await joinAsCollaboratorDeepLink({
            //   ldDescription,
            //   loopDetails,
            //   searchParams,
            // }).then((generatedLink) => {
            //   openModal({
            //     deepLink: generatedLink,
            //     subtitle: (
            //       <>
            //         Get the app to Join as Member to
            //         <span className='font-bold'>
            //           {' '}
            //           {loopDetails.group.group_name}
            //         </span>{' '}
            //         Group.
            //       </>
            //     ),
            //   })
            // })
          }}>
          <p
            className='px-4 py-1 text-title-3-bold text-primary'
            style={{ fontSize: '15px' }}>
            Join as Member
          </p>
        </Button>
      )}
      <ShareButton url={shareUrl} />
    </div>
  )
}
