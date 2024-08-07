import { cn } from '@/lib/utils'
import { motion, type MotionProps } from 'framer-motion'
import { type ComponentPropsWithRef } from 'react'

export function AnimatedComponent({ children, className, ...restProps }: ComponentPropsWithRef<'div'> & MotionProps) {
  return (
    <motion.div className={cn(className)} {...restProps}>
      {children}
    </motion.div>
  )
}
