import { cn } from '@/utils'
import { ComponentProps } from 'react'

type GeneralErrorPropsType = ComponentProps<'div'> & { errorMessage?: string }

export function GeneralError({
  className,
  errorMessage = 'Please try again.',
  ...restProps
}: GeneralErrorPropsType) {
  return (
    <div
      className={cn(
        'flex items-center bg-tertiary-200 justify-center h-full w-full',
        className,
      )}
      {...restProps}>
      <p className='text-red-500 text-title-2-demi'>{errorMessage}</p>
    </div>
  )
}
