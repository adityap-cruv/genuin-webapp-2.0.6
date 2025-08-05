import { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { useExpandViewContext } from '@/components/expand-view/context'
import { useSizeContext } from '@/context/size'

export function ActionItem({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  const { isMobile } = useSizeContext()
  const { isFullScreen } = useExpandViewContext()

  if (!isFullScreen || (isMobile && isFullScreen)) return children

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='p-2 rounded-full bg-secondary-400 cursor-pointer'>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side='right'
          className='bg-secondary-400'>
          <p className='text-white'>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
