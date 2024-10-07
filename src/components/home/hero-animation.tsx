import React, { type ComponentProps, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'
import { PowerAI } from './power-ai'
import { Revenue } from './revenue'
import { cn } from '@/lib/utils'
import { VanillaPlayer } from './vanilla-player'
// import { ContactUs } from '../old/contact-us'
import { ContactUs } from '../common/modals/contact-us'
import { Network } from './network'
import { ForthLayer, ForthLayerForMobile } from './forth-layer'
import youtubeImg from '@images/socials/youtube.svg'
import instagramImg from '@images/socials/instagram.svg'
import tiktokImg from '@images/socials/tiktok.svg'
import pinterestImg from '@images/socials/pinterest.svg'
import icArrowUp from '@icons/icArrowUpRed.svg'
import icArrowDown from '@icons/icArrowDownRed.svg'
import icArrowUpGreen from '@icons/icArrowUpGreen.svg'
import icBarGreen from '@icons/icBarGreen.svg'
import icGraphArrow from '@icons/icGraphArrow.svg'
import icGraphArrowUserGreen from '@icons/icGraphArrowUserGreen.svg'

import { VideoPlayerDialog } from './watch-explainer'
import CustomButton from '../custom/custom-button'

const poppinsFont = Poppins({ weight: ['700', '900', '600'], subsets: ['latin'], style: 'normal', preload: true })

export function HeroAnimation({
  children,
  className,
  mobileView,
  ...restProps
}: ComponentProps<'div'> & { mobileView: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [masterTimeline, setMasterTimeline] = React.useState<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const matchMedia = gsap.matchMedia()
      gsap.to('#others', { scrollTrigger: { trigger: '#others', pinSpacing: true } })
      matchMedia.add('(min-width: 1074px)', () => {
        const masterTimeline = gsap.timeline({
          scrollTrigger: {
            start: 'top top',
            end: '600% top',
            scrub: 0.5,
            pin: '#hero-animation',
            id: 'master-scroll',
          },
        })

        masterTimeline
          .to('#image-element-wrapper', { scale: 0.8 })
          .to('#image-element', { borderRadius: '50px' }, '<')
          .to('#image-element', { scale: 0.9 })

        masterTimeline.to('#first-layer', {
          opacity: 0,
        })

        masterTimeline
          .set('.border-ticks', { display: 'flex' })
          .set('#second-layer', { display: 'flex' })
          .to('#second-layer', { opacity: 1 })
          .to('.border-ticks', { opacity: 1 }, '<')
          .to('#second-layer-text', { text: { value: 'FROM COST' } }, '<')
          .to('#second-layer', { opacity: 0 })
          .to('.border-ticks', { opacity: 0 }, '<')

        masterTimeline
          .set('.second-border-ticks', { display: 'flex' })
          .set('#third-layer', { display: 'flex' })
          .to('#third-layer', { text: { value: 'TO REVENUE' } })
          .to('.second-border-ticks', { opacity: 1, scale: 1 }, '<')
          .to('#third-layer', { opacity: 0 })
          .to(
            '.second-border-ticks',
            {
              opacity: 0,
            },
            '<'
          )

        masterTimeline
          .set('#forth-layer', { display: 'flex' })
          .set('#embed-element-background', {
            height: window.innerHeight * 0.95,
            width: window.innerHeight * 0.95 * (9 / 16) * 2,
          })
          .set('#embed-element', {
            height: window.innerHeight * 0.7,
            width: window.innerHeight * 0.7 * (9 / 16),
          })
          .to('#image-element', {
            x: () => {
              const embedElement = document.getElementById('embed-element')
              if (!embedElement) return 0
              return embedElement.getBoundingClientRect().left + window.scrollX
            },
            y: () => {
              const embedElement = document.getElementById('embed-element')
              if (!embedElement) return 0
              return embedElement.getBoundingClientRect().top + window.scrollY
            },
            height: window.innerHeight * 0.7,
            width: window.innerHeight * 0.7 * (9 / 16),
            scale: 1,
            borderRadius: 20,
          })
          .to('#image-element-wrapper', { scale: 1 }, '<')
          .to('.embed-background', {
            opacity: 1,
          })
          .set('#embed-swiper', { zIndex: 1 })
          .to('#embed-swiper', {
            opacity: 1,
            onComplete: () => {
              gsap.set('#forth-layer', { zIndex: 0 })
            },
          })
          .set('#image-element', { zIndex: -1 })

        masterTimeline.to('.embed-first-stage', {
          opacity: 0,
        })

        setMasterTimeline(masterTimeline)
      })
      matchMedia.add('(max-width: 1073px)', () => {
        const masterTimeline = gsap.timeline({
          // scrollTrigger: {
          //   start: 'top top',
          //   end: '100% bottom',
          //   pin: '#hero-animation',
          //   id: 'master-scroll',
          // },
        })
        setMasterTimeline(masterTimeline)
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-x-clip', className)} {...restProps}>
      <div id="hero-animation" className="h-full w-full" style={{ backgroundColor: '#CDDAFF' }}>
        <div id="image-element-wrapper" className="h-full w-full">
          <div className="absolute inset-0 h-full w-full overflow-clip lg:-z-[-1]" id="image-element">
            <VanillaPlayer
              considerViewPort={false}
              videoSource="https://media.begenuin.com/webapp_assets/v3/videos/hero-video/hero_video.m3u8"
              poster="https://media.begenuin.com/webapp_assets/v3/videos/hero-video/thumbnail.png"
              className="h-full w-full object-cover"
              shouldPlay
              loop
            />
            <div className="absolute inset-0 h-full w-full" style={{ backgroundColor: 'rgba(9, 10, 27, 0.40)' }} />
          </div>
          {!mobileView && <BorderTickList />}
          {!mobileView && <SecondBorderTickList />}
        </div>
        <FirstLayer id="first-layer" className="absolute" mobileView={mobileView} />
        {!mobileView && <SecondLayer id="second-layer" className="absolute hidden opacity-0" />}
        {!mobileView && <ThirdLayer id="third-layer" className="absolute hidden" />}
        {!mobileView && (
          <ForthLayer
            className="absolute hidden h-screen flex-col lg:flex-row"
            id="forth-layer"
            timeline={masterTimeline}
            mobileView={false}
          />
        )}
      </div>
      {mobileView && <ForthLayerForMobile id="forth-layer" className="h-screen" timeline={masterTimeline} />}
      <Revenue timeline={masterTimeline} mobileView={mobileView} />
      <PowerAI timeline={masterTimeline} mobileView={mobileView} />
      <Network timeline={masterTimeline} mobileView={mobileView} />
      {children}
    </div>
  )
}

function FirstLayer({ className, mobileView, ...restProps }: ComponentProps<'div'> & { mobileView: boolean }) {
  return (
    <div
      className={cn('inset-0 flex h-full w-full flex-col items-center justify-center gap-8', className)}
      {...restProps}>
      <div className="flex flex-col items-center gap-4 lg:gap-6">
        <h3
          className={cn('text-[20px] font-bold leading-none text-white lg:text-[24px]', poppinsFont.className)}
          style={{ letterSpacing: '3.6px' }}>
          VERTICAL
        </h3>
        <h1
          id="first-text"
          className="cursor-pointer text-center text-[44px] leading-none text-white lg:text-[100px]"
          style={{ ...poppinsFont.style, fontWeight: 900 }}>
          VIDEO-{mobileView && <br />}POWERED
          <br />
          COMMUNITIES
        </h1>
        <h2 className={cn('text-center text-[20px] font-semibold leading-none text-white lg:text-[36px]')}>
          {`that integrate into your own digital properties ${mobileView ? 'from cost to revenue' : ''} `}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <VideoPlayerDialog
          videoSrc={'https://genuin-qa-media.s3.us-west-2.amazonaws.com/webapp_assets/temp/final_final.mp4'}
        />
        <ContactUs asChild>
          <CustomButton
            variant="light"
            className="hidden rounded-full px-8 py-6 text-cap-1-bold-home font-bold hover:border hover:border-white lg:block lg:text-index-h5-extra-bold"
            radius="rounded-[36px]"
            showIcon>
            Connect with us
          </CustomButton>
        </ContactUs>
      </div>
    </div>
  )
}

function SecondLayer({ className, ...restProps }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('inset-0 m-auto flex h-full w-min flex-col items-center justify-center gap-14', className)}
      {...restProps}>
      <div className="flex w-full items-center justify-around">
        <div className="rounded-2xl border-2 border-white bg-white/20 p-4">
          <Image src={youtubeImg} height={48} width={48} alt="youtube" />
        </div>
        <div className="rounded-2xl border-2 border-white bg-white/20 p-4">
          <Image src={tiktokImg} height={48} width={48} alt="tiktok" />
        </div>
      </div>
      <h1
        id="second-layer-text"
        className="cursor-pointer whitespace-nowrap text-center leading-none text-white"
        style={{ ...poppinsFont.style, fontSize: 100, fontWeight: 900, height: '100px', width: '10ch' }}></h1>
      <div className="flex w-full items-center justify-around">
        <div className="rounded-2xl border-2 border-white bg-white/20 p-4">
          <Image src={instagramImg} height={48} width={48} alt="instagram" />
        </div>
        <div className="rounded-2xl border-2 border-white bg-white/20 p-4">
          <Image src={pinterestImg} height={48} width={48} alt="pinterest" />
        </div>
      </div>
    </div>
  )
}

function ThirdLayer({ className, id, ...restProps }: ComponentProps<'p'>) {
  return (
    <p
      id={id}
      className={cn(
        'inset-0 m-auto flex h-full w-min flex-col items-center justify-center  whitespace-nowrap ',
        poppinsFont.className,
        className
      )}
      style={{
        fontSize: 120,
        color: 'transparent',
        fontWeight: 900,
        lineHeight: '100%',
        textShadow: '10px 10px 100px #D0DCFF',
        background: 'linear-gradient(90deg, #FFF 33.15%, #EAD5FF 59.77%, #ADE2FF 86.03%)',
        backgroundClip: 'text',
      }}
      {...restProps}></p>
  )
}

function BorderTickList() {
  return (
    <>
      <BorderTick
        className="border-ticks z-10"
        style={{ transform: 'translate(-30%, 0)', top: '20%', color: '#F8987A' }}
        title="Higher CAC"
        icon={<Image src={icArrowUp} height={32} width={32} alt="arrow" />}
      />
      <BorderTick
        className="border-ticks z-10"
        style={{ transform: 'translate(-20%, 0)', top: '79%', color: '#F8987A' }}
        title="Lower ROI"
        icon={<Image src={icArrowDown} height={32} width={32} alt="arrow" />}
      />
      <BorderTick
        className="border-ticks z-10"
        style={{ transform: 'translate(15%, 0)', top: '15%', right: 0, color: '#F8987A' }}
        icon={<p style={{ color: '#F35421' }}>$$</p>}
        title="Boosting Required"
      />
      <BorderTick
        className="border-ticks z-10"
        style={{ transform: 'translate(25%, 0)', top: '65%', right: 0, color: '#F8987A' }}
        icon={<p style={{ color: '#F35421' }}>{'<2%'}</p>}
        title="Engagement"
      />
    </>
  )
}

function SecondBorderTickList() {
  return (
    <>
      <BorderTick
        className="second-border-ticks z-10 scale-0"
        style={{ transform: 'translate(-30%, 0)', top: '20%', color: '#A3DED5' }}
        title="Increase Conversion"
        icon={<Image src={icBarGreen} height={32} width={32} alt="arrow" />}
      />
      <BorderTick
        className="second-border-ticks z-10 scale-0"
        style={{ transform: 'translate(-20%, 0)', top: '79%', color: '#A3DED5' }}
        icon={<Image src={icArrowUpGreen} height={32} width={32} alt="arrow" />}
        title="Increase Media Revenue"
      />
      <BorderTick
        title="Increase Traffic"
        className="second-border-ticks z-10 scale-0"
        style={{ transform: 'translate(15%, 0)', top: '15%', right: 0, color: '#A3DED5' }}
        icon={<Image src={icGraphArrow} height={32} width={32} alt="graph" />}
      />
      <BorderTick
        className="second-border-ticks z-10 scale-0"
        title="Onsite Engagement"
        icon={<Image src={icGraphArrowUserGreen} height={32} width={32} alt="graph" />}
        style={{ transform: 'translate(25%, 0)', top: '65%', right: 0, color: '#A3DED5' }}
      />
    </>
  )
}

type BorderTickPropsType = ComponentProps<'div'> & { title: string; icon: React.ReactNode }
function BorderTick({ className, icon, title, ...restProps }: BorderTickPropsType) {
  return (
    <div
      className={cn('absolute hidden scale-0 items-center gap-2 rounded-xl bg-black px-8 py-4 opacity-0', className)}
      {...restProps}>
      {icon}
      <p style={{ fontSize: '24px', fontWeight: 800 }}>{title}</p>
    </div>
  )
}
