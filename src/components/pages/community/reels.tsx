'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { Key, useRef } from 'react'

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
  const { data: videos, isLoading, isError, isFetched } = getCommunityVideos(communityHandle)

  return (
    <div className="relative z-10">
      <div
        className="hide-scrollbar relative h-full snap-y overflow-y-auto overflow-x-clip"
        ref={divRef}
        style={{
          width: (divRef.current?.parentElement?.getBoundingClientRect().height || 0) * (9 / 16),
        }}>
        {isLoading && <Loader size="lg" className="h-full w-full" />}
        {isError && <div>Something went wrong with api.</div>}
        {videos?.length === 0 && <NoReelsAvailable />}
        {isFetched &&
          videos &&
          videos.map((video: {
              video: { id: string; url: string; share_string: string; description?: string | null | undefined; link?: string | null | undefined; created_at?: string | undefined; updated_at?: string | undefined; thumbnail?: string | undefined; metadata?: { type: string; duration?: number | null | undefined; height?: number | null | undefined; width?: number | null | undefined } | undefined; view_count?: number | null | undefined; reply_count?: number | null | undefined }; owner: {
                nickname: string; is_avatar:
                  //todo create error in api component
                  boolean; profile_image?: string | undefined; username?: string | undefined
              }; video_type?: "rt" | "public_video" | undefined; loop?: { share_string: string; name?: string | undefined; description?: string | null | undefined; profile_image?: string | null | undefined; discoverable?: boolean | undefined; preview_image?: string | null | undefined } | undefined
            } | undefined, index: Key | null | undefined) => {
            return (
              <Player
                key={index}
                shouldPlay={index === 0}
                videoData={video}
                sizeBox={{
                  height: divRef.current?.parentElement?.getBoundingClientRect().height || 0,
                  width: ((divRef.current?.parentElement?.getBoundingClientRect().height || 0) * 9) / 16,
                }}
                loop
                playIfInViewPort
              />
            )
          })}
      </div>
      {/* {isFetched && <Comments communityHandle="genuincommunity" videoId="23" />} */}
    </div>
  )
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
