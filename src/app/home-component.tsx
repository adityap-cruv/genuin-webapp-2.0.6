'use client'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useRef, useState } from 'react'

export function HomeComponent() {
  const divRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: divRef })
  const [scrollProgress, setScrollProgress] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollProgress(Number(latest.toPrecision(6)))
  })

  return (
    <div>
      <img
        src="https://media.qa.begenuin.com/uploads/thumbnails/s/547c1736-724f-4bbd-ad7f-f9efe5060da1_1683887494.png"
        className="absolute inset-0 h-full w-full opacity-20 blur-lg"
        loading="lazy"
      />
    </div>
  )
}
