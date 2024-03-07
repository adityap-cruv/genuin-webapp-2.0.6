import { cn } from '@lib/utils'

type ModalShellProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export function ModalShell({ children, className, ...props }: ModalShellProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-[384px] flex-col items-center justify-center gap-y-4 px-2 sm:px-4 lg:max-w-sm',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}
