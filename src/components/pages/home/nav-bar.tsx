'use client'
import { cn } from '@lib/utils'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@components/ui/sheet'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { DownloadAppForm } from './download-app-form'

export function NavBar() {
  // const navRef = useRef<HTMLElement>(null)

  // useEffect(() => {
  //   /**
  //    * here in this login navbar will be transparent if initial-component is in viewport
  //    */
  //   const stop = inView(
  //     '#initial-component',
  //     () => {
  //       navRef.current?.classList.remove('bg-monochrome-white', 'shadow-lg')
  //       return (entry) => {
  //         navRef.current?.classList.add('bg-monochrome-white', 'shadow-lg')
  //       }
  //     },
  //     { amount: 'some' }
  //   )
  //   return () => stop()
  // }, [])

  return (
    <>
      <nav className="absolute top-0 z-10 m-auto hidden h-navbar w-full lg:flex ">
        <div className={cn('container flex h-full w-full items-center justify-between py-1')}>
          <GenuinLogo.text variant="black" />
          <div className="flex items-center gap-x-4">
            <Button
              variant="outline"
              className="hover:bg-new-off-black hover:text-new-off-white"
              outlineColor="black"
              size="index-page">
              <p className="text-new-sm">We're hiring!</p>
            </Button>

            <Dialog>
              <DialogTrigger>
                <Button size="index-page" className="bg-new-off-black hover:bg-new-dark-grey after:bg-new-dark-grey">
                  <p className="text-new-off-white text-new-sm">Download Genuin</p>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="m-8 text-center w-80">
                  <h3 className="text-new-h3">Download <br/>Genuin</h3>
                  <p className="text-new-para-1 m-4">Send the download link to <br/> your phone & email</p>
                  <DownloadAppForm/>
                  <p className="text-new-para-2-mobile mt-4 text-new-dark-grey">By clicking Send Link, I acknowledge that I have read the<br/> <a href='/privacy'>Privacy Policy</a> and agree to the <a href='/terms'>Terms of Service</a></p>
                  <div className="mt-6 flex">
                    <Image className="mx-2 w-full" src={imageAppStore} alt="app store" />
                    <Image className="mx-2 w-full" src={imagePlayStore} alt="play store" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>
      <nav className="absolute top-0 z-10 m-auto h-navbar w-full lg:hidden ">
        <div className={cn('flex h-full items-center justify-between py-1 pl-2')}>
          <GenuinLogo.text variant="black" />
          <div className="flex items-center gap-x-2">
            <Sheet modal={false}>
              <SheetTrigger>
                <HamBurgerMenuIcon toggleToClose={false} />
              </SheetTrigger>
              <SheetContent
                className="w-full border-none"
                style={{
                  background: 'radial-gradient(123.19% 48.8% at 76.02% 69.05%, #E9CAF4 0%, #ADD8FB 100%)',
                }}>
                <div className="flex h-full min-w-full flex-col gap-y-1 py-7">
                  <div className="flex h-full min-w-full flex-col gap-y-4 py-7">
                    <Button size="index-page" className="my-2 w-full bg-new-off-black hover:bg-new-dark-grey">
                      <p className="text-new-md text-new-off-white">Download Genuin</p>
                    </Button>
                    <Link href="https://careers.begenuin.com">
                      <h3 className="text-new-h3-mobile font-semibold">Careers</h3>
                    </Link>
                    <Link href={PATH_NAME.terms}>
                      <h3 className="text-new-h3-mobile font-semibold">Terms of Service</h3>
                    </Link>
                    <Link href={PATH_NAME.privacy}>
                      <h3 className="text-new-h3-mobile font-semibold">Privacy Policy</h3>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}
