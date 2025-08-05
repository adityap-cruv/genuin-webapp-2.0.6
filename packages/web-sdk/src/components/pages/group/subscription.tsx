import {
  SubscriptionButton,
  SubscriptionPillButton,
} from '@/components/subscription-button'
import { toast } from '@/components/ui/use-toast'
import { subscribeLoop } from './api'
import { useAuth } from '@/context/auth'
import { useCallback } from 'react'
import { Analytics } from '@/analytics'
import { subscribeDeepLink } from '@/components/download-app/get-deeplink'
import { useModalHandler } from '@/hooks/useModalHandler'
import { useSearchParams } from 'wouter'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getQueryKeyForLoopDetails,
  getQueryKeyForLoopPosts,
} from '@/utils/constants/keys'

type SubscriptionPropsType = {
  isSubscribed: boolean
  loopId: string
  slug: string
  name: string
  ldDescription: string
  shareUrl: string
  buttonType?: 'default' | 'pill'
  onSuccess?: (newValue: boolean) => void
}

export function Subscription({
  isSubscribed,
  loopId,
  name,
  slug,
  ldDescription,
  shareUrl,
  buttonType,
  onSuccess,
}: SubscriptionPropsType) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const { openModal } = useModalHandler()
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const newValue = !isSubscribed
      return await subscribeLoop(loopId, newValue)
    },
    onSuccess: (response) => {
      if (response.code === 200) {
        const newValue = !isSubscribed
        onSuccess?.(newValue)
        toast({
          title: newValue
            ? 'Notifications turned on for this Group'
            : 'Notifications turned off for this Group',
          duration: 1000,
        })
      }
    },
    onError: () => {
      toast({
        title: 'Failed to update subscription',
        variant: 'destructive',
        duration: 1000,
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKeyForLoopDetails(slug),
        type: 'all',
      })

      await queryClient.invalidateQueries({
        queryKey: getQueryKeyForLoopPosts(slug),
        type: 'all',
      })
    },
  })

  const handleSubscribeClick = useCallback(async () => {
    void Analytics.track(Analytics.EventNames.SubscriptionClicked, {
      loop_id: loopId,
      loop_slug: slug,
      loop_name: name,
    })

    if (user) {
      toggleMutation.mutate()
    } else {
      const generatedLink = await subscribeDeepLink({
        ldDescription,
        name,
        shareUrl,
        searchParams,
      })

      openModal({
        deepLink: generatedLink,
        subtitle: (
          <>
            Download app to subscribe to{' '}
            <span className='font-bold'>{name}</span> Group.
          </>
        ),
      })
    }
  }, [
    user,
    name,
    loopId,
    slug,
    ldDescription,
    shareUrl,
    searchParams,
    toggleMutation,
  ])

  const isLoading = toggleMutation.isPending

  if (buttonType === 'pill')
    return (
      <SubscriptionPillButton
        onClick={handleSubscribeClick}
        isSubscribed={isSubscribed}
        isLoading={isLoading}
      />
    )

  return (
    <SubscriptionButton
      onClick={handleSubscribeClick}
      isSubscribed={isSubscribed}
      isLoading={isLoading}
    />
  )
}
