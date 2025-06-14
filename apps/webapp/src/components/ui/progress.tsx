'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'motion/react'

import { cn } from '@lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('bg-secondary relative w-full overflow-hidden', className)}
    {...props}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value ?? 0}%`, transition: { ease: 'linear', duration: 1 } }}
      className="bg-primary h-full w-full flex-1"
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
