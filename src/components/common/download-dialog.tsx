import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import iconLogo from '@icons/icWithoutText.svg'

interface Props {
  children?: React.ReactNode
  title: React.ReactNode
  subtitle: React.ReactNode
  asChild?: boolean
}

export function DownloadDialog({ children, subtitle, title, asChild = true }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex h-full w-full flex-col items-center justify-center pt-6">
          <Image src={iconLogo} alt="genuin" className="mb-3" />
          <p style={{ fontSize: '40px' }} className="hidden whitespace-nowrap text-center font-bold sm:block">
            {title}
          </p>
          <p className="line-clamp-2 max-w-none break-all text-center font-semibold" style={{ fontSize: '20px' }}>
            {subtitle}
          </p>
          <div className="mt-6 flex">
            <Image className="mx-2 w-full" src={imageAppStore} alt="app store" />
            <Image className="mx-2 w-full" src={imagePlayStore} alt="play store" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
