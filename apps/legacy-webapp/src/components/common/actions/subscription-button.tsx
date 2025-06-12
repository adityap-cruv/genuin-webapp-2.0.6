import React, { memo, useCallback } from 'react'
import { Button } from '@components/ui/button'
import { SubscribedBellIcon } from '@icons/subscribed-bell-icon'
import { BellIconOff } from '@icons/bell-icon-off'
import { subscribeLoop } from '@/lib/api/loop'
import { useToast } from '@/components/ui/use-toast'
import Analytics from '@/services/analytics'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { subscribeDeepLink } from '@/lib/get-deeplink'
import { useSearchParams } from 'next/navigation'
import { cn, openModal } from '@/lib/utils'
import { Loader } from '@/components/ui/loader'
import { useMutation } from '@tanstack/react-query'

type SubscriptionButtonProps = {
  isSubscribed: boolean
  slug: string
  chatId: string
  groupName: string
  ldDescription: string
  shareUrl: string
  variant?: 'default' | 'pill'
  onClick?: () => void
  onSuccess?: (isSubscribed: boolean) => void
}

type VariantButtonProps = {
  isSubscribed: boolean
  onClick: () => void
  isLoading?: boolean
}

const PillButton = ({ isSubscribed, onClick, isLoading }: VariantButtonProps) => (
  <Button
    variant="custom"
    className="ml-1 flex gap-1.5 rounded-2xl bg-monochrome-white px-3 py-1 text-cap-1-med"
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}>
    <div className="relative h-4 w-4 overflow-hidden">
      <div
        className={cn(
          'absolute left-0 flex w-full flex-col transition-transform duration-300 ease-in-out',
          isLoading ? '-translate-y-4' : isSubscribed ? '-translate-y-8' : 'translate-y-0'
        )}>
        <BellIconOff className="h-4 w-4 stroke-monochrome-black" variant="dark" />
        <div className="flex h-4 w-4 items-center justify-center">
          <Loader size="xs" />
        </div>
        <SubscribedBellIcon className="h-4 w-4 stroke-monochrome-black" />
      </div>
    </div>
  </Button>
)

const DefaultButton = ({ isSubscribed, onClick }: VariantButtonProps) => (
  <Button size="custom" className="border border-primary p-[3px]" variant="outline" onClick={onClick}>
    {isSubscribed ? (
      <SubscribedBellIcon className="fill-primary stroke-primary" />
    ) : (
      <BellIconOff className="stroke-monochrome-white" />
    )}
  </Button>
)

const ButtonVariants: Record<'default' | 'pill', React.ComponentType<VariantButtonProps>> = {
  default: DefaultButton,
  pill: PillButton,
}

const SubscriptionButton = memo(function SubscriptionButton({
  isSubscribed,
  slug,
  chatId,
  groupName,
  ldDescription,
  shareUrl,
  variant = 'default',
  onSuccess,
}: SubscriptionButtonProps) {
  const { user } = useGenuinOptions()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      const newValue = !isSubscribed
      return await subscribeLoop(chatId, newValue)
    },
    onSuccess: (response) => {
      if (response.code === 200) {
        const newValue = !isSubscribed
        onSuccess?.(newValue)
        toast({
          title: `Notifications turned ${newValue ? 'on' : 'off'} for this Group`,
          duration: 3000,
        })
      }
    },
    onError: () => {
      toast({
        title: 'Failed to update subscription',
        variant: 'destructive',
        duration: 3000,
      })
    },
  })

  const handleSubscribeClick = useCallback(async () => {
    void Analytics.track({
      eventName: 'subscription_clicked',
      properties: {
        loop_id: chatId,
        loop_slug: slug,
        loop_name: groupName,
      },
    })

    if (user) {
      subscriptionMutation.mutate()
    } else {
      const generatedLink = await subscribeDeepLink({
        ldDescription,
        groupName,
        shareUrl,
        searchParams,
      })

      openModal({
        deepLink: generatedLink,
        subtitle: (
          <>
            Download app to subscribe to
            <span className="font-bold"> {groupName}</span> Group.
          </>
        ),
      })
    }
  }, [user, groupName, ldDescription, shareUrl, searchParams, chatId, slug])

  const ButtonComponent = ButtonVariants[variant]

  return (
    <ButtonComponent
      isSubscribed={isSubscribed}
      onClick={handleSubscribeClick}
      isLoading={subscriptionMutation.isLoading}
    />
  )
})

export default SubscriptionButton
