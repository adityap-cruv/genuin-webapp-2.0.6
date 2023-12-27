'use client'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'

export function TopBar() {
  return (
    <>
      <div className="z-20 flex w-full justify-center border-b border-monochrome-9  bg-new-off-white sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full items-center justify-between px-2 xl:container">
          <Link href={{ pathname: '/' }}>
            <GenuinLogo variant="black" />
          </Link>
          <div className="flex gap-x-3">
            <Link href={{ pathname: PATH_NAME.careers() }}>
              <Button
                variant="outline"
                size="custom"
                className="px-4 py-3 hover:bg-new-off-black hover:text-new-off-white">
                <p className="text-new-para-2" style={{ fontWeight: 600 }}>
                  We're hiring!
                </p>
              </Button>
            </Link>
            <DownloadAppDialog>
              <Button variant="default" size={'custom'} className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                <p className="text-new-para-2" style={{ fontWeight: 600 }}>
                  Download Genuin
                </p>
              </Button>
            </DownloadAppDialog>
          </div>
        </nav>
      </div>
      <div></div>
    </>
  )
}
