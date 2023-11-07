'use client'
import { GenuinLogo } from '@components/ui/genuin-logo'
import Link from 'next/link'
import { cn, getAvatarFallback } from '@lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'

interface Props {
  variant: 'light' | 'dark' | 'transparent'
  communityDetails: any
}

export function NavBar({ variant = 'light', communityDetails }: Props) {
  const isVariantLight = variant === 'dark' || variant === 'transparent'
  return (
    <nav
      className={cn(
        variant === 'dark' ? 'bg-monochrome-black' : 'bg-monochrome-white',
        'fixed top-0 z-50 m-auto flex h-navbar w-full px-4'
      )}>
      <div className={cn(' container relative flex h-full items-center justify-between py-1')}>
        <div className=" absolute left-0">
          <GenuinLogo.adaptive variant={isVariantLight ? 'light' : 'dark'} />
        </div>
        <div
          className="absolute left-[50%] flex items-center justify-between"
          style={{ transform: 'translate(-50%, 0)' }}>
          <Avatar className="mx-2 h-6 w-6 bg-red-50">
            <AvatarImage src={communityDetails?.info.profile_image} />
            <AvatarFallback>
              <p className="text-title-xl text-monochrome-white">{getAvatarFallback(communityDetails?.info.name)}</p>
            </AvatarFallback>
          </Avatar>
          <p className="my-2 line-clamp-1 break-all text-title-sm">{communityDetails?.info.name}</p>
        </div>
        <div className=" absolute right-0">
          <BurgerMenu variant={isVariantLight ? 'light' : 'dark'} />
        </div>
      </div>
    </nav>
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
