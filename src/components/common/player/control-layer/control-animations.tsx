import { motion, type AnimationControls } from 'framer-motion'
import { memo } from 'react'

interface ControlAnimationProps {
  text: string
  animationController: AnimationControls
  show: boolean
}

/**
 * This component is used to animate the text in the control buttons of the player.
 */
export const ControlAnimation = memo(function ControlAnimation({
  text,
  animationController,
  show,
}: ControlAnimationProps) {
  return show ? (
    <motion.div
      animate={animationController}
      exit={{ width: 0 }}
      initial={{ width: 0 }}
      className="text-body-1 flex w-auto min-w-0 overflow-clip text-clip whitespace-nowrap">
      <p className="text-monochrome-white">{text}</p>
      <div className="h-full w-2" />
    </motion.div>
  ) : null
})
