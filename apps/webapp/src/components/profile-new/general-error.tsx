import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

type GeneralErrorPropsType = ComponentProps<'div'> & { errorMessage?: string }

export function GeneralError({ className, errorMessage = 'Please try again.', ...restProps }: GeneralErrorPropsType) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-tertiary-200', className)} {...restProps}>
      <p className="text-red-500 text-title-2-demi">{errorMessage}</p>
    </div>
  )
}
