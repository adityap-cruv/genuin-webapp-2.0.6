import { useShallow } from 'zustand/react/shallow'
import { usePlayerControlStore } from '../../player-control-store'
import { cn } from '@/lib/utils'

interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ActionItem({ children, onClick, title, className, ...props }: ActionItemProps) {
  const { isFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
    }))
  )

  return (
    <div
      onClick={onClick}
      title={title}
      className={cn('my-2 cursor-pointer', className, { 'rounded-full bg-secondary-400 p-2': isFullScreen })}
      {...props}>
      {children}
    </div>
  )
}
