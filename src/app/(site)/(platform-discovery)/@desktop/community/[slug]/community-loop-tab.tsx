'use client'
import { getCommunityLoops } from '@lib/api/community'
import Image from 'next/image'
import noLoopsImage from '@images/noLoopImage.svg'
import { PlayerModal } from '@components/common/modals/player-modal'
import { getLoopVideos } from '@lib/api/loop'
import { memo, useState } from 'react'
import { type VideoPlayerModalCommunityType, type VideoPlayerModalLoopType } from '@lib/schemas/player/video'
import { LoopCard, LoopCardShimmer } from '@components/common/loop-card'

// TODO: remove this component from here and put at better location
// TODO: improve player-modal opening logic. As not meeting standards.
export const CommunityLoopTab = memo(Component)
function Component({
  handle,
  id,
  shareUrl,
  slug,
  brand,
  isJoinRequested,
  name,
  profileImage,
  type,
  userRole,
}: VideoPlayerModalCommunityType) {
  const { isLoading, data } = getCommunityLoops(slug)
  const [modalController, setModalController] = useState<{
    open: boolean
    loop: VideoPlayerModalLoopType | null
  }>({
    open: false,
    loop: null,
  })

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
            thumbnail: item.thumbnail_url ?? '',
            createdAt: item.message_at ?? '',
          }))}
          loopSlug={item.slug}
          memberCount={item.group.no_of_members}
          members={item.group.members.map((item, index) => ({
            isAvatar: item.is_avatar,
            name: item.name ?? '',
            profileImage: item.profile_image,
            userName: item.username,
          }))}
          onClickOnImage={(id) => {
            setModalController((x) => {
              const newLoop = data.loops.find((item) => item.chat_id === id)
              if (newLoop && id) x.loop = { id, slug: newLoop.slug, name: newLoop.group.group_name }
              x.open = true
              return { ...x }
            })
          }}
          name={item.group.group_name ?? ''}
          viewCount={item.group.no_of_views}
          unreadMessageCount={item.unread_message_count}
          noOfVideos={item.group.no_of_videos}
        />
      ))}
      {modalController.loop && (
        <PlayerModalWrapper
          unreadMessageCount={getUnreadMessageCount(modalController.loop.id)}
          open={modalController.open}
          loop={modalController.loop}
          community={{ handle, id, shareUrl, slug, brand, isJoinRequested, name, profileImage, type, userRole }}
          close={() => {
            setModalController((x) => {
              x.open = false
              return { ...x }
            })
          }}
        />
      )}
    </>
  )
}

function NoLoops() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-monochrome-11">
      <Image src={noLoopsImage} alt="share" />
      <p className="text-title-2-bold">No Groups... yet!</p>
      <p className="w-[80%] text-center text-body-1-demi text-monochrome">
        Groups are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
        and enjoy engaging comments from the community.
      </p>
    </div>
  )
}

type PlayerModalWrapperProps = {
  open: boolean
  community: VideoPlayerModalCommunityType
  loop: VideoPlayerModalLoopType
  close: () => void
  unreadMessageCount: number
}

function PlayerModalWrapper({ open = false, close, community, loop, unreadMessageCount }: PlayerModalWrapperProps) {
  const { data, fetchNextPage, isError, isFetchingNextPage, isFetching } = getLoopVideos({ community, loop })
  const videos = data?.pages.flatMap((item) => item.videos)

  if (videos)
    return (
      <PlayerModal.desktop
        fetchNextVideos={fetchNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        startIndex={0}
        isLoading={isFetching}
        open={open}
        videos={videos}
        close={close}
        unreadMessageCount={unreadMessageCount}
        isInModal={true}
      />
    )
}
