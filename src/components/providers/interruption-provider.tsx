/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useEffect } from 'react'
import { useAuthenticationModalStore } from '../common/modals/authentication/store'

const DELAY_FOR_INTERRUPTION = 60000

/**
 * Only for use in outside of interruption provider.
 * And Can only be used in component not outside of the component.
 */
export function showInterruption() {
  const { user, brandId } = useGenuinOptions.getState()
  const isOpen = useAuthenticationModalStore.getState().isOpen
  if (isOpen) return
  console.log('brandId', brandId)
  if (brandId.toString() === '99') return
  if (!user) {
    AuthenticationModal.open(undefined, 'STARTER')
  } else if (!user.hasTopics) {
    AuthenticationModal.open(undefined, 'CATEGORY_SELECTION')
  } else if (!user.usernameSet) {
    AuthenticationModal.open(undefined, 'USERNAME_INPUT')
  }
}

export function InterruptionProvider() {
  const { user } = useGenuinOptions()

  function showInterruption() {
    const { user } = useGenuinOptions.getState()
    const isOpen = useAuthenticationModalStore.getState().isOpen
    if (isOpen) return
    if (!user) {
      AuthenticationModal.open(undefined)
    } else if (!user.hasTopics) {
      AuthenticationModal.open(undefined, 'CATEGORY_SELECTION')
    } else if (!user.usernameSet) {
      AuthenticationModal.open(undefined, 'USERNAME_INPUT')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (AuthenticationModal.isOpen) return

    let timeout: NodeJS.Timeout
    timeout = setTimeout(showInterruption, DELAY_FOR_INTERRUPTION)

    function handleInterruption() {
      if (timeout) clearTimeout(timeout)
      if (!user?.hasTopics || !user) timeout = setTimeout(showInterruption, DELAY_FOR_INTERRUPTION)
    }

    document.addEventListener('click', handleInterruption)
    return () => {
      document.removeEventListener('click', handleInterruption)
    }
  }, [user, AuthenticationModal.isOpen])

  return <></>
}
