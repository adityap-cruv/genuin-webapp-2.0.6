/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useEffect } from 'react'

const DELAY_FOR_INTERRUPTION = 60000

/**
 * Only for use in outside of interruption provider.
 * And Can only be used in component not outside of the component.
 */
export function showInterruption() {
  const { embed, user } = useGenuinOptions.getState()
  if (!embed || (user && user.hasTopics) || AuthenticationModal.isOpen) return
  if (!user) {
    AuthenticationModal.open(undefined, 'STARTER')
  } else if (!user.hasTopics) {
    AuthenticationModal.open(undefined, 'CATEGORY_INPUT')
  }
}

export function InterruptionProvider() {
  const { user, embed } = useGenuinOptions((state) => ({ user: state.user, embed: state.embed }))

  function showInterruption() {
    const { user, embed } = useGenuinOptions.getState()
    if (!embed || user?.hasTopics || AuthenticationModal.isOpen) return
    if (!user) {
      AuthenticationModal.open(undefined)
    } else if (!user.hasTopics) {
      AuthenticationModal.open(undefined, 'CATEGORY_INPUT')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!embed || user?.hasTopics || AuthenticationModal.isOpen) return

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
  }, [user])

  return <></>
}
