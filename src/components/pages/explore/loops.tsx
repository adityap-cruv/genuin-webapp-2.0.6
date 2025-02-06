'use client'
import { getFeaturedLoops } from '@/lib/api/community'
import { cn } from '@/lib/utils'
import { LoopCard, LoopCardShimmer } from '@/components/common/loop-card'
import { PATH_NAME } from '@/lib/utils/constants/path'

export function Loops() {
  const { isLoading, data, isError } = getFeaturedLoops()

  if (isError) return undefined

  return (
    <>
      <p className="pb-2 pt-6 text-title-1-bold">Featured Groups</p>
      {isLoading ? (
        <div className={cn('grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2')}>
          <LoopsShimmer />
        </div>
      ) : (
        <div className={cn('grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2')}>
          {data?.map((item, index) => {
            return (
              <LoopCard
                key={index}
                className="w-full"
                description={item.group.group_description ?? ''}
                id={item.chat_id}
                isViewAllowed={item.is_view_allowed}
                latestMessages={item.latest_messages.map((item) => ({
                  owner: { userName: item.owner.username },
                  thumbnail: item.thumbnail_url_m
                    ? item.thumbnail_url_m
                    : item.thumbnail_url_l ?? item.thumbnail_url ?? '',
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
                onClickOnImage={() => {}}
                linkOnImage={{ pathname: PATH_NAME.video(item.latest_messages[0]?.slug) }}
                viewCount={item.group.no_of_views}
                noOfVideos={item.group.no_of_videos}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

export function LoopsShimmer() {
  return (
    <>
      <LoopCardShimmer />
      <LoopCardShimmer />
      <LoopCardShimmer />
      <LoopCardShimmer />
    </>
  )
}
