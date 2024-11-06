import { Loader } from '@components/ui/loader'
import { getLoopVideos } from '@lib/api/loop'
import Image from 'next/image'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useState, useEffect, useId } from 'react'
import icPlay from '@icons/player-controls/icPlay.svg'
import { PlayerModal } from '@components/common/modals/player-modal'
import { useSearchParams } from 'next/navigation'
import { Shimmer } from '@components/ui/shimmer'
import { CustomImage } from '@/components/custom/custom-image'

type Props = {
  slug: string
}

export function LoopVideos({ slug }: Props) {
  const loaderId = useId()
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = getLoopVideos(slug)
  const videos = data?.pages.flatMap((item) => item.videos)
  const [modalControl, setModalControl] = useState({ open: false, startIndex: -1 })
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('show_videos') === '1') setModalControl({ startIndex: 0, open: true })
  }, [searchParams])

  useEffect(() => {
    if (!hasNextPage) return
    const lastElement = document.getElementById(loaderId)
    if (!lastElement) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        void fetchNextPage()
      }
    })
    observer.observe(lastElement)
    return () => {
      observer.disconnect()
    }
  }, [loaderId, hasNextPage])

  // TODO: Remove this component from here. and put it  in better location.
  // TODO: Imrove return.
  return (
    <div className="h-full w-full overflow-y-auto">
      {isLoading ? (
        <div className="my-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Shimmer
              key={index}
              className="group/video relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="my-4 grid grid-cols-2 gap-4">
            {videos?.length === 0 ? (
              <div className="flex items-center justify-center pt-32 text-title-3-bold">No posts available</div>
            ) : (
              videos?.map((item, index) => (
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
                  <CustomImage src={item.video.thumbnailM ?? ''} alt={item.video.slug} className="rounded-xl" fill />
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
              ))
            )}
          </div>
          {hasNextPage && (
            <div id={loaderId} className="flex h-20 w-full items-center justify-center">
              <Loader size="md" />
            </div>
          )}
        </>
      )}
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
    </div>
  )
}
