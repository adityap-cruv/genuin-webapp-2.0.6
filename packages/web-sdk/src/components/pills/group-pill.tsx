import { type ComponentProps } from 'react'
import { useAuth } from '@/context/auth'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { GroupIcon } from '../icons/group-icon'
import { CustomLink } from '@/router/custom-link'
import { Subscription } from '../pages/group/subscription'
import { useEffect, useState } from 'react'
import { cn } from '@/utils'
import { useBaseContext } from '@/context/base'
import { mapCommunityUserRoleToJoinStatus } from '../full-screen-view/desktop/details'
import { CommunityUserRole } from '../tree-structure'

type GroupPillProps = ComponentProps<'div'> & {
  id: string
  name: string
  slug: string
  isSubscribed: boolean
  shareUrl: string
  description?: string | null
  communityId?: string
  onSuccess?: (isSubscribed: boolean) => void
}

export const GroupPill = ({
  id,
  name,
  slug,
  isSubscribed,
  shareUrl,
  description,
  communityId,
  // onSuccess,
  className,
  ...props
}: GroupPillProps) => {
  const [isSubscribedLocal, setIsSubscribedLocal] = useState(isSubscribed)
  const { updateLoopSubscriptionState, updateCommunityJoinState } =
    useBaseContext()
  const { user } = useAuth()
  const pathName = usePathNameWithSubdomain()
  const ldDescription = `${
    description !== null &&
    description !== undefined &&
    description.replace(/\s+/g, '') !== ''
      ? description + ' | '
      : ''
  } • Join ${name} to talk about it`

  useEffect(() => {
    if (isSubscribed !== isSubscribedLocal)
      setTimeout(() => {
        setIsSubscribedLocal(isSubscribed)
      }, 3000)
  }, [isSubscribed])

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full bg-black/40 p-1',
        className,
      )}
      {...props}>
      <CustomLink
        href={pathName.loop(slug)}
        className='flex items-center gap-1'>
        <div className='rounded-full bg-white/20 p-1'>
          <GroupIcon className='h-4 w-4' />
        </div>
        <p className='line-clamp-1 whitespace-nowrap pr-1.5 text-cap-1-med leading-5 text-white'>
          {name}
        </p>
      </CustomLink>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isSubscribedLocal || !user
            ? 'max-w-0 scale-95 opacity-0'
            : 'max-w-[80px] scale-100 opacity-100',
        )}>
        <div className='w-auto'>
          <Subscription
            name={name}
            slug={slug}
            isSubscribed={isSubscribed}
            loopId={id}
            ldDescription={ldDescription}
            shareUrl={shareUrl}
            buttonType='pill'
            onSuccess={(status) => {
              updateLoopSubscriptionState(id, status)
              if (communityId)
                updateCommunityJoinState(
                  communityId,
                  mapCommunityUserRoleToJoinStatus(
                    'MEMBER' as CommunityUserRole,
                  ),
                )
            }}
          />
        </div>
      </div>
    </div>
  )
}
