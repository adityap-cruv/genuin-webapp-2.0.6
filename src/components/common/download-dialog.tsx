import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import iconLogo from '@icons/icWithoutText.svg'
import { useResponsive } from '@hooks/useResponsive'

interface Props {
  children?: React.ReactNode
  title: React.ReactNode
  subtitle: React.ReactNode
  asChild?: boolean
}

export function DownloadDialog({ children, subtitle, title, asChild = true }: Props) {
  const { isSm } = useResponsive()
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex h-full w-full flex-col items-center justify-center pt-6">
          <Image src={iconLogo} alt="genuin" className="mb-3" />
          {isSm && (
            <p style={{ fontSize: '40px' }} className="whitespace-nowrap text-center font-bold">
              {title}
            </p>
          )}
          <p className="line-clamp-2 max-w-none break-words text-center font-semibold" style={{ fontSize: '20px' }}>
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
