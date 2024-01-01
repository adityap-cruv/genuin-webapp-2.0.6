'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Image from 'next/image'
import noLoopImage from '@images/noLoopImage.svg'
import { type VideoSizeBoxType } from '@hooks/use-video-size-box'

const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})

type CommunityReelsProps = {
  communityHandle: string
  sizeBox: VideoSizeBoxType
}

// todo create error in api component
export function CommunityReels({ communityHandle, sizeBox }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getCommunityVideos(communityHandle)
  const { scrollYProgress } = useScroll({ container: divRef })
  const videos = data?.pages.flatMap((item) => item.videos)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isFetchingNextPage) return
    if (Number(latest.toFixed(1)) >= 0.9) {
      void fetchNextPage()
    }
  })

  // todo here id reel-list is given to block scroll when user open comments. find better way to do it.
  return (
    <div className="z-10 h-full w-full">
      <div
        id="reel-list"
        className="hide-scrollbar relative h-full w-full snap-y snap-mandatory snap-always overflow-y-auto overflow-x-clip"
        ref={divRef}>
        <InnerReelList videos={videos} isLoading={isLoading} sizeBox={sizeBox} />
      </div>
      {/* {isFetched && <Comments communityHandle="genuincommunity" videoId="23" />} */}
    </div>
  )
}

type InnerReelListProps = {
  videos?: any[]
  isLoading: boolean
  sizeBox: VideoSizeBoxType
}
function InnerReelList({ videos, isLoading, sizeBox }: InnerReelListProps) {
  if (isLoading) {
    return <Loader size="lg" />
  }
  if (!videos?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-14">
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
        sizeBox={sizeBox}
        key={index}
        shouldPlay
        videoData={video}
        isFirstPlayerInList={index === 0}
        loop
        playIfInViewPort
      />
    )
  })
}
