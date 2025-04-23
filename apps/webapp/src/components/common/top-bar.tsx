import { cn } from '@/lib/utils'
import { type ComponentProps, useEffect, useState } from 'react'

type Props = {
  /**
   * @default true
   */
  defaultOpen?: boolean
  /**
   * pass the element id to track the intersection observer.
   */
  idToTrack: string
} & ComponentProps<'div'>

export function TopBar({ idToTrack, defaultOpen = false, children, className, ...restProps }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    const detailsElement = document.getElementById(idToTrack)
    if (!detailsElement) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOpen(!entry.isIntersecting)
      },
      { threshold: 0.5 }
    )
    observer.observe(detailsElement)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={cn(
        'absolute z-10 h-14 w-full border-b border-tertiary-200 bg-background px-4 transition-transform duration-200 ease-linear md:px-6',
        isOpen || defaultOpen ? ' translate-y-0' : '-translate-y-full',
        // !showNavbar && 'top-16 md:-top-0.5',
        className
      )}
      {...restProps}>
      {children}
    </div>
  )
}
