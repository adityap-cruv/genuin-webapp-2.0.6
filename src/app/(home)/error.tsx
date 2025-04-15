'use client'
import { NavBar } from '@components/common/nav-bar'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import GetAppButton from '@/components/common/get-app-button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
  const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'
  // return <div onClick={reset}>{error.message}</div>
  if (error)
    return (
      <>
        <NavBar variant="transparent" isMobile={false} />
        <div
          className="flex min-h-full items-center justify-center text-center"
          style={{
            background:
              'transparent radial-gradient(closest-side at 50% 50%, #00189f 0%, #000000 100%) 0% 0% no-repeat padding-box',
          }}>
          <div className="flex w-full flex-col items-center sm:hidden">
            <h2 className="text-new-h2-mobile text-monochrome-white">Sorry, this page isn't available.</h2>
            <h5 className="m-8 text-new-h5-mobile text-monochrome-white">
              Something went wrong!
              <a href="/">Genuin Home Page.</a>
            </h5>
            <GetAppButton buttonText="Download App" className="mx-2 text-title-2-bold text-monochrome-white" />
          </div>
          <div className="hidden w-[70%] flex-col items-center sm:flex">
            <h2 className="text-new-h2 text-monochrome-white">Something went wrong!</h2>
            <h5 className="m-8 text-new-h5 text-monochrome-white">
              The link you followed may be broken, or the page may have been removed. Go to{' '}
              <a href="/">Genuin Home Page.</a>
            </h5>

            <div className="flex">
              <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
                <Image className="mx-4 h-16 w-auto" src={imageAppStore} alt="app store" />
              </a>
              <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
                <Image className="mx-4 h-16 w-auto" src={imagePlayStore} alt="play store" />
              </a>
            </div>
          </div>
        </div>
      </>
    )
}
