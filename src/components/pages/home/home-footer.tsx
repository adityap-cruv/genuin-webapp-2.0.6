'use client'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'
import { GenuinIcon } from '@icons/genuin-icon'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'

export function HomeFooter() {
  const footerLinks = [
    {
      title: 'Company',
      pathname: PATH_NAME.about(),
    },
    {
      title: 'Contact',
      pathname: '',
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
    <div className="bg-[#D0DCFF]">
      <div className="container hidden h-full w-full items-center justify-between py-24 md:flex">
        <Link href={PATH_NAME.index()}>
          <GenuinIcon.logo className="fill-primary" />
        </Link>
        <div className="flex gap-2">
          {footerLinks.map((item, index) => (
            <div key={index}>
              {item.title === 'Contact' ? (
                <ContactUs>
                  <Button
                    variant={'outline'}
                    size={'custom'}
                    className="text-home-black_70 hover:text-home-black mx-6 my-3.5 rounded-[35px] border-0 transition-all duration-200 hover:scale-110 ">
                    <p className="text-cap-1-home">{item.title}</p>
                  </Button>
                </ContactUs>
              ) : (
                <Link href={item.pathname}>
                  <Button
                    variant={'outline'}
                    size={'custom'}
                    className="text-home-black_70 hover:text-home-black mx-6 my-3.5 rounded-[35px] border-0 transition-all duration-200 hover:scale-110 ">
                    <p className="text-cap-1-home">{item.title}</p>
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-full w-full flex-col-reverse items-center justify-between gap-9 pb-24 pt-9 md:hidden">
        <Link href={PATH_NAME.index()}>
          <GenuinIcon.logo className="fill-primary" />
        </Link>{' '}
        <div className="flex flex-col items-center gap-2">
          {footerLinks.map((item, index) => (
            <div key={index}>
              {item.title === 'Contact' ? (
                <ContactUs>
                  <Button variant={'outline'} size={'custom'} className="mx-6 my-3.5 rounded-[35px] border-0">
                    <p className="text-cap-1-home">{item.title}</p>
                  </Button>
                </ContactUs>
              ) : (
                <Link href={item.pathname}>
                  <Button variant={'outline'} size={'custom'} className="mx-6 my-3.5 rounded-[35px] border-0">
                    <p className="text-cap-1-home">{item.title}</p>
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
