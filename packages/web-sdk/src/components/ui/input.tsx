import * as React from 'react'

import { cn } from '@/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[4px] border-solid !shadow-none border border-tertiary-300 bg-tertiary-100 px-3 py-2 placeholder:text-tertiary-400 invalid:border invalid:border-red-500 focus-visible:border-tertiary-400 focus-visible:!outline-none focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
