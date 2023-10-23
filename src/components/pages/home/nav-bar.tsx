'use client'
import { cn } from '@lib/utils'
import { Button } from '@components/ui/button'
import { GenuinLogo } from '@components/ui/genuin-logo'
import { inView } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function NavBar() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    /**
     * here in this login navbar will be transparent if initial-component is in viewport
     */
    const stop = inView(
      '#initial-component',
      () => {
        navRef.current?.classList.remove('bg-monochrome-white', 'shadow-lg')
        return (entry) => {
          navRef.current?.classList.add('bg-monochrome-white', 'shadow-lg')
        }
      },
      { amount: 'some' }
    )
    return () => stop()
  }, [])

  return (
    <nav ref={navRef} className="fixed top-0 z-10 m-auto flex h-navbar w-full ">
      <div className={cn('container flex h-full items-center justify-between py-1')}>
        <GenuinLogo.text variant="black" />
        <div className="flex items-center gap-x-2">
          <Button variant="outline" outlineColor="black" size="sm">
            <p className="text-new-sm">We're hiring!</p>
          </Button>
          <Button size="sm" className="bg-monochrome-black">
            <p className="text-new-sm">Download Genuin</p>
          </Button>
        </div>
      </div>
    </nav>
  )
}
