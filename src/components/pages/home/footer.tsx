'use client'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import Link from 'next/link'

export function Footer() {
  return (
    <>
      <footer className="relative hidden bg-primary lg:block">
        <div className="container flex h-full flex-col gap-y-6">
          <div className="flex w-full items-end pt-7">
            <div className="flex w-full flex-col gap-y-2">
              <p className="text-new-index-title text-monochrome-white">Join the world of Genuin.</p>
              <p className="max-w-2xl text-new-lg text-monochrome-white">
                Download the app to join communities and add to the conversation. Don’t see a community that speaks to
                you? Start your own!
              </p>
            </div>
            <Button variant="default" className="bg-monochrome-black">
              <p className="whitespace-nowrap text-new-md">Download Genuin</p>
            </Button>
          </div>
          <div
            className="flex flex-col gap-y-10 bg-monochrome-black px-4 pb-8 pt-5 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinLogo.text variant="light" />
            <div className="flex justify-between text-title-md ">
              <div>
                <p>© 2023 Genuin Inc.</p>
              </div>
              <div className="flex gap-x-2 hover:[&>a>p]:text-primary">
                <Link href="https://careers.begenuin.com">
                  <p>Careers</p>
                </Link>
                <Link href={{ pathname: '/terms' }}>
                  <p>Terms of Service</p>
                </Link>
                <Link href={{ pathname: '/privacy' }}>
                  <p>Privacy Policy</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <footer className="relative bg-primary lg:hidden">
        <div className="container flex h-full flex-col gap-y-6">
          <div className="mt-5 flex flex-col items-center justify-center gap-y-2">
            <p className="text-center text-new-index-title-mobile text-monochrome-white">Join the world of Genuin.</p>
            <Button variant="default" className="mt-3 bg-monochrome-black">
              <p className="whitespace-nowrap text-new-md">Download Genuin</p>
            </Button>
          </div>
          <div
            className="mt-5 flex justify-between gap-y-10 bg-monochrome-black px-2 pb-8 pt-5 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinLogo.text variant="light" />
            <p>© 2023 Genuin Inc.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
