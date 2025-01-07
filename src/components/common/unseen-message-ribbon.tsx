import { IcArrowDown } from '@icons/ic-arrow-down'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CloseIcon } from '@icons/close-icon'

export function UnseenMessageRibbon({ messageCount }: { messageCount: number }) {
  const [isOpen, setIsOpen] = useState(true)
  const animation = useAnimationControls()
  useEffect(() => {
    void (isOpen
      ? animation.start({ y: 70, transitionDelay: '2s', transitionDuration: '1s' })
      : animation.start({ y: -100, transitionDuration: '1s' }))
  }, [isOpen])

  useEffect(() => {
    setTimeout(() => {
      void animation.start({ y: -100, transitionDuration: '1s' })
    }, 10000)
  }, [])

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={animation}
      className="flex h-fit w-fit items-center gap-x-2 rounded-full bg-primary px-2 py-1">
      <IcArrowDown className="h-4 w-4" />
      <p className="text-body-1-demi text-monochrome-white">{`${messageCount} Unseen ${
        messageCount === 1 ? 'post' : 'posts'
      } |`}</p>
      <CloseIcon
        onClick={() => {
          setIsOpen(false)
        }}
        variant={'light'}
        size="sm"
      />
    </motion.div>
  )
}
