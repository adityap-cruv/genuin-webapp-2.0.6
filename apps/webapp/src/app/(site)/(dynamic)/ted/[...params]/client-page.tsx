'use client'
import { useEffect } from 'react'
import { Loader } from '@components/ui/loader'
import smartAppRedirect from '@lib/utils/redirection'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'

export function RedirectClientPage() {
  const { links } = useGenuinOptions(
    useShallow((state) => ({
      links: {
        appStoreLink: state.config?.integrations?.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations?.sdk.android.playstore_link,
      },
    }))
  )
  console.log('[RedirectClientPage] links:', links)
  useEffect(() => {
    const handleDeepLink = async () => {
      // Update store URLs with appended params
      smartAppRedirect({
        appStoreUrl: links.appStoreLink ? links.appStoreLink : '',
        playStoreUrl: links.playStoreLink ? links.playStoreLink : '',
        timeout: 300,
      })
    }

    void handleDeepLink()
  }, [links]) // Remove dependencies so it only runs once on mount
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader size="xl" />
    </div>
  )
}
