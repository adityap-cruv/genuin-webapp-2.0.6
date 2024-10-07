// import { CustomFullscreenIcon } from '@icons/full-screen-icon'
import { CustomDialog, CustomDialogContent, CustomDialogTrigger } from '../custom/custom-dialog'
// import { VanillaPlayer } from '../old/vanilla-player'
import { VanillaPlayer } from '../common/vanilla-player'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
// import { CustomMuteIcon } from '@icons/mute'
// import { CustomUnmuteIcon } from '@icons/unmute'
import CustomButton from '../custom/custom-button'

interface VideoPlayerControlsProps {
  videoSrc: string
}

export function VideoPlayerDialog({ videoSrc }: VideoPlayerControlsProps) {
  return (
    <>
      {/* For Desktop */}
      <Dialog>
        <DialogTrigger className="hidden sm:block" asChild>
          <CustomButton
            variant="blue"
            className="rounded-full px-8 py-6 text-cap-1-bold-home md:text-index-h5-extra-bold"
            radius="rounded-full"
            showIcon>
            Watch Explainer
          </CustomButton>
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
        <CustomDialogTrigger className="sm:hidden">
          <CustomButton
            variant="blue"
            className="rounded-full py-3 pl-4 pr-3 text-cap-1-bold-home md:text-index-h5-extra-bold"
            radius="rounded-full"
            showIcon>
            Watch Explainer
          </CustomButton>
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
