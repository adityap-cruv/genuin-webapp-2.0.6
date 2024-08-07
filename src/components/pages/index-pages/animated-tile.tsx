import { cn } from '@/lib/utils'
import { motion, type MotionProps } from 'framer-motion'
import { type ComponentPropsWithRef } from 'react'

type AnimatedTileProps = ComponentPropsWithRef<'div'> & MotionProps

export function AnimatedTile({ className, children, initial, whileInView, ...restProps }: AnimatedTileProps) {
  return (
    <motion.div
      className={cn(
        'container flex flex-col items-center gap-6 overflow-hidden md:w-full md:flex-row md:items-center md:justify-between md:gap-0',
        className
      )}
      initial={initial ?? { opacity: 0, translateY: '-10%' }}
      whileInView={whileInView ?? { opacity: 1, translateY: '0%', transition: { duration: 1 } }}
      viewport={{
        amount: 0.5,
        once: true,
      }}
      {...restProps}>
      {children}
    </motion.div>
  )
}
