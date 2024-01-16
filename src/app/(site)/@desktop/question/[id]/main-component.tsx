'use client'

import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'

interface Props {
  questionDetails: any
}

export function MainComponent({ questionDetails }: Props) {
  const previewImage = questionDetails.preview_image
  const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
  const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'

  if (previewImage)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        {isMobile ? (
          <>
            <div style={{ width: '100%' }}>
              <img style={{ width: '100%', height: 'auto', borderRadius: '20px' }} src={previewImage} alt="app store" />
            </div>
            <div className="mt-6">
              <DownloadAppDialog>
                <Button className="px-6 py-6">
                  <p className="mx-2 text-title-2-bold text-new-off-white">Get App</p>
                </Button>
              </DownloadAppDialog>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: '70%' }}>
              <img style={{ width: '100%', height: 'auto', borderRadius: '20px' }} src={previewImage} alt="app store" />
            </div>
            <div className="mt-6 flex">
              <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
                <Image className="mx-4 h-12 w-auto" src={imageAppStore} alt="app store" />
              </a>
              <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
                <Image className="mx-4 h-12 w-auto" src={imagePlayStore} alt="play store" />
              </a>
            </div>
          </>
        )}
      </div>
    )
}
