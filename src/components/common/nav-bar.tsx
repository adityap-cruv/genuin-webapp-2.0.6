'use client'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { DownloadDialog } from './download-dialog'
import { isMobile } from 'react-device-detect'
import Link from 'next/link'
import { cn } from '@lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { BurgerMenuIcon } from '@components/ui/ham-burger'

interface Props {
  variant: 'light' | 'dark' | 'transparent'
}

export function NavBar({ variant = 'light' }: Props) {
  const isVariantLight = variant === 'dark' || variant === 'transparent'
  return (
    <nav
      className={cn(
        variant === 'dark' ? 'bg-monochrome-black' : undefined,
        'fixed top-0 z-50 m-auto flex h-navbar w-full'
      )}>
      <div className="container flex h-full items-center justify-between py-1">
        <GenuinLogo.adaptive variant={isVariantLight ? 'light' : 'dark'} />
        <div className="flex items-center">
          <GetAppButton />
          <BurgerMenu variant={isVariantLight ? 'light' : 'dark'} />
        </div>
      </div>
    </nav>
  )
}

function GetAppButton() {
  return !isMobile ? (
    <DownloadDialog title="design get app form modal" subtitle="given to dev">
      <Button size="sm">
        <p className="line-clamp-1 text-title-sm text-monochrome-white">Get App</p>
      </Button>
    </DownloadDialog>
  ) : (
    <Link href="https://begenuin.com/sg86n">
      <Button size="sm">
        <p className="text-title-sm text-monochrome-white">Get App</p>
      </Button>
    </Link>
  )
}

function BurgerMenu({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <BurgerMenuIcon variant={variant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-monochrome-black/90 px-3"
        onInteractOutside={(event) => {
          //todo think about it what to do when user clicks outside
          event.preventDefault()
        }}>
        <DropdownMenuItem>
          <Link href="https://careers.begenuin.com" className="w-full">
            <p className="text-right text-title-xl text-monochrome-white">Join Our Team</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="https://begenuin.com/content_demo?value=rt_123f373977001407" className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Life at Genuin</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/terms" className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Terms of Service</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/privacy" className="w-full">
            <p className="w-full text-right text-title-xl text-monochrome-white">Privacy Policy</p>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
