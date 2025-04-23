'use client'
import Link from 'next/link'
import { cn } from '@lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { HIRING_LINK } from '@lib/constants'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type VariantProps, cva } from 'class-variance-authority'
import { AppLogo } from '@components/ui/app-logo'
import GetAppButton from './get-app-button'

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
        {isMobile ? (
          <AppLogo.icon
            imageHeight={32}
            className={cn(isVariantLight ? 'fill-monochrome-white' : 'fill-new-off-black')}
          />
        ) : (
          <AppLogo.logo
            imageHeight={42}
            className={cn(isVariantLight ? 'fill-monochrome-white' : 'fill-new-off-black')}
          />
        )}
        {/* <GenuinAdaptiveLogo variant={isVariantLight ? 'light' : 'dark'} /> */}
        <div className="flex items-center">
          <GetAppButton
            buttonText="Get App"
            className="line-clamp-1 text-body-1-bold text-monochrome-white"
            variant="default"
            size="sm"
          />
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
        {/* <HamburgerIcon /> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-monochrome-black/90 px-3"
        onInteractOutside={(event) => {
          // TODO: think about it what to do when user clicks outside
          event.preventDefault()
        }}>
        <DropdownMenuItem>
          <Link href={HIRING_LINK} className="w-full">
            <p className="text-right text-title-1-bold text-monochrome-white">Join Our Team</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="https://begenuin.com/l/123f373977001407" className="w-full">
            <p className="w-full text-right text-title-1-bold text-monochrome-white">Life at Genuin</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={PATH_NAME.terms} className="w-full">
            <p className="w-full text-right text-title-1-bold text-monochrome-white">Terms of Service</p>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={PATH_NAME.privacy} className="w-full">
            <p className="w-full text-right text-title-1-bold text-monochrome-white">Privacy Policy</p>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
