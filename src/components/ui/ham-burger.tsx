'use client'
import { useState } from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '@lib/utils'

const burgerVariants = cva('', {
  variants: {
    variant: {
      light: 'bg-monochrome-white',
      dark: 'bg-monochrome-black',
    },
  },
})

interface Props extends VariantProps<typeof burgerVariants> {
  onOpen?: Function
  onClose?: Function
}

export function HamBurgerMenuIcon({ variant = 'dark', onOpen = () => {}, onClose = () => {} }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const line = cn(
    `h-1 w-6 my-0.5 rounded-full transition ease transform duration-100 delay-0`,
    burgerVariants({ variant })
  )

  function toggle() {
    !isOpen ? onOpen() : onClose()
    setIsOpen((old) => !old)
  }

  return (
    <div className="flex h-12 w-12 flex-col items-center justify-center rounded " onClick={toggle}>
      <span className={cn(line, isOpen ? 'translate-y-2 rotate-45' : undefined)} />
      <span className={cn(line, isOpen ? 'opacity-0' : undefined)} />
      <span className={cn(line, isOpen ? '-translate-y-2 -rotate-45' : undefined)} />
    </div>
  )
}
