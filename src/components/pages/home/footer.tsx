'use client'
import { Button } from '@components/ui/button'
import { GenuinText } from '@components/ui/genuin-logo'
import Link from 'next/link'
import { DownloadAppDialog } from './download-app-dialog'
import { MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'

type Props = {
  isMobile: boolean
}

export function Footer({ isMobile }: Props) {
  return (
    <>
      <footer className="relative hidden bg-primary lg:block">
        <div className="mx-20 flex h-full flex-col gap-y-6">
          <div className="flex w-full items-end pb-6 pt-7">
            <div className="flex w-full flex-col gap-y-8 pt-24">
              <h2 className="text-new-h2 text-new-off-white">Join the world of Genuin.</h2>
              <h5 className="mr-6 max-w-2xl text-new-h5 text-new-off-white">
                Download the app to join communities and add to the conversation. Don’t see a community that speaks to
                you? Start your own!
              </h5>
            </div>
            <DownloadButton isMobile={isMobile} />
          </div>
          <div
            className="flex flex-col gap-y-10 bg-new-off-black px-20 pb-8 pt-12 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinText variant="light" />
            <div className="flex justify-between text-new-para-1">
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
        <div className="mx-2 flex h-full flex-col gap-y-6 sm:mx-15">
          <div className="mt-5 flex flex-col items-center justify-center gap-y-2">
            <p className="max-w-[230px] text-center text-new-h2-mobile text-new-off-white">Join the world of Genuin.</p>
            <div className="mt-3">
              <DownloadButton isMobile={isMobile} />
            </div>
          </div>
          <div
            className="mt-5 flex items-center justify-between gap-y-10 bg-new-off-black p-5 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinText variant="light" />
            <p className="text-new-para-2-mobile sm:text-new-para-2">© 2023 Genuin Inc.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

type DownloadButtonProps = {
  isMobile: boolean
}

function DownloadButton({ isMobile }: DownloadButtonProps) {
  return isMobile ? (
    <Link href={MOBILE_DOWNLOAD_APP_LINK}>
      <Button
        size="index-page"
        variant="default"
        className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
        <p className="whitespace-nowrap text-new-md text-new-off-white">Download Genuin</p>
      </Button>
    </Link>
  ) : (
    <DownloadAppDialog>
      <Button
        size="index-page"
        variant="default"
        className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
        <p className="whitespace-nowrap text-new-md text-new-off-white">Download Genuin</p>
      </Button>
    </DownloadAppDialog>
  )
}
