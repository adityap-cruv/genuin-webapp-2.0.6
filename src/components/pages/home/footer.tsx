'use client'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { DownloadAppDialog } from './download-app-dialog'
import { ContactUs } from '../../common/modals/contact-us'
import { MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'
import { GenuinIcon } from '@icons/genuin-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import content from '../../../content/footer.json'

export function Footer() {
  return (
    <>
      <footer className="relative hidden bg-primary lg:block">
        <div className="mx-20 flex h-full flex-col gap-y-6 xl:container">
          <div className="flex w-full items-end pb-6 pt-7">
            <div className="flex w-full flex-col gap-y-8 pt-10">
              <h2 className="text-new-h2 text-new-off-white">Join the world of Genuin.</h2>
              <h5 className="mr-6 max-w-3xl text-new-para-1 text-new-off-white">
                Download the app to join communities across brands and add to the conversation. Don’t see a community
                that speaks to you? Start your own!
              </h5>
            </div>
            <DownloadButton />
          </div>
          <div
            className="flex flex-col gap-y-10 bg-new-off-black px-20 pb-8 pt-12 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinIcon.text className="fill-new-off-white" />
            <div className="flex justify-between text-new-para-1">
              <div className="flex items-end">
                <p>© 2023 Genuin Inc.</p>
              </div>
              <div className="flex gap-x-32 hover:[&>a>p]:text-primary">
                <div className="flex flex-col gap-3">
                  <p className="text-title-2-demi">Solutions</p>
                  {content?.solutions?.map(({ url, title }, index) => (
                    <Link key={index} href={url}>
                      <p className="text-new-para-1 text-monochrome-7">{title}</p>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-title-2-demi">Company</p>
                  {content?.company?.map(({ url, title }, index) => (
                    <Link key={index} href={url}>
                      <p className="text-new-para-1 text-monochrome-7">{title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <footer className="relative bg-primary lg:hidden">
        <div className="mx-2 flex h-full flex-col gap-y-6 sm:mx-15">
          <div className="mt-14 flex flex-col items-center justify-center gap-y-2">
            <p className="max-w-[230px] text-center text-new-h2-mobile text-new-off-white">Join the world of Genuin.</p>
            <div className="mt-3">
              <DownloadButton />
            </div>
          </div>
          <div
            className="mt-10 flex items-center justify-between gap-y-10 bg-new-off-black p-5 px-8 text-primary-foreground"
            style={{ borderRadius: '20px 20px 0px 0px' }}>
            <GenuinIcon.text className="w-20 fill-new-off-white" />
            <p className="text-new-para-2-mobile sm:text-new-para-2">© 2023 Genuin Inc.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function DownloadButton() {
  const isMobile = useGenuinOptions().isMobile

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
    <ContactUs>
      <Button
        size="index-page"
        variant="default"
        className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
        <p className="whitespace-nowrap text-new-sm text-new-off-white">Contact Us</p>
      </Button>
    </ContactUs>
  )
}
