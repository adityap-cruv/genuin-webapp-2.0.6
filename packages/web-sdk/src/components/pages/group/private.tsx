import { LockIcon } from '@/components/icons/lock-icon'
import { cn } from '@/utils'
import { type ComponentProps } from 'react'

type PrivateGroupPropsType = ComponentProps<'div'>

// TODO: Check if private community and private Group component can be merged.
export function PrivateGroup({
  className,
  style,
  ...restProps
}: PrivateGroupPropsType) {
  return (
    <div
      className={cn(
        'mt-4 flex bg-tertiary-200 w-full items-center justify-center overflow-hidden',
        className,
      )}
      style={{ height: 'calc(100% - 320px)', ...style }}
      {...restProps}>
      <div className='flex flex-col items-center justify-center'>
        <LockIcon className='w-16 h-16 stroke-secondary' />
        <p className='text-center text-title-2-demi'>
          This Group is visible to its
          <br /> Members only
        </p>
      </div>
    </div>
  )
}
