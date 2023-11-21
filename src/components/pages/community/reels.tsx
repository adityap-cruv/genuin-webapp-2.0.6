'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import noLoopImage from '@images/noLoopImage.svg'

const Player = dynamic(() => import('@components/common/player').then((comp) => comp.default), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})
const Comments = dynamic(() => import('./comments').then((comp) => comp.Comments))
interface CommunityReelsProps {
  communityHandle: string
}

//todo create error in api component
export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, isError, isFetched, fetchNextPage, isFetchingNextPage } = getCommunityVideos(communityHandle)
  const { scrollYProgress } = useScroll({ container: divRef })
  const videos = data?.pages.flatMap((item) => item.videos)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isFetchingNextPage) return
    if (Number(latest.toFixed(1)) >= 0.9) {
      fetchNextPage()
    }
  })

  return (
    <div className="relative z-10">
      <div
        className="hide-scrollbar relative h-full snap-y snap-mandatory snap-always overflow-y-auto overflow-x-clip"
        ref={divRef}>
        <InnerReelList videos={videos} isLoading={isLoading} divRef={divRef} />
      </div>
      {/* {isFetched && <Comments communityHandle="genuincommunity" videoId="23" />} */}
    </div>
  )
}

interface InnerReelListProps {
  videos?: any[]
  isLoading: boolean
  divRef: React.RefObject<HTMLDivElement>
}
function InnerReelList({ videos, isLoading, divRef }: InnerReelListProps) {
  if (isLoading) {
    return (
      <Loader
        size="lg"
        style={{
          height: divRef.current?.parentElement?.getBoundingClientRect().height || 0,
          width: ((divRef.current?.parentElement?.getBoundingClientRect().height || 0) * 9) / 16,
        }}
      />
    )
  }
  if (!videos?.length) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center px-14"
        style={{ width: ((divRef.current?.parentElement?.getBoundingClientRect().height || 0) * 9) / 16 }}>
        <Image src={noLoopImage} alt="no loops found" />
        <p className="pt-4 text-title-lg">No Loops... yet!</p>
        <p className="pt-2 text-center text-body-sm text-secondary">
          Loops are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
          and enjoy engaging comments from the community.
        </p>
      </div>
    )
  }
  return videos.map((video, index) => {
    return (
      <Player
        key={index}
        shouldPlay
        videoData={video}
        isFirstPlayerInList={index === 0}
        sizeBox={{
          height: divRef.current?.parentElement?.getBoundingClientRect().height || 0,
          width: ((divRef.current?.parentElement?.getBoundingClientRect().height || 0) * 9) / 16,
        }}
        loop
        playIfInViewPort
        showCommunityControl
      />
    )
  })
}
