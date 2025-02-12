'use client'
import { ModalShell } from '../authentication/modal-shell'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import { QRCode } from 'react-qrcode-logo'
import { GenuinIcon } from '@icons/genuin-icon'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'

type DownloadDialogType = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  deepLink?: string
}

export function Body({ title, subtitle, deepLink }: DownloadDialogType) {
  const { links } = useGenuinOptions(
    useShallow((state) => ({
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
    }))
  )

  return (
    <ModalShell>
      <div className="flex w-full flex-col items-center justify-center px-4 pt-6">
        {deepLink ? (
          <>
            <p className="text-center text-new-h3">
              Download the
              <br /> app
            </p>

            {subtitle && <p className="mt-4 line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>}

            <div className="my-4 mb-8">
              <QRCode value={deepLink} size={150} qrStyle="squares" logoPaddingStyle="square" />
              <p className="text-center font-bold" style={{ fontSize: '14px' }}>
                Scan to download
              </p>
            </div>
          </>
        ) : (
          <div className=" mb-4 flex flex-col items-center justify-center">
            <GenuinIcon.icon className="h-12 fill-blue" />
            <p style={{ fontSize: '40px' }} className="hidden whitespace-nowrap text-center font-bold sm:block">
              {title}
            </p>
            <p className="line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>
          </div>
        )}
        <div className="flex gap-x-2">
          <a href={links.appStoreLink ?? URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2 h-10 w-auto" src={imageAppStore} alt="app store" />
          </a>
          <a href={links.playStoreLink ?? URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2 h-10 w-auto" src={imagePlayStore} alt="play store" />
          </a>
        </div>
      </div>{' '}
    </ModalShell>
  )
}
