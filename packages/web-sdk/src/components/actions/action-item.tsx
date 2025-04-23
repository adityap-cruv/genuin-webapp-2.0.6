import { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { useExpandViewContext } from '@/context/expand-view'

export function ActionItem({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  const { isFullScreen } = useExpandViewContext()

  if (!isFullScreen) return children

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='p-2 rounded-full bg-white/20 cursor-pointer'>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side='right'
          className='bg-white/20'>
          <p className='text-white'>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
