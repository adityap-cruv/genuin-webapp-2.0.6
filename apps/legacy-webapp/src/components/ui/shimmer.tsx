import { cn } from '@lib/utils'

function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-tertiary-200', className)} {...props} />
}

export { Shimmer }
