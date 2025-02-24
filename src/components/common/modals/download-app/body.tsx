'use client'
import { ModalShell } from '../authentication/modal-shell'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import { QRCode } from 'react-qrcode-logo'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { CustomImage } from '@/components/custom/custom-image'
import { Button } from '@/components/ui/button'
import { getMobileAppUrl, openGeneratedLink } from '@/lib/utils'

type DownloadDialogType = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  deepLink?: string
}

export function Body({ title, subtitle, deepLink }: DownloadDialogType) {
  const { links, brandLogo, isMobile } = useGenuinOptions(
    useShallow((state) => ({
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
      brandLogo: state.config?.logo,
      isMobile: state.isMobile,
    }))
  )

  return (
    <ModalShell>
      <div className="flex w-full flex-col items-center justify-center px-0 pt-6 sm:px-4">
        {deepLink ? (
          <>
            <p className="text-center text-new-h3">Download the app</p>

            {subtitle && <p className="mt-4 line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>}

            <div className="my-4 mb-8">
              <QRCode value={deepLink} size={150} qrStyle="squares" logoPaddingStyle="square" />
              <p className="text-center font-bold" style={{ fontSize: '14px' }}>
                Scan to download
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            {brandLogo && <CustomImage src={brandLogo} height={48} width={48} className="object-cover" alt="logo" />}
            <p style={{ fontSize: '40px' }} className="whitespace-nowrap text-center font-bold leading-none">
              {title}
            </p>
            <p className="line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>
          </div>
        )}
        {!isMobile ? (
          <div className="flex gap-x-2">
            <a href={links.appStoreLink ?? URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imageAppStore} alt="app store" />
            </a>
            <a href={links.playStoreLink ?? URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imagePlayStore} alt="play store" />
            </a>
          </div>
        ) : (
          <Button
            className=" w-full"
            variant="default"
            onClick={() => {
              openGeneratedLink(getMobileAppUrl())
            }}>
            <p className="text-body-1-demi">Get App</p>
          </Button>
        )}
      </div>{' '}
    </ModalShell>
  )
}
