import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface CustomAnimatedSectionProps {
  children: React.ReactNode
  classname?: string
}

export function CustomAnimatedSection({ children, classname }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="flex h-full w-full justify-start overflow-hidden">
      <span
        className={`${classname} duration-1800 block transition-all ${
          isInView ? 'transform-none opacity-100' : '-translate-y-10 transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}

export function CustomAnimatedLogos({ children, classname }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref}>
      <span
        className={`${classname} duration-8000 block transition-all ${
          isInView ? 'transform-none opacity-100' : '-translate-y-10 transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}
