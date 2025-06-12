import { cn } from '@/lib/utils'
import { motion, type MotionProps } from 'framer-motion'
import { type ComponentPropsWithRef, type ComponentProps } from 'react'

export function AnimatedComponent({ children, className, ...restProps }: ComponentPropsWithRef<'div'> & MotionProps) {
  return (
    <motion.div className={cn(className)} {...restProps}>
      {children}
    </motion.div>
  )
}

type AnimatedButtonProps = ComponentProps<'button'> & { shadowColor?: string }

/**
 * This component is only for index pages.
 */
export function AnimatedButton({ className, shadowColor, children }: AnimatedButtonProps) {
  return (
    <div
      style={{
        boxShadow: `8px 8px ${shadowColor}`,
        transform: 'translate(0, 0)',
        transition: 'transform 0.5s, box-shadow 0.5s', // Transition for both properties
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(8px, 8px)'
        e.currentTarget.style.boxShadow = `0px 0px ${shadowColor}` // Remove the shadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0, 0)'
        e.currentTarget.style.boxShadow = `8px 8px ${shadowColor}` // Reset the shadow to the original position
      }}
      className={cn(
        `flex h-12 w-min items-center rounded-full px-6 py-3 text-cap-1-bold-home font-extrabold`,
        className
      )}>
      {children}
    </div>
  )
}
