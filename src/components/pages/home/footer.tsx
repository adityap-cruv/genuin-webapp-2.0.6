'use client'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative bg-primary">
      <div className="container flex h-full flex-col gap-y-6">
        <div className="flex w-full items-end pt-7">
          <div className="flex w-full flex-col gap-y-2">
            <p className="text-new-index-title text-monochrome-white">Join the world of Genuin.</p>
            <p className="text-new-lg max-w-2xl text-monochrome-white">
              Download the app to join communities and add to the conversation. Don’t see a community that speaks to
              you? Start your own!
            </p>
          </div>
          <Button variant="default" className="bg-monochrome-black">
            <p className="text-new-md whitespace-nowrap">Download Genuin</p>
          </Button>
        </div>
        <div
          className="flex flex-col gap-y-10 bg-monochrome-black pb-8 pt-5 text-primary-foreground"
          style={{ borderRadius: '20px 20px 0px 0px' }}>
          <GenuinLogo.text variant="light" />
          <div className="flex justify-between px-6 text-title-lg">
            <div>
              <p>© 2023 Genuin Inc.</p>
            </div>
            <div className="flex gap-x-2">
              <Link href="/">
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
  )
}
