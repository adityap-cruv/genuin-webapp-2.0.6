'use client'
import { getCommunityLoops } from '@lib/api/community'
import Image from 'next/image'
import noLoopsImage from '@images/noLoopImage.svg'
import { getLoopVideos } from '@lib/api/loop'
import { memo, useState, useEffect } from 'react'
import { type VideoPlayerModalLoopType } from '@lib/schemas/player/video'
import { LoopCard, LoopCardShimmer } from '@components/common/loop-card'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { ExpandView } from '@/components/common/expand-view'

// TODO: remove this component from here and put at better location
// TODO: improve player-modal opening logic. As not meeting standards.
export const CommunityLoopTab = memo(Component)
function Component({ slug }: { slug: string }) {
  const { isFullScreen, toggleFullScreen } = usePlayerControlStore()
  const { isLoading, data } = getCommunityLoops(slug)
  const [modalController, setModalController] = useState<{
    open: boolean
    loop: VideoPlayerModalLoopType | null
  }>({
    open: false,
    loop: null,
  })

  useEffect(() => {
    if (!isFullScreen) {
      setModalController({
        open: false,
        loop: null,
      })
    }
  }, [isFullScreen])

  if (isLoading)
    return (
      <>
        <LoopCardShimmer />
        <LoopCardShimmer />
        <LoopCardShimmer />
      </>
    )

  if (!data || data.loops.length === 0) return <NoLoops />

  function getUnreadMessageCount(id: string) {
    const ans = data?.loops.find((item, index, arr) => {
      return item.chat_id === id
    })

    return ans?.unread_message_count ?? 0
  }

  return (
    <>
      {data.loops.map((item, index) => (
        <LoopCard
          key={item.chat_id}
          id={item.chat_id}
          description={item.group.group_description ?? ''}
          isViewAllowed={item.is_view_allowed}
          latestMessages={item.latest_messages.map((item) => ({
            owner: { userName: item.owner.username },
            thumbnail: item.thumbnail_url_m ? item.thumbnail_url_m : (item.thumbnail_url_l ?? item.thumbnail_url ?? ''),
            createdAt: item.message_at ?? '',
          }))}
          loopSlug={item.slug}
          memberCount={item.group.no_of_members}
          members={item.group.members.map((item) => ({
            isAvatar: item.is_avatar,
            name: item.name ?? '',
            profileImage: item.profile_image,
            userName: item.username,
          }))}
          latestMessageAt={item.latest_message_at ?? ''}
          onClickOnImage={(id) => {
            setModalController((x) => {
              const newLoop = data.loops.find((item) => item.chat_id === id)
              if (newLoop && id)
                x.loop = {
                  id,
                  slug: newLoop.slug,
                  name: newLoop.group.group_name,
                  description: newLoop.group.group_description ?? '',
                }
              x.open = true
              toggleFullScreen(true)
              return { ...x }
            })
          }}
          name={item.group.group_name ?? ''}
          viewCount={item.group.no_of_views}
          unreadMessageCount={item.unread_message_count}
          noOfVideos={item.group.no_of_videos}
          position={item.position}
        />
      ))}
      {modalController.loop && (
        <PlayerModalWrapper
          unreadMessageCount={getUnreadMessageCount(modalController.loop.id)}
          open={modalController.open}
          slug={modalController.loop.slug}
          close={() => {
            setModalController((x) => {
              x.open = false
              return { ...x }
            })
            toggleFullScreen(false)
          }}
        />
      )}
    </>
  )
}

function NoLoops() {
  return (
    <div className="bg-monochrome-11 flex h-full flex-col items-center justify-center">
      <Image src={noLoopsImage} alt="share" />
      <p className="text-title-2-bold">No Groups... yet!</p>
      <p className="text-body-1-demi text-monochrome w-[80%] text-center">
        Groups are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
        and enjoy engaging comments from the community.
      </p>
    </div>
  )
}

type PlayerModalWrapperProps = {
  open: boolean
  slug: string
  close: () => void
  unreadMessageCount: number
}

function PlayerModalWrapper({ open = false, close, slug, unreadMessageCount }: PlayerModalWrapperProps) {
  const { data, fetchNextPage, isError, isFetchingNextPage, isLoading } = getLoopVideos(slug)
  const videos = data?.pages.flatMap((item: any) => item.videos)

  if (videos)
    return (
      <ExpandView
        fetchNextVideos={fetchNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        startIndex={0}
        isLoading={isLoading}
        open={open}
        videos={videos}
        close={close}
        unreadMessageCount={unreadMessageCount}
      />
    )
}
