'use client'
import { Button } from '@components/ui/button'
import { DownloadAppDialog } from '../pages/home/download-app-dialog'
import Link from 'next/link'
import { cn } from '@lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@components/ui/dropdown-menu'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { HIRING_LINK } from '@lib/constants'
import { PATH_NAME } from '@lib/utils/constants/path'
import { cva } from 'class-variance-authority'
import icSearch from '@icons/icSearch.svg'
import Image from 'next/image'

const navbarVariant = cva('flex fixed z-10 w-full items-center justify-between p-2', {
  variants: {
    variant: {
      light: 'bg-monochrome-white',
      dark: 'bg-monochrome-black',
      transparent: 'bg-transparent',
    },
  },
})

export function MobileNavBar({ variant }: any) {
  const isVariantLight = variant === 'dark' || variant === 'transparent'
  return (
    <nav className={cn(navbarVariant({ variant }))}>
      <div className='flex items-center'>
      <BurgerMenu variant={'dark'} />
      <GenuinSymbol />
      </div>

      <div className="flex">
        <DownloadAppDialog>
          <Button size="sm" className="mr-2 bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
            <p className="text-new-sm text-new-off-white">Download Genuin</p>
          </Button>
        </DownloadAppDialog>
        <Image src={icSearch} alt="share" height={26} width={26} />
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

export function GenuinSymbol() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="fill-new-off-black">
      <path d="M19.8048 4.00781C10.9692 4.00781 3.84036 11.1011 3.8048 19.9367C3.77813 27.1012 8.45369 33.1812 14.9248 35.2523C17.9648 36.2212 21.2981 34.8523 22.6581 31.9634C23.0848 31.0567 23.3248 30.0434 23.3248 28.9678V28.6656C23.3248 28.39 23.0492 28.1945 22.7915 28.2923C21.8048 28.6478 20.7381 28.8345 19.627 28.8078C14.827 28.71 10.9604 24.7189 11.0048 19.9189C11.0492 15.1011 14.9781 11.2078 19.8048 11.2078C24.667 11.2078 28.6048 15.1456 28.6048 20.0078V28.9678C28.6048 30.7723 28.2137 32.4878 27.5204 34.0256C32.4626 31.3056 35.8048 26.0434 35.8048 20.0078C35.8048 11.1723 28.6404 4.00781 19.8048 4.00781Z" />
    </svg>
  )
}