import { getFeaturedLoops } from './api'
import { LoopsLoader } from './loader'
import { cn } from '@/utils'
import { LoopCard } from '@/components/loop-card'
import { type ComponentProps } from 'react'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type LoopsPropsType = ComponentProps<'div'>

export function Loops({ className, ...restProps }: LoopsPropsType) {
  const { data: loopList, isLoading, isError } = getFeaturedLoops()
  const pathName = usePathNameWithSubdomain()

  if (isError) {
    return
  }

  return (
    <div
      className={cn('w-full h-auto', className)}
      {...restProps}>
      <p className='pb-2 pt-6 text-title-1-bold'>Featured Groups</p>
      {isLoading ? (
        <div
          className={
            'grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2'
          }>
          <LoopsLoader />
        </div>
      ) : (
        <div
          className={cn(
            'grid h-auto w-full grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2',
          )}>
          {loopList?.map((loop, index) => {
            return (
              <LoopCard
                key={index}
                className='w-full'
                description={loop.group.group_description ?? ''}
                id={loop.chat_id}
                isViewAllowed={loop.is_view_allowed}
                latestMessages={loop.latest_messages.map((message) => ({
                  owner: { userName: message.owner.username },
                  thumbnail: message.thumbnail_url_m
                    ? message.thumbnail_url_m
                    : message.thumbnail_url_l ?? message.thumbnail_url ?? '',
                  createdAt: message.message_at,
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
                name={loop.group.group_name ?? ''}
                viewCount={loop.group.no_of_views}
                noOfVideos={loop.group.no_of_videos}
                onClickOnImage={() => {
                  // TODO: navigate to video page once integrated in sdk.
                  if (loop.latest_messages.length > 0)
                    window.open(
                      pathName.video(loop.latest_messages[0].slug),
                      '_blank',
                    )
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
