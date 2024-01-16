'use client'
import { cn } from '@lib/utils'
import { Button } from '@components/ui/button'
import { GenuinLogo, GenuinText } from '@components/ui/genuin-logo'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { PATH_NAME } from '@lib/utils/constants/path'
import { DownloadAppDialog } from './download-app-dialog'
import { HIRING_LINK } from '@lib/constants'

export function NavBar() {
  return (
    <>
      <nav className="absolute top-0 z-10 m-auto hidden h-navbar w-full lg:flex ">
        <div className={cn('container flex h-full w-full items-center justify-between py-1')}>
          <Link href="/">
            <GenuinLogo variant="black" />
          </Link>
          <div className="flex items-center gap-x-4">
            <Link href={{ pathname: PATH_NAME.home() }}>
              <p className="pr-4 text-new-para-2 transition-all hover:underline" style={{ fontWeight: 600 }}>
                Explore Genuin
              </p>
            </Link>
            <Link href={HIRING_LINK}>
              <Button
                variant="outline"
                className="hover:bg-new-off-black hover:text-new-off-white"
                outlineColor="black"
                size="index-page">
                <p className="text-new-sm" style={{ fontWeight: 600 }}>
                  We're hiring!
                </p>
              </Button>
            </Link>
            <DownloadAppDialog isMobile={false}>
              <Button size="index-page" className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
                <p className="text-new-sm text-new-off-white" style={{ fontWeight: 600 }}>
                  Download Genuin
                </p>
              </Button>
            </DownloadAppDialog>
          </div>
        </div>
      </nav>
      <nav className="absolute top-0 z-10 m-auto h-navbar w-full lg:hidden ">
        <div className={cn('flex h-full items-center justify-between py-1 pl-2')}>
          <GenuinText variant="black" />
          <div className="flex items-center gap-x-2">
            <Sheet modal={true}>
              <SheetTrigger>
                <HamBurgerMenuIcon toggleToClose={false} />
              </SheetTrigger>
              <SheetContent
                className="min-h-full w-full border-none"
                style={{
                  background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)',
                }}>
                <div className="flex h-full min-w-full flex-col gap-y-1 pt-7">
                  <div className="flex h-full min-w-full flex-col gap-y-4 py-7">
                    <DownloadAppDialog isMobile>
                      <Button size="index-page" className="my-2 w-full bg-new-off-black hover:bg-new-dark-grey">
                        <p className="text-new-md text-new-off-white">Download Genuin</p>
                      </Button>
                    </DownloadAppDialog>
                    <Link href={HIRING_LINK}>
                      <h3 className="text-new-h3-mobile font-semibold">Careers</h3>
                    </Link>
                    <Link href={PATH_NAME.terms}>
                      <h3 className="text-new-h3-mobile font-semibold">Terms of Service</h3>
                    </Link>
                    <Link href={PATH_NAME.privacy}>
                      <h3 className="text-new-h3-mobile font-semibold">Privacy Policy</h3>
                    </Link>
                  </div>
                  <p className="text-new-para-1-mobile">© 2023 Genuin Inc.</p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}
