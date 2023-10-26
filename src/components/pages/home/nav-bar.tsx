'use client'
import { cn } from '@lib/utils'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { inView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@components/ui/sheet'
import { PATH_NAME } from '@lib/utils/constants/path'

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
        <div className={cn('container flex h-full items-center justify-between py-1')}>
          <GenuinLogo.text variant="black" />
          <div className="flex items-center gap-x-2">
            <Button variant="outline" outlineColor="black" size="sm">
              <p className="text-new-sm">We're hiring!</p>
            </Button>
            <Button size="sm" className="bg-monochrome-black">
              <p className="text-new-sm">Download Genuin</p>
            </Button>
          </div>
        </div>
      </nav>
      <nav className="absolute top-0 z-10 m-auto h-navbar w-full lg:hidden ">
        <div className={cn('container flex h-full items-center justify-between py-1 pl-2')}>
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
                  <Button className="my-2 w-full bg-monochrome-black">
                    <p className="text-new-md">Download Genuin</p>
                  </Button>
                  <Link href="https://careers.begenuin.com">
                    <p className="font-semibold " style={{ fontSize: '28px', lineHeight: '120%' }}>
                      Careers
                    </p>
                  </Link>
                  <Link href={PATH_NAME.terms}>
                    <p className="font-semibold " style={{ fontSize: '28px', lineHeight: '120%' }}>
                      Terms of Service
                    </p>
                  </Link>
                  <Link href={PATH_NAME.privacy}>
                    <p className="font-semibold " style={{ fontSize: '28px', lineHeight: '120%' }}>
                      Privacy Policy
                    </p>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}
