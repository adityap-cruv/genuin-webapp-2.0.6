import { Loader } from '@components/ui/loader'
import { getLoopVideos } from '@lib/api/loop'
import Image from 'next/image'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRef, useState, useEffect } from 'react'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { PlayerModal } from '@components/common/modals/player-modal'
import { type VideoPlayerModalCommunityType, type VideoPlayerModalLoopType } from '@lib/schemas/player/video'
import { useSearchParams } from 'next/navigation'
import { Shimmer } from '@components/ui/shimmer'

type Props = {
  loop: VideoPlayerModalLoopType
  community: VideoPlayerModalCommunityType
}

export function LoopVideos({ loop, community }: Props) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getLoopVideos({ community, loop })
  const videos = data?.pages.flatMap((item) => item.videos)
  const [modalControl, setModalControl] = useState({ open: false, startIndex: -1 })
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('show_videos') === '1') setModalControl({ startIndex: 0, open: true })
  }, [searchParams])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  // TODO: Remove this component from here. and put it  in better location.
  // TODO: Imrove return.
  return (
    <div ref={scrollDivRef} className="h-full w-full overflow-y-auto">
      {isLoading && (
        <div className="my-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Shimmer
              key={index}
              className="group/video relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer"
            />
          ))}
        </div>
      )}
      {videos?.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-3-bold">No posts available</div>
      )}
      <div className="my-4 grid grid-cols-2 gap-4">
        {videos?.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              setModalControl((x) => {
                x.open = true
                x.startIndex = index
                return { ...x }
              })
            }}
            className="group/video relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer">
            {/* <Image
              src={item.video.thumbnail ?? ''}
              alt={item.video.description ?? ''}
              className="h-full w-full rounded-xl object-fill"
              fill
            /> */}
            <img
              src={item.video.thumbnail}
              alt={item.video.descriptionText ?? ''}
              className="h-full w-full rounded-xl object-fill"
            />
            <div className="absolute bottom-2 left-2">
              <Link href={{ pathname: PATH_NAME.profile(item.owner.userName) }}>
                <div className="flex h-6 w-6 items-center">
                  <CustomAvatar
                    className="h-full w-full bg-red-40"
                    imageUrl={item.owner.profileImage}
                    isAvatar={item.owner.isAvatar}
                    fallbackString={item.owner.userName}
                  />
                  <p className="ml-1 text-body-1-bold text-monochrome-white">@{item.owner.userName}</p>
                </div>
              </Link>
              {item.video.descriptionText && (
                <p className="line-clamp-2 w-5/6 overflow-hidden break-all pt-2 text-body-1-med text-monochrome-white">
                  {item.video.descriptionText}
                </p>
              )}
            </div>
            <div className="absolute inset-0  hidden h-full w-full items-center justify-center rounded-lg bg-monochrome-black/40 group-hover/video:flex">
              <Image src={icPlay} alt="" />
            </div>
          </div>
        ))}
      </div>
      <PlayerModal.mobile
        close={() => {
          setModalControl((x) => {
            x.open = false
            return { ...x }
          })
        }}
        fetchNextVideos={fetchNextPage}
        isError={false}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        open={modalControl.open}
        startIndex={modalControl.startIndex}
        videos={videos}
      />
      {isFetchingNextPage && (
        <div className="flex w-full justify-center">
          <Loader size="md" />
        </div>
      )}
    </div>
  )
}
