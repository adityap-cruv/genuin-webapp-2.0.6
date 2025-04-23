import { type ComponentProps } from 'react'
import { cn } from '@/utils'
import { ChevronRightIcon } from '@/components/icons/chevron-right'

type ItemProps = React.ComponentPropsWithoutRef<'div'> & {
  title: string
  value?: string
  isActive?: boolean
  children?: React.ReactElement<ComponentProps<'svg'>>
  /**
   * If true, the right element will be displayed.
   */
  showRightElement?: boolean
  /**
   * Custom right element to display instead of the default ChevronRightIcon.
   * Can be any React component. Only displayed if hasRightElement, hasRightIcon, or showRightChevron is true.
   */
  rightElement?: React.ReactNode
}

export function ListItem({
  title,
  value,
  isActive,
  children,
  className,
  showRightElement = true,
  rightElement,
  ...restProps
}: ItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-x-3 rounded-md p-3 hover:cursor-pointer hover:bg-tertiary-200',
        className,
      )}
      {...restProps}>
      {children}
      <div
        className={cn(
          'flex items-center gap-x-3 w-full',
          showRightElement && 'justify-between',
        )}>
        <p
          className={cn(
            'break-all whitespace-nowrap !text-title-3-demi',
            isActive && 'text-primary',
          )}>
          {title}
        </p>
        <div className='flex items-center gap-x-2'>
          {value && <p className='text-body-1-demi text-tertiary'>{value}</p>}
          {showRightElement &&
            (rightElement || <ChevronRightIcon className='h-6 w-6 shrink-0' />)}
        </div>
      </div>
    </div>
  )
}
