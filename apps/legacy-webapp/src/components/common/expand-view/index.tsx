'use client'
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { TopBar } from '@/components/layouts/mobile/top-bar'
import { Feed } from '../feed'

type Props = {
  children?: React.ReactNode
  videos: VideoPlayerModalType[]
  /**
   * Index to start playing video from.
   * @default 0
   */
  startIndex: number
  fetchNextVideos: () => void
  fetchPreviousVideos?: (index: number) => void
  isFetchingNextPage: boolean
  isError: boolean
  /**
   * Controls if modal should open or not.
   * @default false
   */
  open: boolean
  close: () => void
  isLoading: boolean
  unreadMessageCount?: number
  isInModal?: boolean
  hasNextPage?: boolean
  onCommunityJoin?: (communityId: string, role: CommunityUserRoleType) => void
}

export const ExpandView = ({
  open = false,
  hasNextPage,
  close,
  fetchNextVideos,
  isFetchingNextPage,
  isLoading,
  startIndex,
  videos,
  onCommunityJoin,
  unreadMessageCount,
}: Props) => {
  const { isMobile } = useGenuinOptions()

  if (!open) return null

  return (
    <div
      className={cn('fixed inset-0 z-50 flex h-full w-full items-center justify-center gap-x-6 bg-monochrome-black')}>
      {isLoading ? (
        <Loader size="md" />
      ) : isMobile ? (
        <div className="relative h-full w-full overflow-clip bg-monochrome-white">
          <TopBar showClose className="fixed left-0 top-0" variant="transparent" onClose={close} />
          <Feed.mobile
            isError={false}
            videos={videos}
            isFetchingNextPage={isFetchingNextPage}
            isLoading={isLoading}
            startIndex={startIndex}
            fetchNextPage={fetchNextVideos}
            hasNextPage={hasNextPage}
            unreadMessageCount={unreadMessageCount}
          />
        </div>
      ) : (
        <Feed.desktop
          hasNextPage={hasNextPage ?? true}
          isLoading={isLoading}
          startIndex={startIndex}
          videos={videos}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextVideos}
          unreadMessageCount={unreadMessageCount}
        />
      )}
    </div>
  )
}
