'use client'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useEffect } from 'react'

export function InterruptionProvider() {
  const { user, embed } = useGenuinOptions((state) => ({ user: state.user, embed: state.embed }))
  const shouldShowInterruptions = embed && (!user || !user.isPasswordSet)

  function showInterruption() {
    if (!shouldShowInterruptions) return
    if (!user) {
      AuthenticationModal.open(undefined, 'EMAIL_INPUT')
    } else if (!user.isPasswordSet) {
      AuthenticationModal.open(undefined, 'PASSWORD_INPUT')
    }
  }

  useEffect(() => {
    if (!shouldShowInterruptions) return

    let timeout: NodeJS.Timeout
    timeout = setTimeout(showInterruption, 60000)

    function handleInterruption() {
      if (timeout) clearTimeout(timeout)
      if (!shouldShowInterruptions) timeout = setTimeout(showInterruption, 60000)
    }

    document.addEventListener('click', handleInterruption)
    return () => {
      document.removeEventListener('click', handleInterruption)
    }
  }, [])
  return <></>
}
