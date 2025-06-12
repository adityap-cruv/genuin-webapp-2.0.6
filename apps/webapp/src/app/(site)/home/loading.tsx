import { Skeleton } from '@genuin/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Hero section skeleton */}
        <div className="bg-secondary/[0.05] mb-8 h-[300px] w-full animate-pulse rounded-xl" />
        {/* Content skeletons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <Skeleton className="h-[200px] w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
