import { cn } from '@/lib/utils'
import { AnimatePresence, motion, type MotionProps } from 'framer-motion'
import { type ReactNode, type ComponentPropsWithRef, useState } from 'react'
import { VanillaPlayer } from '@/components/common/vanilla-player'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { CustomDialog, CustomDialogContent, CustomDialogTrigger } from '@/components/custom/custom-dialog'
import { CustomMuteIcon } from '@icons/home-page/mute'
import { CustomUnmuteIcon } from '@icons/home-page/unmute'
import { CustomFullscreenIcon } from '@icons/home-page/fullscreenIcon'

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
        <p className="text-[36px] font-bold leading-none md:w-4/5 md:text-[56px]">{titleNode}</p>
        <p className="w-full text-cap-1-bold-home font-medium leading-normal sm:w-3/4 md:w-2/3 md:text-title-1-med">
          {subtitle}
        </p>
      </div>
      <VanillaPlayer
        style={{ borderRadius: 36 }}
        className="mx-5 aspect-[1.09] w-full max-w-sm overflow-clip object-fill md:mx-0 md:w-1/2 lg:max-w-none"
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
  videoSrc?: string
  posterSrc?: string
  openVideoOnClick?: boolean
} & AnimatedTileProps

interface VideoPlayerControlsProps {
  muted: boolean
  setMuted: (muted: boolean) => void
  videoSrc: string
}

export function GeneralShellForInitialComponent({
  titleNode,
  subtitle,
  animationUrl,
  cta,
  videoSrc,
  posterSrc,
}: GeneralShellForInitialComponentProps) {
  const [muted, setMuted] = useState(true)
  return (
    <AnimatedTile className="h-body">
      <div className="flex flex-col gap-4 transition-all md:flex-1 md:gap-9">
        <p className="text-center text-[44px] font-bold md:text-start md:text-[84px]" style={{ lineHeight: '100%' }}>
          {titleNode}
        </p>
        <p className="text-center text-title-2-demi md:w-3/4 md:text-start md:text-body-2-home">{subtitle}</p>
        <span className="hidden md:block">{cta}</span>
      </div>
      {videoSrc && (
        <>
          {/* Video Player Dialogs */}
          <VideoPlayerDialog videoSrc={videoSrc} muted={muted} setMuted={setMuted} />

          {posterSrc && (
            <div className="flex w-4/5 items-center transition-all sm:w-2/3 md:w-1/3 lg:w-[40%]">
              <img src={posterSrc} className="w-full" alt="poster" />
            </div>
          )}
        </>
      )}
    </AnimatedTile>
  )
}

function VideoPlayerDialog({ videoSrc, muted, setMuted }: VideoPlayerControlsProps) {
  return (
    <>
      {/* For Desktop */}
      <Dialog>
        <DialogTrigger
          className="hidden aspect-reel w-44 cursor-pointer items-center outline-none transition-all sm:flex sm:w-2/3 sm:justify-center md:w-1/4 lg:w-[30%]"
          onClick={() => {
            setMuted(true)
          }}>
          <VideoPlayerControls muted={muted} setMuted={setMuted} videoSrc={videoSrc} />
        </DialogTrigger>
        <DialogContent className="w-auto">
          <VanillaPlayer
            className="aspect-reel h-[80vh]"
            videoSource={videoSrc}
            muted={false}
            poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
          />
        </DialogContent>
      </Dialog>

      {/* For Mobile */}
      <CustomDialog>
        <CustomDialogTrigger
          className="aspect-reel w-44 cursor-pointer items-center outline-none transition-all sm:hidden sm:w-2/3 md:w-1/4 lg:w-[30%]"
          onClick={() => {
            setMuted(true)
          }}>
          <VideoPlayerControls muted={muted} setMuted={setMuted} videoSrc={videoSrc} />
        </CustomDialogTrigger>
        <CustomDialogContent showDefaultClose className="w-auto sm:h-full sm:w-full sm:p-0 md:w-[60%] lg:w-[50%]">
          <VanillaPlayer
            className="aspect-reel h-full w-full"
            videoSource={videoSrc}
            muted={false}
            poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
          />
        </CustomDialogContent>
      </CustomDialog>
    </>
  )
}

function VideoPlayerControls({ muted, setMuted, videoSrc }: VideoPlayerControlsProps) {
  return (
    <div className="relative lg:h-5/6">
      <div className="absolute right-2 top-3 z-10 rounded-full bg-[hsla(0,0%,30%,.6)] p-1 sm:right-4 sm:top-5">
        <CustomFullscreenIcon className="fill-monochrome-white" />
      </div>
      <div
        className="absolute right-10 top-3 z-10 cursor-pointer rounded-full bg-[hsla(0,0%,30%,.6)] p-1 sm:right-12 sm:top-5"
        onClick={(e) => {
          e.stopPropagation()
          setMuted(!muted)
        }}>
        {muted ? (
          <CustomMuteIcon className="fill-monochrome-white" />
        ) : (
          <CustomUnmuteIcon className="fill-monochrome-white" />
        )}
      </div>
      <VanillaPlayer
        className="shrink-0 overflow-clip rounded-3xl sm:h-full"
        id="home-player"
        videoSource={videoSrc}
        loop
        muted={muted}
        poster="https://media.begenuin.com/backend_assets/hero-video/hero-video.png"
      />
    </div>
  )
}

export function getAnimationUrl(animationName: string) {
  return `https://media.begenuin.com/webapp_assets/animation_videos/${animationName}.mp4`
}
