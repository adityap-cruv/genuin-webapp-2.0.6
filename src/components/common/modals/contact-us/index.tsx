import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent } from '@components/ui/dialog'
import { ModalForm } from './modal-form'
import icSuccess from '@icons/icSuccess.svg'

type Props = {
  children: React.ReactNode
}

export function ContactUs({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-t-2xl">
        <DownloadAppForm />
      </DialogContent>
    </Dialog>
  )
}

export default function DownloadAppForm() {
  const [isLinkSent, setIsLinkSent] = useState(false)

  return (
    <>
      <div className="hidden md:block">
        {isLinkSent ? (
          <div className="m-8 flex h-80 flex-col items-center justify-center gap-4 sm:w-[600px] md:w-[800px]">
            <img className="h-28" alt="genuin" src={icSuccess.src} />
            <p className="text-center text-new-h2-mobile font-semibold">
              Thank you for your interest.
              <br /> Our team will contact you shortly!
            </p>
          </div>
        ) : (
          <div className="m-8 flex justify-around gap-12 sm:w-[600px] md:w-[800px]">
            <div className="w-1/2">
              <h3 className="text-new-h1" style={{ fontSize: '56px' }}>
                Get in touch with an expert. Talk with sales.
              </h3>
              <p className="my-4 text-new-para-1">
                Enter your details and a member of our team will contact you shortly.
              </p>
            </div>
            <div className="w-1/2">
              <ModalForm setIsLinkSent={setIsLinkSent} />
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
        {isLinkSent ? (
          <div className="hide-scrollbar m-4 flex h-[50vh] max-h-[70vh] flex-col items-center justify-center gap-4 overflow-auto p-2">
            <img
              className="h-28"
              alt="genuin"
              src="https://s3-alpha-sig.figma.com/img/e85a/0248/eae94be2998af4b960adff36d72727aa?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=lxldO4uMhIQCFIw3z4qNXRpt7kt~2etnssF7rG77amPto0gEmge94Qm0pWtuQJVybSaHIZFJ0RdajvasZQO0ReexhtQKVHgEIl5NMF17w-kDDWVfsLVBKtnSePE76m0X4x~prjFgiVUGohAKW7qx0jksHGsHddeIjzdhUOCBqGIwLNNTJ8CiVMfpLzImtIuVh9E2viYK76UzjUCuHgsorXldtQxY-6wjODR2BLHxShZYbFQGeFX6dgK1qhTsv7AkhFxiT7pvpAw5xXLtIj2Eu9Zugy1MIACqy1KYZe8ZbiqDj8Jhnv2MCx00RzLxZuA43X27tMsUxVBeiH-nHSraVw__"
            />
            <p className="text-center text-new-h3-mobile font-semibold">
              Thank you for your interest. Our team will contact you shortly!
            </p>
          </div>
        ) : (
          <div className="hide-scrollbar m-4 max-h-[70vh] gap-12 overflow-auto p-2">
            <div>
              <h3 className="text-new-h2-mobile">Get in touch with an expert. Talk with sales.</h3>
              <p className="my-4 text-new-sm">Enter your details and a member of our team will contact you shortly.</p>
            </div>
            <ModalForm setIsLinkSent={setIsLinkSent} />
          </div>
        )}
      </div>
    </>
  )
}
