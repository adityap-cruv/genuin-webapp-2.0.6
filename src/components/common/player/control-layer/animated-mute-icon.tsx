import { MuteIcon } from '@icons/player-controls/mute-icon'
import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'

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
      <MuteIcon />
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
