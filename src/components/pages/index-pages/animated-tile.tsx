import { cn } from '@/lib/utils'
import { AnimatePresence, motion, type MotionProps } from 'framer-motion'
import { type ReactNode, type ComponentPropsWithRef } from 'react'
import { VanillaPlayer } from '@/components/common/vanilla-player'

type AnimatedTileProps = ComponentPropsWithRef<'div'> & MotionProps

export function AnimatedTile({ className, children, initial, whileInView, ...restProps }: AnimatedTileProps) {
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'container flex flex-col items-center gap-6 md:w-full md:flex-row md:items-center md:justify-between md:gap-0',
          className
        )}
        style={{ maxWidth: 1200 }}
        initial={initial ?? { opacity: 0, translateY: '-10%' }}
        whileInView={whileInView ?? { opacity: 1, translateY: '0%', transition: { duration: 1 } }}
        viewport={{
          amount: 0.5,
          once: true,
        }}
        {...restProps}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

type GeneralShellProps = { titleNode: ReactNode; subtitle: string; animationUrl: string } & AnimatedTileProps

export function GeneralShell({ titleNode, subtitle, animationUrl }: GeneralShellProps) {
  return (
    <AnimatedTile className="py-9 md:py-20">
      <div className="flex flex-col gap-4 md:flex-1 md:gap-6">
        <p className="text-[36px] font-bold leading-none md:w-3/4 md:text-[56px]">{titleNode}</p>
        <p className="w-full text-cap-1-bold-home font-medium leading-normal sm:w-3/4 md:w-2/3 md:text-title-1-med">
          {subtitle}
        </p>
      </div>
      <VanillaPlayer
        style={{ borderRadius: 36 }}
        className="mx-5 aspect-square w-full max-w-sm overflow-clip object-fill md:mx-0 md:w-1/2 lg:max-w-none"
        videoSource={animationUrl}
      />
    </AnimatedTile>
  )
}

type GeneralShellForInitialComponentProps = {
  titleNode: ReactNode
  subtitle: string
  animationUrl?: string
  cta: ReactNode
} & AnimatedTileProps

export function GeneralShellForInitialComponent({
  titleNode,
  subtitle,
  animationUrl,
  cta,
}: GeneralShellForInitialComponentProps) {
  return (
    <AnimatedTile className="h-body">
      <div className="flex flex-col gap-4 transition-all md:flex-1 md:gap-9">
        <p className="text-center text-[44px] font-bold md:text-start md:text-[84px]" style={{ lineHeight: '100%' }}>
          {titleNode}
        </p>
        <p className="text-center text-title-2-demi md:w-3/4 md:text-start md:text-body-2-home">{subtitle}</p>
        <span className="hidden md:block">{cta}</span>
      </div>
      <div className="aspect-reel w-44 items-center transition-all sm:flex sm:w-2/3 sm:justify-center md:w-1/3 md:justify-end lg:w-[40%]">
        <VanillaPlayer
          className="shrink-0 overflow-clip rounded-3xl border-[8px] border-monochrome-white sm:rounded-[38px] md:rounded-[42px] md:border-[12px] lg:h-5/6"
          id="home-player"
          videoSource="https://media.begenuin.com/backend_assets/hero-video/comp-1_2.m3u8"
          loop={true}
          poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
        />
      </div>
    </AnimatedTile>
  )
}

export function getAnimationUrl(animationName: string) {
  return `https://media.begenuin.com/webapp_assets/animation_videos/${animationName}.mp4`
}
