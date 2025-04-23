'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'framer-motion'

import { cn } from '@lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative w-full overflow-hidden bg-secondary', className)}
    {...props}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value ?? 0}%`, transition: { ease: 'linear', duration: 1 } }}
      className="h-full w-full flex-1 bg-primary"
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
