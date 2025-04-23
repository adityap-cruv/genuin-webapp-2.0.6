import { AuthenticationModal } from '@/components/authentication'
import { DownloadDialogModal } from '@/components/download-app/context'
import { getAppLink } from '@/components/download-app/get-deeplink'
import { useAuth } from '@/context/auth'
import { useBaseContext } from '@/context/base'
import { useSizeContext } from '@/context/size'
import { openGeneratedLink } from '@/utils'
import { ReactNode } from 'react'
import { UAParser } from 'ua-parser-js'

type OpenModalProps = {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  deepLink?: string
}

export function useModalHandler() {
  const { brandDetails } = useBaseContext()
  const { user } = useAuth()
  const { isMobile } = useSizeContext()

  const openModal = ({ title, subtitle, deepLink }: OpenModalProps) => {
    if (brandDetails?.web_cta !== 'app' && !user) {
      AuthenticationModal.open()
    } else {
      if (!isMobile) {
        DownloadDialogModal.open({
          title,
          subtitle,
          deepLink: deepLink ?? '',
        })
      } else {
        openGeneratedLink(deepLink)
      }
    }
  }

  const handleAppDownloadModal = async () => {
    const generatedLink = await getAppLink()
    // had to cover this for use case of having smart get app for ipad
    // isMobile flag is not detecting ipad as mobile device
    const isIpad =
      new UAParser().getResult().device.model?.toLowerCase() === 'ipad'

    if (isMobile || isIpad) {
      openGeneratedLink(generatedLink)
    } else {
      DownloadDialogModal.open({
        title: 'Download the app',
        subtitle: 'Download app to browse more communities',
        deepLink: generatedLink,
      })
    }
  }

  const getMobileAppUrl = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const osName = new UAParser()
      .getResult()
      .os.name?.toLowerCase()
      .replace(/\s+/g, '')
    const isIOS =
      osName === 'macos' ||
      osName === 'ios' ||
      /iphone|ipad|ipod/.test(userAgent)

    const appStoreLink = brandDetails?.integrations.sdk.ios.appstore_link
    const playStoreLink = brandDetails?.integrations.sdk.android.playstore_link

    return isIOS ? appStoreLink : playStoreLink
  }

  return {
    openModal,
    handleAppDownloadModal,
    getMobileAppUrl,
  }
}
