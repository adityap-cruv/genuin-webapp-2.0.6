import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { AppLogo } from '@components/ui/app-logo'

interface Props {
  children?: React.ReactNode
  title: React.ReactNode
  subtitle: React.ReactNode
  /**
   * Pass true if you're using button inside trigger.
   */
  asChild?: boolean
}

export function DownloadDialog({ children, subtitle, title, asChild = false }: Props) {
  const URL_TO_APP_STORE = 'https://apps.apple.com/US/app/id1511177838?mt=8'
  const URL_TO_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.begenuin.begenuin'
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex h-full w-full flex-col items-center justify-center px-4 pt-6">
          <AppLogo.icon className="fill-primary" imageHeight={50} />
          <p style={{ fontSize: '40px' }} className="hidden whitespace-nowrap text-center font-bold sm:block">
            {title}
          </p>
          <p className="line-clamp-2 max-w-none text-center text-title-2-demi">{subtitle}</p>
          <div className="mt-6 flex gap-x-2">
            <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imageAppStore} alt="app store" />
            </a>
            <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imagePlayStore} alt="play store" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
