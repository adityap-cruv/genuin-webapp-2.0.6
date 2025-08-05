import { useExpandViewContext } from '@/components/expand-view/context'
import { useSizeContext } from '@/context/size'
import { cn } from '@/utils'
import { memo, type ComponentProps } from 'react'
import { ControlButtons } from '../control-buttons'
import { CollapseIcon } from '@/components/icons/collapse-icon'
import { ExpandIcon } from '@/components/icons/expand-icon'
import { CloseIcon } from '@/components/icons/close-icon'

type ControlButtonsPropsType = ComponentProps<'div'> & {
  index: number
  onCloseExpandView?: () => void
}

export const Controls = memo(function Controls({
  className,
  index,
  onCloseExpandView,
  ...restProps
}: ControlButtonsPropsType) {
  const { isMobile } = useSizeContext()
  const { toggleFullScreen, isFullScreen } = useExpandViewContext()
  return (
    <>
      <div
        className='absolute inset-0 h-20'
        style={{
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
        }}
      />
      <div
        className={cn(
          'absolute z-10 flex w-full top-4 sm:top-0 justify-between items-center gap-3 p-2 px-4',
          className,
        )}
        {...restProps}>
        <ControlButtons />

        <div
          onClick={(e) => {
            e.stopPropagation()
            toggleFullScreen(undefined, index)
            isFullScreen && onCloseExpandView?.()
          }}
          className={cn(
            'flex h-12 w-12 cursor-pointer flex-shrink-0 items-center justify-center rounded-full bg-black/40',
            isMobile ? 'h-9 w-9' : 'h-12 w-12',
          )}>
          {isFullScreen ? (
            isMobile ? (
              <CloseIcon
                variant='light'
                className='h-5 w-5'
              />
            ) : (
              <CollapseIcon
                variant='light'
                className={cn(isMobile && 'h-5 w-5')}
              />
            )
          ) : (
            <ExpandIcon
              variant='light'
              className={cn(isMobile && 'h-5 w-5')}
            />
          )}
        </div>
      </div>
    </>
  )
})
