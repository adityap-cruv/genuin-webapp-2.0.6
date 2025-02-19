'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { resolveDeepLink } from '@lib/get-deeplink'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { Loader } from '@components/ui/loader'
import smartAppRedirect from './redirection'

export function MainComponent() {
  const pathname = usePathname()
  const { os, links } = useGenuinOptions(
    useShallow((state) => ({
      os: state.os,
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
    }))
  )

  useEffect(() => {
    const handleDeepLink = async () => {
      const shortId = pathname?.split('/dlk/')[1]
      if (!shortId) return

      const deepLink = await resolveDeepLink(shortId)
      if (!deepLink) {
        console.error('Deep link not found')
        return
      }
      smartAppRedirect({
        appStoreUrl: links.appStoreLink ?? '',
        playStoreUrl: links.playStoreLink ?? '',
        timeout: 300,
      })
    }

    void handleDeepLink()
  }, [pathname, os, links])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader size="xl" />
    </div>
  )
}
