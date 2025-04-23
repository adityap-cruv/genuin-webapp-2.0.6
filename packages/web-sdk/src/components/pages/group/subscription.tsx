import SubscriptionButton from '@/components/subscription-button'
import { toast } from '@/components/ui/use-toast'
import { subscribeLoop } from './api'
import { useAuth } from '@/context/auth'
import { AuthenticationModal } from '@/components/authentication'
import { useCallback, useState } from 'react'
import { Analytics } from '@/analytics'

type SubscriptionPropsType = {
  isSubscribed: boolean
  loopId: string
  slug: string
  name: string
}
export function Subscription({
  isSubscribed: initialIsSubscribed,
  loopId,
  name,
  slug,
}: SubscriptionPropsType) {
  const [isLoopSubscribed, setIsLoopSubscribed] = useState(initialIsSubscribed)
  const { user } = useAuth()

  const toggleLoopSubscription = useCallback(() => {
    const newValue = !isLoopSubscribed
    void subscribeLoop(loopId, newValue).then((res) => {
      if (res.code === 200) {
        setIsLoopSubscribed(newValue)
        if (newValue) {
          // Notifications turned on for this Group
          toast({
            title: 'Notifications turned on for this Group',
            duration: 1000,
          })
        } else {
          // Notifications turned off for this Group
          toast({
            title: 'Notifications turned off for this Group',
            duration: 1000,
          })
        }
      }
    })
  }, [isLoopSubscribed])

  const handleSubscribeClick = useCallback(async () => {
    void Analytics.track(Analytics.EventNames.SubscriptionClicked, {
      loop_id: loopId,
      loop_slug: slug,
      loop_name: name,
    })

    if (user) {
      toggleLoopSubscription()
    } else {
      AuthenticationModal.open()
      // TODO: Discuss regarding this deep link.
      //  await subscribeDeepLink({
      //    ldDescription,
      //    loopDetails,
      //    searchParams,
      //  }).then((generatedLink) => {
      //    openModal({
      //      deepLink: generatedLink,
      //      subtitle: (
      //        <>
      //          Get the app to subscribe to
      //          <span className='font-bold'>
      //            {' '}
      //            {loopDetails.group.group_name}
      //          </span>{' '}
      //          Group.
      //        </>
      //      ),
      //    })
      //  })
    }
  }, [user, toggleLoopSubscription])

  return (
    <SubscriptionButton
      onClick={handleSubscribeClick}
      isSubscribed={isLoopSubscribed}
    />
  )
}
