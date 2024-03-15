import { cn } from '@lib/utils'

type ModalShellProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export function ModalShell({ children, className, ...props }: ModalShellProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-y-4 px-0 sm:min-w-[384px] sm:px-4 lg:max-w-sm',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}
