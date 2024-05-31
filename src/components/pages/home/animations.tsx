import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface CustomAnimatedSectionProps {
  children: React.ReactNode
  classname?: string
  animationClass?: string
}

export function CustomAnimatedSection({ children, classname }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="flex h-full w-full justify-start overflow-hidden">
      <span
        className={`${classname} block transition-all duration-1800 ${
          isInView ? 'transform-none opacity-100' : '-translate-y-10 transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}

export function CustomAnimatedLogos({ children, classname, animationClass }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref}>
      <span
        className={`${classname} block transition-all ${
          isInView ? `${animationClass} transform-none opacity-100` : 'transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}
