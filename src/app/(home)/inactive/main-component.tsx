'use client'
import errorBg from '@images/error/errorDesktop.svg'
import imgPuppet from '@images/not-found/puppet.svg'
import Image from 'next/image'

const MainComponent = () => {
  return (
    <main className="h-full w-full">
      {/* Desktop */}
      <div
        className="relative hidden h-full w-full bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: `url(${errorBg.src})` }}>
        <span className="absolute left-[15%] top-[20%]">
          <p
            className="text-start"
            style={{ fontSize: '48px', lineHeight: '110%', fontWeight: 700, letterSpacing: '-0.96px' }}>
            Page not found
          </p>
          <p className="pt-6 text-start text-title-2-demi font-medium">
            The service or webpage you are trying to access is no longer
            <br /> available. If you believe this is an error or have any questions,
            <br /> please contact{' '}
            <a href="mailto: support@begenuin.com" className="text-blue underline">
              support@begenuin.com
            </a>
            .
          </p>
        </span>
        <Image src={imgPuppet} alt="imgPuppet" className="absolute bottom-0 right-[20%] h-auto w-48" />
        <p className="absolute bottom-2 left-2 text-body-1-demi text-monochrome">© 2024 Genuin Inc.</p>
      </div>

      {/* Mobile */}
      <div className="h-full w-full p-7 md:hidden">
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-8 rounded-3xl bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${errorBg.src})` }}>
          <span>
            <p className="text-center text-new-h2-mobile">Page not found</p>
            <p className="px-4 pt-6 text-center text-body-1-med">
              The service or webpage you are trying to access is no longer available. If you believe this is an error or
              have any questions, please contact{' '}
              <a href="mailto: support@begenuin.com" className="text-blue underline">
                support@begenuin.com
              </a>
              .
            </p>
          </span>
          <Image src={imgPuppet} alt="imgPuppet" className="h-auto w-32" />
        </div>
      </div>
    </main>
  )
}

export default MainComponent
