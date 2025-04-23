import { useExpandViewContext } from '@/context/expand-view'
import { useSizeContext } from '@/context/size'
import { cn } from '@/utils'
import { memo, type ComponentProps } from 'react'
import { ControlButtons } from '../control-buttons'
import { CollapseIcon } from '@/components/icons/collapse-icon'
import { ExpandIcon } from '@/components/icons/expand-icon'

type ControlButtonsPropsType = ComponentProps<'div'>

export const Controls = memo(function Controls({
  className,
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
          'absolute z-10 flex w-full justify-between items-center gap-3 p-2',
          className,
        )}
        {...restProps}>
        <ControlButtons />

        {!isMobile && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              toggleFullScreen()
            }}
            className='flex h-12 w-12 cursor-pointer flex-shrink-0 items-center justify-center rounded-full bg-black/40'>
            {isFullScreen ? (
              <CollapseIcon variant='light' />
            ) : (
              <ExpandIcon variant='light' />
            )}
          </div>
        )}
      </div>
    </>
  )
})
