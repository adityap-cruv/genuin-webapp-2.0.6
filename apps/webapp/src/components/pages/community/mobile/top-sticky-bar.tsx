import { motion, type MotionProps } from 'motion/react'
import { CustomAvatar } from '@/components/custom/custom-avatar'
import { useState, useEffect } from 'react'

type TopStickyBarPropType = {
  communityName: string
  communityProfileImage: string
  elementIdToTrack: string
} & React.HTMLAttributes<HTMLDivElement> &
  MotionProps

export function TopStickyBar({
  communityName,
  communityProfileImage,
  elementIdToTrack,
  ...props
}: TopStickyBarPropType) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const element = document.getElementById(elementIdToTrack)
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [elementIdToTrack])

  return (
    <motion.div
      initial={{ y: '-100%' }}
      animate={{
        y: isOpen ? '0' : '-100%',
        transitionDuration: '0.2',
        transitionTimingFunction: 'linear',
      }}
      className="border-tertiary-200 bg-monochrome-white sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b px-6"
      {...props}>
      <span className="flex items-center gap-x-2">
        <CustomAvatar
          imageUrl={communityProfileImage}
          fallbackString={communityName}
          isAvatar={false}
          className="h-8 w-8"
        />
        <p className="text-title-2-demi line-clamp-1 break-all">{communityName}</p>
      </span>
    </motion.div>
  )
}
