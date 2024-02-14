import Image from 'next/image'
import { Button } from '@components/ui/button'
import { LeftScrollButtonIcon, RightScrollButtonIcon } from './horizontal-scroll-icons'
import icShare from '@icons/icShareBlue.svg'
import React, { useRef } from 'react'
import Link from 'next/link'
import { Toaster } from '@components/ui/toaster'
import { useToast } from '@components/ui/use-toast'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useInView } from 'framer-motion'
import c1 from '@images/home-page/loop/Loop-Link-Share 1.webp'
import c2 from '@images/home-page/loop/Loop-Link-Share 2.webp'
import c3 from '@images/home-page/loop/Loop-Link-Share 3.webp'
import c4 from '@images/home-page/loop/Loop-Link-Share 4.webp'
import c5 from '@images/home-page/loop/Loop-Link-Share 5.webp'

export function LoopSection() {
  const divRef = useRef<HTMLDivElement>(null)
  const firstDivRef = useRef<HTMLDivElement>(null)
  const lastDivRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { shareFn } = useAdaptiveShare()
  const isAtFirst = useInView(firstDivRef)
  const isAtLast = useInView(lastDivRef)

  return (
    <div className="flex w-full flex-col gap-y-10">
      <div
        ref={divRef}
        className="hide-scrollbar scroll-snap-always flex snap-x gap-4 overflow-x-auto px-4 sm:px-0 sm:pl-5 ">
        <div ref={firstDivRef} className="w-0.5">
          &nbsp;
        </div>
        <img src={c1.src} />
        <img src={c2.src} />
        <img src={c3.src} />
        <img src={c4.src} />
        <img src={c5.src} />
        <div ref={lastDivRef} className="w-0.5">
          &nbsp;
        </div>
      </div>
      <div className="flex justify-between px-3">
        <Button
          disabled={isAtFirst}
          variant="outline"
          className="border-none"
          onClick={(e) => {
            const div = divRef.current
            if (!div) return
            div.scrollBy({ left: -div.getBoundingClientRect().width, behavior: 'smooth' })
          }}>
          <LeftScrollButtonIcon disabled={isAtFirst} />
        </Button>
        <Button
          disabled={isAtLast}
          variant="outline"
          className="border-none"
          onClick={(e) => {
            const div = divRef.current
            if (!div) return
            div.scrollBy({ left: div.getBoundingClientRect().width, behavior: 'smooth' })
          }}>
          <RightScrollButtonIcon disabled={isAtLast} />
        </Button>
      </div>
    </div>
  )
}
