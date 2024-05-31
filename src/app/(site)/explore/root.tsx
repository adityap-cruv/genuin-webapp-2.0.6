'use client'
import { Loader } from '@components/ui/loader'
import { getFeaturedCommunity } from '@lib/api/community'

export function Root() {
  const { isLoading, data } = getFeaturedCommunity()

  console.log('data::,', data)

  if (isLoading)
    return (
      <div className="h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )

  return (
    <div>
      <p className="text-title-1-bold">Featured Communities</p>
    </div>
  )
}
