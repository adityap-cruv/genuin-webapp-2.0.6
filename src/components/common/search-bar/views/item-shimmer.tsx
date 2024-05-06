import { Shimmer } from '@components/ui/shimmer'
import { type ReactNode } from 'react'

export function ItemShimmer({ count = 4 }: { count?: number }) {
  const compArr: ReactNode[] = []

  for (let i = 0; i < count; i++) {
    compArr.push(
      <div key={i} className="flex w-full items-center gap-x-2">
        <Shimmer className="h-10 w-10 rounded-full" />
        <span className="flex w-full flex-col gap-y-2">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-4 w-full pt-2" />
        </span>
      </div>
    )
  }
  return <div className="flex w-full flex-col gap-y-4 overflow-auto p-6">{compArr}</div>
}
