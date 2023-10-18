'use client'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useRef, useState } from 'react'
import mobileFrameImg from '@images/mobileFrame.png'
import Image from 'next/image'
import { getLoopVideos } from '@lib/api/loop'

export function HomeComponent() {
  const divRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: divRef })
  const [scrollProgress, setScrollProgress] = useState(0)
  const { data } = getLoopVideos('1985bc36e180146d')
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollProgress(Number(latest.toPrecision(6)))
  })
  console.log('scroll progress::', scrollProgress)

  return (
    <div ref={divRef} className="hide-scrollbar relative h-full w-full overflow-auto ">
      <img
        src="https://media.qa.begenuin.com/uploads/thumbnails/s/547c1736-724f-4bbd-ad7f-f9efe5060da1_1683887494.png"
        className="fixed inset-0 z-0 h-full w-full opacity-20 blur-lg"
        loading="lazy"
      />
      <div className="flex h-[80%] w-[50%] bg-red-40">
        <Image src={mobileFrameImg} alt="frame" priority={true} />
      </div>
      <div className="absolute h-[500%] w-full" />
    </div>
  )
}
