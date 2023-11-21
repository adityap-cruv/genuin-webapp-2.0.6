import { useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { getLoopVideos } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { pushUrlWithoutReload } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
const PlayerModal = dynamic(() => import('@components/common/player-modal').then((comp) => comp.PlayerModal))

// todo we can create hook which accepts containerRef, callback to be called, and direction in which we should call callback.
export function HorizontalVideosList({ loopId }: { loopId: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(loopId)
  const { scrollXProgress } = useScroll({ container: divRef })

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(2)) > 0.8) {
      if (!isFetchingNextPage) fetchNextPage()
    }
  })

  return (
    <div className="relative h-40 w-full">
      <div className="h-full w-full overflow-y-hidden overflow-x-scroll scroll-smooth whitespace-nowrap" ref={divRef}>
        {isLoading && <Loader size="md" />}
        {data &&
          data.pages
            .flatMap((page) => page.videos)
            .map((item, index) => {
              return (
                <PlayerModal key={index} videoDetails={item}>
                  <div
                    className="relative mx-1 inline-block duration-300 hover:scale-95"
                    style={{
                      height: divRef.current?.getBoundingClientRect().height,
                      width: (divRef.current?.getBoundingClientRect().height ?? 0) * (9 / 16),
                    }}
                    onClick={(e) => {
                      pushUrlWithoutReload({
                        pathname: PATH_NAME.video(item.video.share_string),
                        query: [{ key: 'l', value: item.loop.share_string }],
                      })
                    }}>
                    <Image
                      src={item.video.thumbnail || ''}
                      alt={item.video.description || ''}
                      className="object-fill"
                      fill
                    />
                    <p className="absolute left-1 top-1 text-title-sm text-monochrome-white">
                      {item.video?.metadata.duration + 's'}
                    </p>
                  </div>
                </PlayerModal>
              )
            })}
      </div>
      {hasNextPage && (
        <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-monochrome-white to-transparent opacity-90" />
      )}
    </div>
  )
}
