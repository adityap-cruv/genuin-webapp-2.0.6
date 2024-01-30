import { useRef, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { getLoopVideos } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { pushUrlWithoutReload } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
const PlayerListModal = dynamic(
  async () => await import('@components/common/modals/player-list-modal').then((comp) => comp.PlayerListModal)
)

export function HorizontalVideosList({ loopId }: { loopId: string }) {
  const divRef = useRef<HTMLDivElement>(null)
  const [modalState, setModalState] = useState({ clickedIndex: -1, isOpen: false })

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(loopId)
  const { scrollXProgress } = useScroll({ container: divRef })
  const videosDetailsList = data?.pages.flatMap((page) => page.videos)

  useMotionValueEvent(scrollXProgress, 'change', (latest) => {
    if (Number(latest.toPrecision(2)) > 0.8 && !isFetchingNextPage) {
      if (!isFetchingNextPage) void fetchNextPage()
    }
  })

  return (
    <div className="block h-60 min-h-max w-full">
      <div className="h-full w-full overflow-y-hidden overflow-x-scroll scroll-smooth whitespace-nowrap" ref={divRef}>
        {isLoading && <Loader size="md" />}
        {videosDetailsList?.map((item, index) => {
          return (
            <div
              key={index}
              className="relative mx-1 inline-block h-full cursor-pointer duration-300 hover:scale-95"
              onClick={(e) => {
                pushUrlWithoutReload({
                  pathname: PATH_NAME.video(item.video.slug),
                  query: [{ key: 'l', value: item.loop?.share_string }],
                })
                setModalState({ isOpen: true, clickedIndex: index })
              }}>
              <img src={item.video.thumbnail} className="h-full" />
              {/* <Image
                  src={item.video.thumbnail ?? ''}
                  alt={item.video.description ?? ''}
                  className="object-fill"
                  fill
                /> */}
              <p className="absolute left-1 top-1 text-body-1-bold text-monochrome-white">
                {item.video?.metadata?.duration + 's'}
              </p>
            </div>
          )
        })}
        {modalState.isOpen && videosDetailsList && (
          <PlayerListModal
            startIndex={modalState.clickedIndex}
            videosData={videosDetailsList}
            onOpenChange={(open) => {
              setModalState((x) => {
                x.isOpen = open
                return { ...x }
              })
            }}
            closeModal={() => {
              setModalState((x) => {
                x.isOpen = false
                return { ...x }
              })
            }}
          />
        )}
      </div>
      {hasNextPage && (
        <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-monochrome-white to-transparent opacity-90" />
      )}
    </div>
  )
}
