import { requestCommunity, joinCommunity, leaveCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import { cn, openGeneratedLink, openModal } from '@lib/utils'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { usePathname, useSearchParams } from 'next/navigation'
import { joinCommunityDeepLink } from '@/lib/get-deeplink'
import { Loader } from '@/components/ui/loader'
import { memo, useCallback } from 'react'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { AuthenticationModal } from '../modals/authentication'
import { useToast } from '../../ui/use-toast'
import { getQueryKeyForCommunityDetails } from '@/lib/utils/react-query/keys'

type Props = {
  handle: string
  type: 'public' | 'private'
  id: string
  slug: string
  buttonText: string
  role: CommunityUserRoleType
  communityName?: string
  isMobile: boolean
  onStatusChange?: (role: CommunityUserRoleType) => void
  shareUrl?: string
  variant?: 'default' | 'pill'
}

type VariantButtonProps = {
  role: CommunityUserRoleType
  isLoading: boolean
  buttonText: string
  onClick?: () => void
}

const DefaultButton = ({ role, isLoading, buttonText, onClick }: VariantButtonProps) => (
  <Button
    size="custom"
    className="h-[32px] rounded border border-primary px-4 text-center"
    variant={role === 'MEMBER' ? 'outline' : 'default'}
    onClick={onClick}>
    {isLoading ? (
      <Loader size="xs" className={cn(role !== 'UNJOINED' ? 'stroke-primary' : 'stroke-monochrome-white')} />
    ) : (
      <p
        className={cn(
          'whitespace-nowrap text-body-1-demi',
          role === 'MEMBER' ? 'text-primary' : 'text-monochrome-white'
        )}>
        {role === 'MEMBER' ? 'Joined' : buttonText}
      </p>
    )}
  </Button>
)

const PillButton = ({ role, isLoading, buttonText, onClick }: VariantButtonProps) => (
  <Button
    variant="custom"
    className="ml-1 flex rounded-2xl bg-monochrome-white p-1 px-2 text-cap-1-med"
    onClick={(e) => {
      e.stopPropagation()
      onClick?.()
    }}>
    <div className="relative h-4 overflow-hidden">
      <div
        className={cn(
          'flex w-fit flex-col transition-transform duration-300 ease-in-out',
          role === 'MEMBER' ? '-translate-y-4' : 'translate-y-0'
        )}>
        <span className="h-4 text-monochrome-black">{buttonText}</span>
        <span className="h-4 text-monochrome-black">Joined</span>
      </div>
    </div>
    {isLoading && <Loader size="xs" />}
  </Button>
)

const RequestedButton = ({ variant = 'default' }: { variant?: 'default' | 'pill' }) => {
  if (variant === 'pill') {
    return (
      <Button variant="custom" className="ml-1 rounded-2xl bg-monochrome-white px-3 py-1 text-cap-1-med">
        <p className="text-primary">Requested</p>
      </Button>
    )
  }

  return (
    <Button size="custom" className="h-[32px] border border-primary" variant="outline">
      <p className="px-4 text-center text-body-1-demi text-primary">Requested</p>
    </Button>
  )
}

const ButtonVariants: Record<'default' | 'pill', React.ComponentType<VariantButtonProps>> = {
  default: DefaultButton,
  pill: PillButton,
}

export const JoinCommunityButton = memo(function JoinCommunityButton({
  role,
  handle,
  id,
  slug,
  buttonText,
  type,
  communityName,
  onStatusChange,
  isMobile,
  variant = 'default',
}: Props) {
  const pathName = usePathname()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, webCTA } = useGenuinOptions((state) => ({
    user: state.user,
    webCTA: state.webCTA,
  }))

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (type === 'private') {
        return await requestCommunity(id)
      }
      return await joinCommunity(false, [id], [{ user_id: user?.id }])
    },
    onSuccess: (response) => {
      if (response.code === 200) {
        if (variant === 'pill') {
          toast({
            title:
              type === 'private'
                ? 'This community changed to private, please request to join the community'
                : "You've joined this community",
            duration: 3000,
          })
        }
        onStatusChange?.(type === 'private' ? 'REQUESTED' : 'MEMBER')
      }
    },
    onError: () => {
      toast({
        title: `Failed to ${type === 'private' ? 'request to join' : 'join'} the community`,
        variant: 'destructive',
        duration: 3000,
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKeyForCommunityDetails(slug),
        type: 'all',
      })
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () => await leaveCommunity(id),
    onSuccess: (response) => {
      if (response.code === 200) {
        onStatusChange?.('UNJOINED')
      }
    },
    onError: () => {
      toast({
        title: 'Failed to leave the community',
        variant: 'destructive',
        duration: 3000,
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKeyForCommunityDetails(slug),
        type: 'all',
      })
    },
  })

  const toggleCommunityJoinState = useCallback(() => {
    if (role !== 'MEMBER') {
      joinMutation.mutate()
    } else {
      leaveMutation.mutate()
    }
  }, [id, role, user])

  const joinCommunityDeepLinkHandler = useCallback(async () => {
    await joinCommunityDeepLink({
      communityName: communityName ?? '',
      searchParams: Object.fromEntries(searchParams),
      slug: slug ?? '',
    }).then((generatedLink) => {
      if (webCTA !== 'app') {
        AuthenticationModal.open()
      } else {
        if (!isMobile) {
          openModal({
            deepLink: generatedLink,
            subtitle: (
              <>
                Download app to join the <br />
                <span className="font-bold">@{handle}</span> community.
              </>
            ),
          })
        } else {
          openGeneratedLink(generatedLink)
        }
      }
    })
  }, [communityName, searchParams])

  if (pathName === PATH_NAME.profile(user?.nickname) || pathName === PATH_NAME.brand(handle)) return null
  if (role === 'LEADER' || role === 'MODERATOR') return null
  if (role === 'REQUESTED') return <RequestedButton variant={variant} />

  const buttonProps: VariantButtonProps = {
    role,
    isLoading: joinMutation.isLoading || leaveMutation.isLoading,
    buttonText,
    onClick: user ? toggleCommunityJoinState : joinCommunityDeepLinkHandler,
  }

  const VariantButton = ButtonVariants[variant]

  return <VariantButton {...buttonProps} />
})
