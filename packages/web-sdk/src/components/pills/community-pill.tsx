import { useAuth } from '@/context/auth'
import { CommunityUserRoleType } from '../pages/video/roles'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { CustomLink } from '@/router/custom-link'
import { CustomAvatar } from '../custom-avatar'
import { useBaseContext } from '@/context/base'
import { JoinButton } from '../join-button'
import { CommunityUserRole } from '../tree-structure'
import { mapCommunityUserRoleToJoinStatus } from '../full-screen-view/desktop/details'
import { cn, isCheckFifthVideoType } from '@/utils'
import { useEffect, useState } from 'react'
import { type ComponentProps } from 'react'
import { useExpandViewContext } from '../expand-view/context'

type CommunityPillProps = ComponentProps<'div'> & {
  handle: string
  id: string
  slug: string
  type: number | undefined | null
  userRole: CommunityUserRole
  shareUrl: string
  name: string
  profileImage?: string
  /**
   * Whether to show the join button or not.
   * @default true
   */
  showJoinButton?: boolean
  onStatusChange?: (role: CommunityUserRoleType) => void
}

export const CommunityPill = ({
  handle,
  id,
  slug,
  type,
  userRole,
  // shareUrl,
  showJoinButton = true,
  name,
  profileImage,
  onStatusChange,
  className,
  ...props
}: CommunityPillProps) => {
  const [isJoinedLocal, setIsJoinedLocal] = useState(userRole)
  const { user } = useAuth()
  const { isFullScreen } = useExpandViewContext()
  const { customizations, updateCommunityJoinState, brandDetails } =
    useBaseContext()
  useEffect(() => {
    if (isJoinedLocal !== userRole)
      setTimeout(() => {
        setIsJoinedLocal(userRole)
      }, 3000)
  }, [userRole])

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full bg-black/40 p-1',
        className,
      )}
      {...props}>
      <CustomLink
        href={usePathNameWithSubdomain().community(slug)}
        className={cn('flex items-center gap-1')}>
        <CustomAvatar
          className={cn('h-6 w-6', {
            'bg-transparent': !!profileImage,
          })}
          imageUrl={profileImage ?? ''}
          fallbackString={name ?? ''}
          isAvatar={false}
          smallSize
        />
        <p
          className={cn(
            ' text-white',
            isCheckFifthVideoType(brandDetails?.brand_id) &&
              customizations?.view === 'carousel'
              ? `line-clamp-1 break-all text-white ${isFullScreen ? 'font-normal text-[11px] leading-4 tracking-normal' : 'font-bold text-[14px] leading-[130%] tracking-[-0.21px]'}`
              : 'whitespace-nowrap break-all pr-1.5 text-cap-1-med leading-5 text-white',
          )}>
          {(name.length ?? 0) > 24 ? name.slice(0, 24) + '...' : (name ?? '')}
        </p>
      </CustomLink>

      {showJoinButton && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isJoinedLocal === 'MEMBER' ||
              !user ||
              !customizations?.show_join_community_button
              ? 'max-w-0 scale-95 opacity-0'
              : 'max-w-[80px] scale-100 opacity-100',
          )}>
          <div className='w-auto'>
            <JoinButton
              communitySlug={slug}
              communityId={id}
              isPrivate={type === 2}
              role={userRole}
              onCommunityRoleChanged={(newRole) => {
                updateCommunityJoinState(
                  id,
                  mapCommunityUserRoleToJoinStatus(newRole),
                )
                onStatusChange?.(newRole)
              }}
              communityName={name}
              communityHandle={handle}
              buttonType='pill'
              textForStates={{ UNJOINED: 'Join' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
