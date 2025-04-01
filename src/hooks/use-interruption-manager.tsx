'use client'
import { useEffect, useRef, useCallback } from 'react'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useGenuinOptions, type User } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { getAppLink } from '@/lib/get-deeplink'
import { DownloadDialogModal } from '@/components/common/modals/download-app'

const INTERRUPTION_STEPS = [
  {
    key: 'STARTER',
    configKey: 'login_signup_popup',
    isComplete: (user?: User) => !!user,
  },
  {
    key: 'CATEGORY_SELECTION',
    configKey: 'interest_selection_popup',
    isComplete: (user?: User) => user?.hasTopics,
  },
  {
    key: 'USERNAME_INPUT',
    configKey: 'username_popup',
    isComplete: (user?: User) => user?.usernameSet,
  },
  {
    key: 'COMPLETE_PROFILE',
    configKey: 'complete_profile_popup',
    isComplete: (user?: User) => user?.name && user?.bio && user?.image,
  },
] as const

export function useInterruptionManager() {
  const { user, config, brandId } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
      config: state.config,
      brandId: state.brandId,
    }))
  )
  const interactionRef = useRef({ lastIndex: 0, swipeCount: 0 })

  // Determine the next interruption step that should be shown
  const interruptionToShow = INTERRUPTION_STEPS.find(
    (step) => config?.web_configs?.[step.configKey]?.enable && !step.isComplete(user)
  )

  // Trigger authentication modal based on interruption step
  const triggerAuthenticationModal = useCallback(async () => {
    if (interruptionToShow && brandId?.toString() !== '99') {
      if (config.web_cta !== 'app') {
        AuthenticationModal.open(undefined, interruptionToShow.key)
      } else {
        await getAppLink().then((generatedLink) => {
          DownloadDialogModal.open({
            title: <>Download the app</>,
            deepLink: generatedLink,
          })
        })
      }
    }
  }, [interruptionToShow])

  // Handle swipe interactions to trigger modal after a set count
  const handleSwipeCount = useCallback(
    (index: number) => {
      const { swipeCount, lastIndex } = interactionRef.current
      const popupAfter = interruptionToShow ? config?.web_configs?.[interruptionToShow.configKey]?.popup_after ?? 0 : 0

      if (index !== lastIndex) {
        interactionRef.current.swipeCount = swipeCount + 1
        interactionRef.current.lastIndex = index
      }

      if (interactionRef.current.swipeCount > popupAfter) {
        interactionRef.current.swipeCount = 0
        void triggerAuthenticationModal()
      }
    },
    [config?.web_configs, interruptionToShow, interactionRef.current, triggerAuthenticationModal]
  )

  // Detect idle time and trigger modal if necessary
  useEffect(() => {
    if (!interruptionToShow || AuthenticationModal.isOpen) return

    const idleConfig = config?.web_configs?.idle_time_interruption
    if (!idleConfig?.enable) return

    let timeout: NodeJS.Timeout
    const resetIdleTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(triggerAuthenticationModal, (idleConfig?.popup_after ?? 0) * 1000)
    }

    resetIdleTimeout()
    document.addEventListener('click', resetIdleTimeout)

    return () => {
      document.removeEventListener('click', resetIdleTimeout)
      clearTimeout(timeout)
    }
  }, [triggerAuthenticationModal, config?.web_configs?.idle_time_interruption])

  return { handleSwipeCount, interruptionToShow }
}
