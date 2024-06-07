'use client'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import { GenuinIcon } from '@icons/genuin-icon'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'

export function HomeNavBar() {
  return (
    <nav className="sticky top-0 z-50 h-navbar w-full bg-white-alpha backdrop-blur-20px">
      <div className="containerHome flex h-full w-full items-center justify-between">
        <Link href={PATH_NAME.index()}>
          <GenuinIcon.logo className="fill-primary" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href={PATH_NAME.about()}>
            <p className="text-center text-cap-1-home text-home-black_70 transition-all duration-200 hover:scale-110 hover:text-home-black md:min-w-[100px]">
              About us
            </p>
          </Link>
          <ContactUs>
            <Button
              variant={'outline'}
              size={'custom'}
              className="hidden rounded-[35px] px-6 py-3.5 text-cap-1-bold-home hover:bg-home-black hover:text-monochrome-white md:flex">
              Book a demo
            </Button>
          </ContactUs>
        </div>
      </div>
    </nav>
  )
}
