import { PATH_NAME } from '@/lib/utils/constants/path'
import { JoinCommunityButton } from './join-community-button'
import Link from 'next/link'
import { CustomAvatar } from '@/components/custom/custom-avatar'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

interface CommunityPillProps extends ComponentProps<'div'> {
  handle: string
  id: string
  slug: string
  type: number | undefined | null
  userRole: CommunityUserRoleType
  shareUrl: string
  name: string
  profileImage?: string
  onStatusChange?: (role: CommunityUserRoleType) => void
}

export const CommunityPill = ({
  className,
  handle,
  id,
  slug,
  type,
  userRole,
  shareUrl,
  name,
  profileImage,
  onStatusChange,
  ...props
}: CommunityPillProps) => {
  const [isJoinedLocal, setIsJoinedLocal] = useState(userRole)
  const { user } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
    }))
  )

  useEffect(() => {
    if (isJoinedLocal !== userRole)
      setTimeout(() => {
        setIsJoinedLocal(userRole)
      }, 3000)
  }, [userRole])

  return (
    <div className={cn('flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1', className)} {...props}>
      <Link href={PATH_NAME.community(slug)} className="flex items-center gap-1">
        <CustomAvatar className="h-6 w-6" imageUrl={profileImage ?? ''} fallbackString={name ?? ''} isAvatar={false} />
        <p className="whitespace-nowrap break-all pr-1.5 text-cap-1-med leading-5 text-monochrome-white">
          {(name.length ?? 0) > 24 ? name.slice(0, 24) + '...' : (name ?? '')}
        </p>
      </Link>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isJoinedLocal === 'MEMBER' || !user ? 'max-w-0 scale-95 opacity-0' : 'max-w-[80px] scale-100 opacity-100'
        )}>
        <div className="w-auto">
          <JoinCommunityButton
            handle={handle}
            buttonText="Join"
            id={id}
            slug={slug}
            type={type === 2 ? 'private' : 'public'}
            role={userRole}
            onStatusChange={onStatusChange}
            isMobile={false}
            shareUrl={shareUrl}
            variant="pill"
          />
        </div>
      </div>
    </div>
  )
}
