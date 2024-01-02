import { Loader } from '@components/ui/loader'
import { getLoopVideos } from '@lib/api/loop'
import { FeedModal } from './modals/feed-modal'
import Image from 'next/image'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { isMobile } from 'react-device-detect'

export function LoopVideos({ slug }: { slug: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getLoopVideos(slug)

  const handleSeeMoreClick = () => {
    void fetchNextPage()
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      {!isMobile && <p className="my-2 text-title-3-bold">Posts</p>}
      {isLoading && <Loader size="md" />}
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-4 grid grid-cols-2 gap-4">
        {data?.pages
          .flatMap((page) => page.videos)
          .map((item, index) => (
            <FeedModal key={index} videos={data?.pages.flatMap((page) => page.videos)}>
              <div key={index} className="relative aspect-reel w-full duration-300 hover:cursor-pointer">
                <Image
                  src={item.video.thumbnail ?? ''}
                  alt={item.video.description ?? ''}
                  className="h-full w-full rounded-xl object-fill"
                  fill
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
              </div>
            </FeedModal>
          ))}
      </div>
      {isFetchingNextPage && <Loader size="md" />}
      {hasNextPage && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center py-4 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See More
        </p>
      )}
    </div>
  )
}
