'use client'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'
import { AppLogo } from '@components/ui/app-logo'
import { useGenuinOptions } from '@lib/stores/genuin-options'
// import { GenuinIcon } from '@icons/genuin-icon'

export function TopBar() {
  const isEmbed = useGenuinOptions().embed
  return (
    <>
      <div className="z-20 flex w-full justify-center border-b border-monochrome-9  bg-new-off-white sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full items-center justify-between px-2 xl:container">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.logo className="fill-new-off-black" imageHeight={42} />
            {/* <GenuinIcon.logo className="fill-new-off-black" /> */}
          </Link>
          {!isEmbed && (
            <div className="flex gap-x-3">
              <Link href={{ pathname: PATH_NAME.careers() }}>
                <Button
                  variant="outline"
                  size="custom"
                  className="px-4 py-3 hover:bg-new-off-black hover:text-new-off-white">
                  <p className="text-new-para-2 font-semibold">We're hiring!</p>
                </Button>
              </Link>
              <DownloadAppDialog isMobile={false}>
                <Button variant="default" size={'custom'} className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                  <p className="text-new-para-2 font-semibold">Download Genuin</p>
                </Button>
              </DownloadAppDialog>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
