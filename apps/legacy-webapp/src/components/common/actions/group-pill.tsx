import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { GroupIcon } from '@icons/group-icon'
import SubscriptionButton from './subscription-button'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

interface GroupPillProps extends ComponentProps<'div'> {
  id: string
  name: string
  slug: string
  isSubscribed: boolean
  shareUrl: string
  description?: string | null
  onSuccess?: (isSubscribed: boolean) => void
}

export const GroupPill = ({
  className,
  id,
  name,
  slug,
  isSubscribed,
  shareUrl,
  description,
  onSuccess,
  ...props
}: GroupPillProps) => {
  const [isSubscribedLocal, setIsSubscribedLocal] = useState(isSubscribed)
  const { user } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
    }))
  )
  const ldDescription = `${
    description !== null && description !== undefined && description.replace(/\s+/g, '') !== ''
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
    <div className={cn('flex items-center gap-1 rounded-full bg-monochrome-black/40 p-1', className)} {...props}>
      <Link href={PATH_NAME.loop(slug)} className="flex items-center gap-1">
        <div className="rounded-full bg-monochrome-white/20 p-1">
          <GroupIcon className="h-4 w-4" />
        </div>
        <p className="line-clamp-1 whitespace-nowrap pr-1.5 text-cap-1-med leading-5 text-monochrome-white">{name}</p>
      </Link>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isSubscribedLocal || !user ? 'max-w-0 scale-95 opacity-0' : 'max-w-[80px] scale-100 opacity-100'
        )}>
        <div className="w-auto">
          <SubscriptionButton
            isSubscribed={isSubscribed}
            chatId={id}
            groupName={name ?? ''}
            ldDescription={ldDescription}
            shareUrl={shareUrl}
            slug={slug}
            variant="pill"
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  )
}
