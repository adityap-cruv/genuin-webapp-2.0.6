import { cn } from '@/lib/utils'
// import { PATH_NAME } from '@/lib/paths'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { type ComponentProps } from 'react'
// import { GenuinIcon } from '../old/genuin-icon'
import { GenuinIcon } from '@icons/genuin-icon'
// import { ContactUs } from '../old/contact-us'
import { ContactUs } from '../common/modals/contact-us'
import { Fragment } from 'react'

export function Footer({ className, ...restProps }: ComponentProps<'div'>) {
  const footerLinks = [
    {
      title: 'About',
      pathname: PATH_NAME.about(),
    },
    {
      title: 'Contact',
      comp: (
        <ContactUs>
          <p className="text-white text-cap-1-home transition-all hover:text-blue">Contact</p>
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

  return (
    <div className={cn('bg-[#090A1B] py-[36px] md:py-[60px] ', className)} {...restProps}>
      <div className="container flex h-full w-full flex-col items-center justify-between md:flex-row">
        <Link href={PATH_NAME.index()} className="hidden md:block">
          <GenuinIcon.logo className="fill-white" />
        </Link>
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
          {footerLinks.map((item, index) => {
            if (item.pathname)
              return (
                <Link key={index} href={item.pathname}>
                  <p className="text-white text-cap-1-home transition-all hover:text-blue">{item.title}</p>
                </Link>
              )
            return <Fragment key={index}>{item.comp}</Fragment>
          })}
        </div>
        <Link href={PATH_NAME.index()} className="block md:hidden">
          <GenuinIcon.logo className="fill-white mt-14 " />
        </Link>
      </div>
    </div>
  )
}
