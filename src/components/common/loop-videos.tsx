import { Loader } from '@components/ui/loader'
import { getLoopVideos } from '@lib/api/loop'
import { PlayerModal } from './modals/player-modal'
import Image from 'next/image'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { isMobile } from 'react-device-detect'
import { useRef, useState } from 'react'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useMotionValueEvent, useScroll } from 'framer-motion'

export function LoopVideos({ slug }: { slug: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(slug)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const videos = data?.pages.flatMap((item) => item.videos)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  // TODO: Add shimmer in images.
  return (
    <div ref={scrollDivRef} className="h-full w-full overflow-y-auto">
      {!isMobile && <p className="my-2 text-title-3-bold">Posts</p>}
      {isLoading && <Loader size="md" />}
      {videos?.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-4 grid grid-cols-2 gap-4">
        {videos?.map((item, index) => (
          <div
            key={index}
            className="relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer">
            <Image
              src={item.video.thumbnail ?? ''}
              alt={item.video.description ?? ''}
              className="h-full w-full rounded-xl object-fill"
              fill
              onMouseEnter={() => {
                setSelectedIndex(index)
              }}
              onMouseLeave={() => {
                setSelectedIndex(null)
              }}
              style={{ filter: selectedIndex === index ? 'brightness(60%)' : 'brightness(100%)' }}
            />
            {/* <p className="absolute left-2 top-2 text-title-sm text-monochrome-white">
                    {item.video?.metadata.duration + 's'}
                  </p> */}
            <div className="absolute bottom-2 left-2">
              <Link href={{ pathname: PATH_NAME.profile(item.owner.nickname) }}>
                <div className="flex h-6 w-6 items-center">
                  <CustomAvatar
                    className="h-full w-full bg-red-40"
                    imageUrl={item.owner.profile_image}
                    isAvatar={item.owner.is_avatar}
                    fallbackString={item.owner.nickname}
                  />
                  <p className="ml-1 text-body-1-bold text-monochrome-white">@{item.owner.nickname}</p>
                </div>
              </Link>
              <p className="ml-1 line-clamp-2 text-body-1-demi text-monochrome-white">{item.video.description}</p>
            </div>
            {selectedIndex === index && <Image src={icPlay} alt="play" className="absolute" height={40} />}
          </div>
        ))}
      </div>
      {isFetchingNextPage && <Loader size="md" />}
    </div>
  )
}
