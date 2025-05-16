import { GeneralError } from '@/components/general-error'
import { getCommunityLoops, getLoopFeed } from './api'
import { LoopCard, Loader as LoopCardShimmer } from '@/components/loop-card'
import { useMemo, useState } from 'react'
import { PlayerModal } from '@/components/player-modal'
import { getQueryKeyForLoopFeed } from '@/utils/constants/keys'
import {
  updateCommentCount,
  updateCommunityJoinStatus,
  updateSparkStatus,
} from '@/utils/react-query/feed'

export function CommunityLoops({ slug }: { slug: string }) {
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null)
  return (
    <>
      <Loops
        slug={slug}
        onClickOnLoopVideo={(loopId) => {
          setActiveLoopId(loopId)
        }}
      />
      {activeLoopId && (
        <PlayerModalWrapper
          activeLoopId={activeLoopId}
          closeModal={() => {
            setActiveLoopId(null)
          }}
        />
      )}
    </>
  )
}

function PlayerModalWrapper({
  activeLoopId,
  closeModal,
}: {
  activeLoopId: string
  closeModal: () => void
}) {
  const queryKeyForLoopFeed = getQueryKeyForLoopFeed(activeLoopId)
  const {
    data: videosData,
    fetchNextPage,
    isLoading,
  } = getLoopFeed(activeLoopId)

  const videos = useMemo(
    () => videosData?.pages.flatMap((page) => page.videos),
    [videosData],
  )

  return (
    <PlayerModal
      onSpark={(videoId, isSparked) => {
        updateSparkStatus(queryKeyForLoopFeed, videoId, isSparked)
      }}
      open
      closeModal={closeModal}
      fetchNextPage={() => fetchNextPage()}
      videos={videos}
      isLoading={isLoading}
      onCommunityRoleChanged={(communityId, role) => {
        updateCommunityJoinStatus(queryKeyForLoopFeed, communityId, role)
      }}
      onCommentCountChange={(videoId, count) => {
        updateCommentCount(queryKeyForLoopFeed, videoId, count)
      }}
    />
  )
}

function Loops({
  slug,
  onClickOnLoopVideo,
}: {
  slug: string
  onClickOnLoopVideo: (id: string) => void
}) {
  const { data: loops, isError, isLoading } = getCommunityLoops(slug)

  if (isLoading) return <Loader />
  if (isError || !loops) return <GeneralError />

  return loops.map((loop) => (
    <LoopCard
      className='mx-auto my-4'
      key={loop.chat_id}
      id={loop.chat_id}
      description={loop.group.group_description ?? ''}
      isViewAllowed={loop.is_view_allowed}
      latestMessages={loop.latest_messages.map((video) => ({
        owner: { userName: video.owner.username },
        thumbnail: video.thumbnail_url_m
          ? video.thumbnail_url_m
          : (video.thumbnail_url_l ?? video.thumbnail_url ?? ''),
        createdAt: video.message_at ?? '',
      }))}
      loopSlug={loop.slug}
      memberCount={loop.group.no_of_members}
      members={loop.group.members.map((member) => ({
        isAvatar: member.is_avatar,
        name: member.name ?? '',
        profileImage: member.profile_image,
        userName: member.username,
      }))}
      latestMessageAt={loop.latest_message_at ?? ''}
      onClickOnImage={() => {
        onClickOnLoopVideo(loop.slug)
      }}
      name={loop.group.group_name ?? ''}
      viewCount={loop.group.no_of_views}
      unreadMessageCount={loop.unread_message_count}
      noOfVideos={loop.group.no_of_videos}
    />
  ))
}

function Loader() {
  return (
    <>
      <LoopCardShimmer />
      <LoopCardShimmer />
      <LoopCardShimmer />
    </>
  )
}
