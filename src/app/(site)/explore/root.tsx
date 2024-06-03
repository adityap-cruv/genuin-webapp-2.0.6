'use client'
import { LoopCard } from '@components/common/loop-card'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { getFeaturedCommunity, getFeaturedLoops } from '@lib/api/community'
import { abbreviateNumber, cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'

export function Root() {
  return (
    <div className="h-full overflow-auto px-6 pb-6 md:px-4">
      <Communities />
      <Loops />
    </div>
  )
}

function Communities() {
  const { isLoading, data } = getFeaturedCommunity()

  if (isLoading) return null

  return (
    <>
      <p className="pb-2 pt-6 text-title-1-bold">Featured Communities</p>
      <div className="grid h-auto w-fit min-w-fit grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
        {data?.map((item) => {
          return (
            <div
              key={item.community_id}
              className="min-w[320px] max-w-[450px] rounded-lg border border-tertiary-300 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-x-2">
                  <CustomAvatar
                    fallbackString={item.name}
                    imageUrl={item.dp ?? ''}
                    isAvatar={false}
                    className="h-12 w-12"
                  />
                  <span>
                    <p className="line-clamp-1 break-all text-body-1-bold">{item.name}</p>
                    <p className="text-body-1-demi text-tertiary">{`${abbreviateNumber(item.no_of_members)} ${
                      item.no_of_members === 1 ? 'member' : 'members'
                    }`}</p>
                  </span>
                </span>
                <Button className="shrink-0 p-0 px-4 py-1">
                  <p>Join</p>
                </Button>
              </div>
              <p className="line-clamp-2 break-all pt-2 text-body-1-demi">{item.description}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Loops() {
  const { isLoading, data } = getFeaturedLoops()
  if (isLoading) return
  return (
    <>
      <p className="pb-2 pt-6 text-title-1-bold">Featured Loops</p>
      <div
        className={cn(
          'grid h-auto w-fit min-w-fit grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2',
          isLoading && 'h-[50vh]'
        )}>
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
              name={item.group.group_name ?? ''}
              onClickOnImage={() => {}}
              linkOnImage={{ pathname: PATH_NAME.video(item.latest_messages[0].slug) }}
              viewCount={item.group.no_of_views}
            />
          )
        })}
      </div>
    </>
  )
}
