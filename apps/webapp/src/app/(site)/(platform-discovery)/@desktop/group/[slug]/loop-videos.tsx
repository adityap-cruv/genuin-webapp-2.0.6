import { getLoopVideos } from '@lib/api/loop'
import Image from 'next/image'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useEffect, useId, useState } from 'react'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useSearchParams } from 'next/navigation'
import { Shimmer } from '@components/ui/shimmer'
import { CustomImage } from '@/components/custom/custom-image'
import { Loader } from '@/components/ui/loader'
import { PinIcon } from '@icons/pin-icon'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { ExpandView } from '@/components/common/expand-view'

type Props = { slug: string }
export function LoopVideos({ slug }: Props) {
  const searchParams = useSearchParams()
  const loaderId = useId()
  const { data, isLoading, fetchNextPage, isError, isFetchingNextPage, hasNextPage } = getLoopVideos(slug)
  const videos = data?.pages.flatMap((item: any) => item.videos)
  const { isFullScreen, toggleFullScreen } = usePlayerControlStore()

  const [modalControl, setModalControl] = useState({ open: false, startIndex: -1 })

  useEffect(() => {
    if (searchParams.get('show_videos') === '1') setModalControl({ startIndex: 0, open: true })
  }, [searchParams])

  useEffect(() => {
    if (!isFullScreen) {
      setModalControl({ open: false, startIndex: -1 })
    }
  }, [isFullScreen])

  useEffect(() => {
    if (!hasNextPage || isLoading) return
    const lastElement = document.getElementById(loaderId)
    if (!lastElement) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.length > 0 && entries[0]?.isIntersecting) {
        void fetchNextPage()
      }
    })
    observer.observe(lastElement)
    return () => {
      observer.disconnect()
    }
  }, [loaderId, hasNextPage, isLoading])

  // TODO: Remove this component from here. and put it  in better location.
  return (
    <div className="h-full w-full overflow-y-auto">
      <p className="text-title-3-bold mt-2 mb-1">Posts</p>
      {isLoading ? (
        <div className="my-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Shimmer
              key={index}
              className="group/video aspect-reel relative flex w-full items-center justify-center duration-300 hover:cursor-pointer"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-2 gap-4">
            {!videos || videos.length === 0 ? (
              <div className="text-title-3-bold flex items-center justify-center pt-32">No posts available</div>
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
                    toggleFullScreen(true)
                  }}
                  className="group/video aspect-reel relative flex w-full items-center justify-center duration-300 hover:cursor-pointer">
                  <CustomImage
                    src={item.video.thumbnailM ?? item.video.thumbnail}
                    alt={item.video.slug}
                    className="rounded-xl"
                    fill
                  />
                  {item.video.is_pinned && <PinIcon className="fill-monochrome-white absolute top-2 right-2 h-6 w-6" />}
                  <div className="absolute bottom-2 left-2">
                    <Link href={{ pathname: PATH_NAME.profile(item.owner.userName) }}>
                      <div className="flex h-6 w-6 items-center">
                        <CustomAvatar
                          className="bg-red-40 h-full w-full"
                          imageUrl={item.owner.profileImage}
                          isAvatar={item.owner.isAvatar}
                          fallbackString={item.owner.userName}
                        />
                        <p className="text-body-1-bold text-monochrome-white ml-1">@{item.owner.userName}</p>
                      </div>
                      {item.video.descriptionText && (
                        <p className="text-body-1-med text-monochrome-white line-clamp-2 w-5/6 overflow-hidden pt-2 break-all">
                          {item.video.descriptionText}
                        </p>
                      )}
                    </Link>
                    {/* <p className="ml-1 line-clamp-2 text-body-1-demi text-monochrome-white">{item.video.description}</p> */}
                  </div>
                  <div className="bg-monochrome-black/40 absolute inset-0 hidden h-full w-full items-center justify-center rounded-lg group-hover/video:flex">
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

      <ExpandView
        videos={videos ?? []}
        isLoading={isLoading}
        close={() => {
          setModalControl((x) => {
            x.open = false
            return { ...x }
          })
          toggleFullScreen(false)
        }}
        fetchNextVideos={fetchNextPage}
        isError={isError}
        open={modalControl.open}
        isFetchingNextPage={isFetchingNextPage}
        startIndex={modalControl.startIndex}
      />
    </div>
  )
}
