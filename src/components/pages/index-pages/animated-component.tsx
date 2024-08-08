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
      }}
      className={cn(
        `flex h-12 w-min items-center rounded-full px-6 py-3 text-cap-1-bold-home font-extrabold transition duration-500 hover:!shadow-none`,
        className
      )}>
      {children}
    </div>
  )
}
