import { TrendingCommunitiesSkeleton } from '@genuin/components/templates/trending-communities/trending-communities'
import { TrendingGroupsSkeleton } from '@genuin/components/templates/trending-groups/trending-groups'
export default function Loading() {
  return (
    <div className="flex flex-col gap-12 overflow-auto p-6">
      <TrendingGroupsSkeleton />
      <TrendingCommunitiesSkeleton />
    </div>
  )
}
