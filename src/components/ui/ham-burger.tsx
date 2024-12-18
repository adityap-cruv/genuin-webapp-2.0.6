'use client'
import { useState } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@lib/utils'
import icHamburger from '@icons/player-controls/icon-hamburger.svg'
import Image from 'next/image'

const burgerVariants = cva('', {
  variants: {
    variant: {
      light: 'stroke-white',
      dark: 'stroke-black',
    },
  },
})

type Props = {
  onOpen?: () => void
  onClose?: () => void
  toggleToClose?: boolean
} & VariantProps<typeof burgerVariants>

export function HamBurgerMenuIcon({
  variant = 'dark',
  onOpen = () => {},
  onClose = () => {},
  toggleToClose = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const line = cn(
    `my-0.5 rounded-full transition ease transform duration-100 delay-0`,
    burgerVariants({ variant })
  )

  function toggle() {
    !isOpen ? onOpen() : onClose()
    setIsOpen((old) => !old)
  }

  return <Image src={icHamburger} alt="menu" height={24} width={24} onClick={toggle} className={cn(line)} />
}
