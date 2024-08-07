'use client'
import { cn } from '@/lib/utils'
import { ContactUs } from '@components/common/modals/contact-us'
import { GenuinIcon } from '@icons/genuin-icon'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'
import { type ComponentProps } from 'react'

const footerLinks = [
  {
    title: 'About',
    pathname: PATH_NAME.about(),
  },
  {
    title: 'Contact',
    comp: (
      <ContactUs>
        <p className="text-cap-1-home text-monochrome-white transition-all hover:font-bold">Contact</p>
      </ContactUs>
    ),
  },
  {
    title: 'Terms and Services',
    pathname: PATH_NAME.terms,
  },
  {
    title: 'Privacy Policy',
    pathname: PATH_NAME.privacy,
  },
]

export function Footer({ className, ...restProps }: ComponentProps<'div'>) {
  return (
    <div className={cn('bg-home-black', className)} {...restProps}>
      <div className="container flex h-full w-full flex-col items-center justify-between py-24 md:flex-row">
        <Link href={PATH_NAME.index()} className="hidden md:block">
          <GenuinIcon.logo className="fill-monochrome-white" />
        </Link>
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
          {footerLinks.map((item, index) => {
            if (item.pathname)
              return (
                <Link key={index} href={item.pathname}>
                  <p className="text-cap-1-home text-monochrome-white transition-all hover:font-bold">{item.title}</p>
                </Link>
              )
            return item.comp
          })}
        </div>
        <Link href={PATH_NAME.index()} className="block md:hidden">
          <GenuinIcon.logo className="mt-14 fill-monochrome-white " />
        </Link>
      </div>
    </div>
  )
}
