'use client'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { DownloadAppDialog } from '../pages/home/download-app-dialog'
import Link from 'next/link'
import { cn } from '@lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { HIRING_LINK, MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type VariantProps, cva } from 'class-variance-authority'

const navbarVariant = cva('fixed left-0 top-0 z-10 m-auto flex h-navbar w-full', {
  variants: {
    variant: {
      light: 'bg-monochrome-white',
      dark: 'bg-monochrome-black',
      transparent: 'bg-transparent',
    },
  },
})
type Props = VariantProps<typeof navbarVariant> & {
  isMobile: boolean
}

export function NavBar({ variant, isMobile }: Props) {
  const isVariantLight = variant === 'dark' || variant === 'transparent'
  return (
    <nav className={cn(navbarVariant({ variant }))}>
      <div className={'container flex h-full items-center justify-between py-1'}>
        <GenuinLogo.adaptive variant={isVariantLight ? 'light' : 'dark'} />
        <div className="flex items-center">
          <GetAppButton isMobile={isMobile} />
          <BurgerMenu variant={isVariantLight ? 'light' : 'dark'} />
        </div>
      </div>
    </nav>
  )
}

type GetAppButtonType = {
  isMobile: boolean
}

function GetAppButton({ isMobile }: GetAppButtonType) {
  return isMobile ? (
    <Link href={MOBILE_DOWNLOAD_APP_LINK}>
      <Button size="sm">
        <p className="text-title-sm text-monochrome-white">Get App</p>
      </Button>
    </Link>
  ) : (
    <DownloadAppDialog>
      <Button size="sm">
        <p className="line-clamp-1 text-title-sm text-monochrome-white">Get App</p>
      </Button>
    </DownloadAppDialog>
  )
}

function BurgerMenu({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <HamBurgerMenuIcon variant={variant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-monochrome-black/90 px-3"
        onInteractOutside={(event) => {
          // todo think about it what to do when user clicks outside
          event.preventDefault()
        }}>
        <DropdownMenuItem>
          <Link href={HIRING_LINK} className="w-full">
            <p className="text-right text-title-xl text-monochrome-white">Join Our Team</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="https://begenuin.com/l/123f373977001407" className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Life at Genuin</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={PATH_NAME.terms} className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Terms of Service</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={PATH_NAME.privacy} className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Privacy Policy</p>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
