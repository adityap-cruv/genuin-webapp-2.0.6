'use client'
import { TopBar } from '@components/layouts/desktop/top-bar'
import { NavBar } from '@components/pages/home/nav-bar'
import { Button } from '@components/ui/button'
import imgPuppet from '@images/not-found/puppet.svg'
import { ContactUs } from './modals/contact-us'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function BrandNotFound() {
  const { isMobile } = useGenuinOptions((state) => ({ isMobile: state.isMobile }))
  return (
    <>
      {isMobile ? (
        <>
          <NavBar />
          <div className="container -mt-20  h-screen  p-8 pb-0 pt-28">
            <div className="flex h-full flex-col items-center justify-center rounded-t-3xl">
              <p className="mb-4 text-center text-new-h2-mobile">This URL doesn't exist...yet</p>
              <p className="mb-10 text-center text-body-1-med">
                The URL you are attempting to access is not found. But, you can claim it and make it yours!
              </p>
              <img src={imgPuppet.src} alt="genuin" className="mb-10 h-60" />
              <div>
                <ContactUs>
                  <Button
                    variant="default"
                    size={'custom'}
                    className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                    <p className="text-new-para-2 font-semibold">Contact Us</p>
                  </Button>
                </ContactUs>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          <TopBar />
          <div className="container relative -mt-20 flex h-screen w-3/5 items-center">
            <div>
              <p className="mb-6 text-new-h2">This URL doesn't exist...yet</p>
              <p className="mb-10 text-title-1-bold font-medium">
                The URL you are attempting to access is not found. But, you can claim it and make it yours!
              </p>
              <ContactUs>
                <Button variant="default" size={'custom'} className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                  <p className="text-new-para-2 font-semibold">Contact Us</p>
                </Button>
              </ContactUs>
              <img src={imgPuppet.src} alt="genuin" className="absolute bottom-0 right-0" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
