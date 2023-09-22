import { cn } from '@lib/utils'

function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-secondary', className)} {...props} />
}

export { Shimmer }
