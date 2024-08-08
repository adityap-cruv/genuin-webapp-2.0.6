import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface CustomAnimatedSectionProps {
  children: React.ReactNode
  className?: string
  animationClass?: string
}

export function CustomAnimatedSection({ children, className }: CustomAnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="flex h-full w-full justify-start overflow-hidden">
      <span
        className={`${className} block transition-all duration-1800 ${
          isInView ? 'transform-none opacity-100' : '-translate-y-10 transform opacity-0'
        }`}>
        {children}
      </span>
    </section>
  )
}
