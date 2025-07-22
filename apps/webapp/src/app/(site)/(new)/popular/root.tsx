'use client'
import { FeedSkeleton } from '@genuin/components/templates/feed'
import dynamic from 'next/dynamic'

const Feed = dynamic(async () => await import('@genuin/components/templates/feed').then((comp) => comp.Feed), {
  loading(_) {
    return <FeedSkeleton />
  },
})

export function Root() {
  return <Feed feedType="POPULAR" />
}
