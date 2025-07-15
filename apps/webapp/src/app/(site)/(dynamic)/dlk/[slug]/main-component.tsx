'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { resolveDeepLink } from '@lib/get-deeplink'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { Loader } from '@components/ui/loader'
import smartAppRedirect from '@lib/utils/redirection'

export function MainComponent() {
  const pathname = usePathname()
  const { links } = useGenuinOptions(
    useShallow((state) => ({
      links: {
        appStoreLink: state.config?.integrations?.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations?.sdk.android.playstore_link,
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
      // Append path and query params to store links
      const appendParams = (storeUrl: string) => {
        const storeUrlObj = new URL(storeUrl)
        // Add path from deepLink object
        storeUrlObj.searchParams.append('path', deepLink.path)
        // Add all query params from deepLink object
        for (const [key, value] of Object.entries(deepLink.query_params)) {
          storeUrlObj.searchParams.append(key, value)
        }
        return storeUrlObj.toString()
      }

      // Update store URLs with appended params
      smartAppRedirect({
        appStoreUrl: links.appStoreLink ? appendParams(links.appStoreLink) : '',
        playStoreUrl: links.playStoreLink ? appendParams(links.playStoreLink) : '',
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
