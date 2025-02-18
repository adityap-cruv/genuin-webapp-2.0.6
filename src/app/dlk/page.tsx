'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { resolveDeepLink } from '@/lib/get-deeplink'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'

const DlkPage = () => {
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
      const shortId = pathname.split('/dlk/')[1]
      if (!shortId) return

      const deepLink = await resolveDeepLink(shortId)
      if (!deepLink) {
        console.error('Deep link not found')
        return
      }

      const platform = os.toLowerCase()
      try {
        // First try to open the deep link
        window.location.href = deepLink

        // Set a timeout to redirect to app store if deep link fails
        setTimeout(() => {
          if (platform === 'ios' && links.appStoreLink) {
            window.location.href = links.appStoreLink
          } else if (platform === 'android' && links.playStoreLink) {
            window.location.href = links.playStoreLink
          }
        }, 1000) // Wait 1 second before redirecting to app store
      } catch (error) {
        // If deep link fails, redirect to appropriate store
        if (platform === 'ios' && links.appStoreLink) {
          window.location.href = links.appStoreLink
        } else if (platform === 'android' && links.playStoreLink) {
          window.location.href = links.playStoreLink
        }
      }
    }

    void handleDeepLink()
  }, [pathname, os, links])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p className="mt-4 text-gray-600">Please wait while we redirect you to the app.</p>
    </div>
  )
}

export default DlkPage
