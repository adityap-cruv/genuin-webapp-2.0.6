import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import Image from 'next/image'
import icMute from '@icons/player-controls/icMuteBlack.svg'
import icUnmute from '@icons/player-controls/icUnmute.svg'

// TODO: Make this component more reusable
export const AnimatedMuteIcon = () => {
  const muteAnimationController = useAnimationControls()
  useEffect(() => {
    muteAnimationController
      ?.start({
        width: 0,
        transition: {
          delay: 4,
          duration: 0.5,
          repeatType: 'mirror',
          repeatDelay: 3,
          repeat: Infinity,
        },
      })
      .catch((_e) => {})
  }, [])

  return (
    <div className="flex w-fit items-center overflow-hidden rounded-lg bg-monochrome-white py-2 pl-2">
      <Image src={icMute} alt="" className="h-6 w-6 overflow-visible" />
      <div className="h-full w-2" />
      <motion.div
        animate={muteAnimationController}
        initial={{ width: 122 }}
        className="flex w-auto min-w-0 overflow-clip text-clip whitespace-nowrap text-body-1-bold">
        <p>Tap to unmute</p>
        <div className="h-full w-2" />
      </motion.div>
    </div>
  )
}
