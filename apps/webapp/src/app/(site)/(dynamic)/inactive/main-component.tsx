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
        style={{ backgroundImage: `url(${errorBg})` }}>
        <span className="absolute top-[20%] left-[15%]">
          <p
            className="text-start"
            style={{ fontSize: '48px', lineHeight: '110%', fontWeight: 700, letterSpacing: '-0.96px' }}>
            Page not found
          </p>
          <p className="text-title-2-demi pt-6 text-start font-medium">
            The service or webpage you are trying to access is no longer
            <br /> available. If you believe this is an error or have any questions,
            <br /> please contact{' '}
            <a href="mailto: support@begenuin.com" className="text-blue underline">
              support@begenuin.com
            </a>
            .
          </p>
        </span>
        <Image
          src={imgPuppet}
          width={0}
          height={0}
          alt="imgPuppet"
          className="absolute right-[20%] bottom-0 h-auto w-48"
        />
        <p className="text-body-1-demi text-monochrome absolute bottom-2 left-2">
          © {new Date().getFullYear()} Genuin Inc.
        </p>
      </div>

      {/* Mobile */}
      <div className="h-full w-full md:hidden">
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-8 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${errorBg})` }}>
          <span>
            <p className="text-new-h2-mobile text-center">Page not found</p>
            <p className="text-body-1-med px-4 pt-6 text-center">
              The service or webpage you are trying to access is no longer available. If you believe this is an error or
              have any questions, please contact{' '}
              <a href="mailto: support@begenuin.com" className="text-blue underline">
                support@begenuin.com
              </a>
              .
            </p>
          </span>
          <Image src={imgPuppet} width={0} height={0} alt="imgPuppet" className="h-auto w-32" />
          <p className="text-body-1-demi text-monochrome absolute bottom-2 left-2">
            © {new Date().getFullYear()} Genuin Inc.
          </p>
        </div>
      </div>
    </main>
  )
}

export default MainComponent
