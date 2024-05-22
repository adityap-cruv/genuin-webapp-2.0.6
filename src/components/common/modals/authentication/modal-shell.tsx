import { cn } from '@lib/utils'

type ModalShellProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export function ModalShell({ children, className, ...props }: ModalShellProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-y-4 px-2 sm:min-w-[384px] sm:max-w-md sm:px-4',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}
