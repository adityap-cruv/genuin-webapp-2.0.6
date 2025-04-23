import { useShallow } from 'zustand/react/shallow'
import { usePlayerControlStore } from '../../player-control-store'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ActionItem({ children, onClick, title, className, ...props }: ActionItemProps) {
  const { isFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
    }))
  )

  const actionItem = (
    <div
      onClick={onClick}
      title={!isFullScreen ? title : undefined}
      className={cn('my-2 cursor-pointer', className, {
        'h-12 w-12 rounded-full bg-secondary-400 p-2': isFullScreen,
      })}
      {...props}>
      {children}
    </div>
  )

  if (!isFullScreen) return actionItem

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{actionItem}</TooltipTrigger>
        <TooltipContent side="right" className="bg-secondary-400 text-cap-1-med text-monochrome-white">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
