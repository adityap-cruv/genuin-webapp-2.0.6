import { getCommunityLoops } from '@lib/api/community'
import Image from 'next/image'
import noLoopsImage from '@images/noLoopImage.svg'
import { useState } from 'react'
import { PlayerModal } from '@components/common/modals/player-modal'
import { getLoopVideos } from '@lib/api/loop'
import { type VideoPlayerModalCommunityType, type VideoPlayerModalLoopType } from '@lib/schemas/player/video'
import { LoopCard, LoopCardShimmer } from '@components/common/loop-card'

// TODO: remove this component from here and put at better location
export function CommunityLoopTab({ community }: { community: VideoPlayerModalCommunityType }) {
  const { data, isLoading } = getCommunityLoops(community.slug)
  const [modalController, setModalController] = useState<{ open: boolean; loop: VideoPlayerModalLoopType | null }>({
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
    const loop = data?.loops.find((item, index) => {
      return item.chat_id === id
    })
    return loop?.unread_message_count ?? 0
  }

  if (data.loops.length !== 0)
    return (
      <>
        {data.loops.map((item, index) => {
          return (
            <LoopCard
              key={index}
              description={item.group.group_description ?? ''}
              id={item.chat_id}
              isViewAllowed={item.is_view_allowed}
              latestMessages={item.latest_messages.map((item) => ({
                owner: { userName: item.owner.username },
                thumbnail: item.thumbnail_url ?? '',
                createdAt: item.message_at,
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
              name={item.group.group_name ?? ''}
              onClickOnImage={(id) => {
                setModalController((x) => {
                  const newLoop = data.loops.find((item) => item.chat_id === id)
                  x.open = true
                  if (newLoop && id) x.loop = { id, slug: newLoop.slug, name: newLoop.group.group_name }
                  return { ...x }
                })
              }}
              viewCount={item.group.no_of_views}
              noOfVideos={item.group.no_of_videos}
            />
          )
        })}
        {modalController.loop && (
          <PlayerModalWrapper
            close={() => {
              setModalController((x) => {
                x.open = false
                return { ...x }
              })
            }}
            slug={modalController.loop.slug}
            open={modalController.open}
            unreadMessageCount={getUnreadMessageCount(modalController.loop.id)}
          />
        )}
      </>
    )
}

function NoLoops() {
  return (
    <div className="flex h-full">
      <div className="mt-4 flex flex-col items-center justify-center bg-tertiary-100">
        <Image src={noLoopsImage} alt="share" />
        <p className="text-title-2-bold">No Groups... yet!</p>
        <p className="w-[80%] text-center text-body-1-demi text-monochrome">
          Groups are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
          and enjoy engaging comments from the community.
        </p>
      </div>
    </div>
  )
}

type PlayerModalWrapperProps = {
  open: boolean
  slug: string
  close: () => void
  unreadMessageCount: number
}

function PlayerModalWrapper({ open = false, slug, close, unreadMessageCount }: PlayerModalWrapperProps) {
  const { data, fetchNextPage, isError, isFetchingNextPage, isFetching } = getLoopVideos(slug)
  const videos = data?.pages.flatMap((item) => item.videos)

  return (
    <PlayerModal.mobile
      fetchNextVideos={fetchNextPage}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      startIndex={0}
      isLoading={isFetching}
      open={open}
      videos={videos}
      close={close}
      unreadMessageCount={unreadMessageCount}
    />
  )
}
