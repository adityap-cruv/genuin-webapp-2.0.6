'use client'
import { AppLogo } from '@components/ui/app-logo'
import { ModalShell } from '../authentication/modal-shell'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'

type DownloadDialogType = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

export function DownloadDialog({ title, subtitle }: DownloadDialogType) {
  return (
    <ModalShell>
      <div className="flex w-full flex-col items-center justify-center px-4 pt-6">
        <AppLogo.icon className="fill-primary" imageHeight={50} />
        <p style={{ fontSize: '40px' }} className="hidden whitespace-nowrap text-center font-bold sm:block">
          {title}
        </p>
        <p className="line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>
        <div className="mt-6 flex gap-x-2">
          <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2 h-10 w-auto" src={imageAppStore} alt="app store" />
          </a>
          <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
            <Image className="mx-2 h-10 w-auto" src={imagePlayStore} alt="play store" />
          </a>
        </div>
      </div>{' '}
    </ModalShell>
  )
}
