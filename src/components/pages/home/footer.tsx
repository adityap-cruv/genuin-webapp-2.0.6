'use client'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import Link from 'next/link'

export function Footer() {
  return (
    <>
      <footer className="relative hidden bg-primary lg:block">
        <div className="container flex h-full flex-col gap-y-6">
          <div className="flex w-full items-end pb-6 pt-7">
            <div className="flex w-full flex-col gap-y-2 pt-24">
              <h2 className="text-new-h2 text-new-off-white">Join the world of Genuin.</h2>
              <h5 className="max-w-3xl text-new-h5 text-new-off-white">
                Download the app to join communities and add to the conversation. Don’t see a community that speaks to
                you? Start your own!
              </h5>
            </div>
            <Button
              size="index-page"
              variant="default"
              className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
              <p className="whitespace-nowrap text-new-md text-new-off-white">Download Genuin</p>
            </Button>
          </div>
          <div
            className="flex flex-col gap-y-10 bg-new-off-black px-20 pb-8 pt-12 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinLogo.text variant="light" />
            <div className="flex justify-between font-semibold" style={{ fontSize: '20px', lineHeight: '110%' }}>
              <div>
                <p>© 2023 Genuin Inc.</p>
              </div>
              <div className="flex gap-x-10 hover:[&>a>p]:text-primary">
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
            <p className="text-center text-new-h2-mobile text-new-off-white">Join the world of Genuin.</p>
            <Button
              size="index-page"
              variant="default"
              className="mt-3 bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
              <p className="whitespace-nowrap text-new-md text-new-off-white">Download Genuin</p>
            </Button>
          </div>
          <div
            className="mt-5 flex items-center justify-between gap-y-10 bg-new-off-black p-5 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinLogo.text variant="light" />
            <p>© 2023 Genuin Inc.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
