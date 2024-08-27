'use client'
import { HamBurgerMenuIcon } from '@/components/ui/ham-burger'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import { GenuinIcon } from '@icons/genuin-icon'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const pathName = usePathname()

  return (
    <nav className="sticky top-0 z-50 h-[60px] w-full bg-monochrome-white md:h-[90px]">
      <div className="container flex h-full items-center " style={{ maxWidth: 1200 }}>
        <div className="flex w-full justify-center md:justify-normal">
          <Link href={"/"}>
            <GenuinIcon.logo className="fill-primary" />
          </Link>
          <div className="hidden w-full items-center justify-evenly px-10 text-cap-1-demi-home md:flex">
            <Link
              href={PATH_NAME.index()}
              className={cn(
                'whitespace-nowrap hover:font-extrabold hover:text-primary',
                pathName === PATH_NAME.index() && 'font-extrabold text-primary'
              )}>
              For Media Networks
            </Link>
            <Link
              href={PATH_NAME.brands()}
              className={cn(
                'whitespace-nowrap hover:font-extrabold hover:text-primary',
                pathName === PATH_NAME.brands() && 'font-extrabold text-primary'
              )}>
              For Brands
            </Link>
            <Link
              href={PATH_NAME.creators()}
              className={cn(
                'whitespace-nowrap hover:font-extrabold hover:text-primary',
                pathName === PATH_NAME.creators() && 'font-extrabold text-primary'
              )}>
              For Creators
            </Link>
          </div>
        </div>
        <SideModal />
        {pathName !== PATH_NAME.privacy && pathName !== PATH_NAME.terms && (
          <div className="hidden items-center md:flex ">
            <Link href="/about" className="whitespace-nowrap px-6 text-cap-1-demi-home">
              About us
            </Link>
            <Link
              href="/explore"
              className="rounded-full border px-6 py-4 text-cap-1-bold-home hover:border-primary hover:bg-primary hover:text-monochrome-white">
              <p className="whitespace-nowrap">Discover Communities</p>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

function SideModal() {
  const pathName = usePathname()
  return (
    <Sheet>
      <SheetTrigger className="block md:hidden">
        <HamBurgerMenuIcon toggleToClose={false} />
      </SheetTrigger>
      <SheetContent className="font-manrope flex w-full min-w-full flex-col gap-0 border-none p-0 pt-10 text-cap-1-demi-home">
        <Link
          href={PATH_NAME.index()}
          className={cn(
            'w-full whitespace-nowrap px-6 py-4',
            pathName === PATH_NAME.index() && 'bg-[#F7F9FC] font-extrabold text-primary'
          )}>
          For Media Networks
        </Link>
        <Link
          href={PATH_NAME.brands()}
          className={cn(
            'whitespace-nowrap px-6 py-4 hover:font-extrabold hover:text-primary',
            pathName === PATH_NAME.brands() && 'bg-[#F7F9FC] font-extrabold text-primary'
          )}>
          For Brands
        </Link>
        <Link
          href={PATH_NAME.creators()}
          className={cn(
            'whitespace-nowrap px-6 py-4 hover:font-extrabold hover:text-primary',
            pathName === PATH_NAME.creators() && 'bg-[#F7F9FC] font-extrabold text-primary'
          )}>
          For Creators
        </Link>
        <Link
          href={PATH_NAME.discover()}
          className={cn(
            'whitespace-nowrap px-6 py-4 hover:font-extrabold hover:text-primary',
            pathName === PATH_NAME.discover() && 'bg-[#F7F9FC] font-extrabold text-primary'
          )}>
          Discover Communities
        </Link>
        <Link
          href={PATH_NAME.about()}
          className={cn(
            'whitespace-nowrap px-6 py-4 hover:font-extrabold hover:text-primary',
            pathName === PATH_NAME.about() && 'bg-[#F7F9FC] font-extrabold text-primary'
          )}>
          About us
        </Link>
        <div className="absolute bottom-0 flex w-full items-center justify-center bg-[#D0DCFF] py-6">
          <ContactUs>
            <Button className="flex gap-2 rounded-full px-4 py-3">
              <p className="text-cap-1-bold-home font-extrabold">Book a demo</p>
              <ArrowRight />
            </Button>
          </ContactUs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
