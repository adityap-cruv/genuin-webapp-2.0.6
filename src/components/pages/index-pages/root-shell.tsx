import { NavBar } from './nav-bar'
import bg from '@images/home/backgrounds/bgLines.svg'
import icCommunity from '@images/home/icon-community.svg'
import icGraph from '@images/home/icon-graph.svg'
import icVideo from '@images/home/icon-video.svg'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image, { type StaticImageData } from 'next/image'

type RootShellProps = {
  children?: React.ReactNode
  bgGrad: string
  genuinLogo: StaticImageData
  initialComponent: React.ReactNode
}

// TODO: Improve this components.
export function RootShell({ children, bgGrad, genuinLogo, initialComponent }: RootShellProps) {
  return (
    <>
      <NavBar />
      <div
        className="relative w-full bg-none bg-cover bg-center bg-no-repeat py-4 md:h-body"
        style={{
          backgroundImage: `url(${bg.src})`,
        }}>
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            background: bgGrad,
          }}
        />
        <motion.div
          initial={{ rotate: 270, opacity: 0 }}
          animate={{ rotate: 360, opacity: 1, transition: { duration: 0.5 } }}
          className="absolute bottom-0 right-0 aspect-square bg-cover bg-right bg-no-repeat">
          <Image src={genuinLogo} height={800} width={800} alt="genuin-logo" />
        </motion.div>
        <CustomAnimatedLogos className="absolute left-[32vw] top-[6vh] z-0 hidden -translate-y-20 translate-x-10 duration-3000 md:block">
          <img src={icCommunity.src} alt="community" className="h-14" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos className="absolute left-[7vw] top-[44vh] z-0 hidden  -translate-x-28 translate-y-16 duration-3000 md:block">
          <img src={icGraph.src} alt="graph" className="h-9" />
        </CustomAnimatedLogos>

        <CustomAnimatedLogos className="absolute bottom-[8vh] left-[26vw] z-0 hidden translate-x-32 translate-y-20 duration-3000 md:block">
          <img src={icVideo.src} alt="video" className="h-12" />
        </CustomAnimatedLogos>
        {initialComponent}
      </div>
      {children}
    </>
  )
}

interface CustomAnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animationClass?: string
}

function CustomAnimatedLogos({ children, className, animationClass }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref}>
      <span
        className={`${className} block transition-all ${
          isInView ? `${animationClass} transform-none opacity-100` : 'transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}
