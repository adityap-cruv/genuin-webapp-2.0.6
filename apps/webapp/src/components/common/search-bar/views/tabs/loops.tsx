import { PATH_NAME } from '@lib/utils/constants/path'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { abbreviateNumber, getTimeAgo } from '@lib/utils'
import { type LoopResType } from '../../schema/top-resp'
import Link from 'next/link'
import icLock from '@icons/icLock.svg'
import icPlay from '@icons/player-controls/icPlay.svg'
import Image from 'next/image'
import { NoResults } from './no-results'
import { useSearchBarStore } from '../../store'
import { CustomImage } from '@/components/custom/custom-image'

export function Loops({ loops }: { loops?: LoopResType[] }) {
  if (loops)
    return (
      <div className="flex flex-col gap-y-3 px-4 pt-4 pb-16 sm:py-4">
        {loops.map((item) => (
          <LoopItem key={item.chat_id} loop={item} />
        ))}
      </div>
    )

  return <NoResults />
}

export function LoopItem({ loop }: { loop: LoopResType }) {
  const { close } = useSearchBarStore()
  function getCollaboratorsCountString(count: any) {
    let str = ' + '
    if (!count) return
    if (count === 1) {
      str += abbreviateNumber(count) + ' Other'
    } else {
      str += abbreviateNumber(count) + ' Others'
    }
    return str
  }

  function Members() {
    const members = loop.group.members
    return (
      <>
        {members[0] && (
          <CustomAvatar
            className="border-tertiary-100 z-[3] h-6 w-6 border-2 bg-red-50"
            imageUrl={members[0].profile_image_s ?? members[0].profile_image ?? ''}
            isAvatar={members[0].is_avatar}
            fallbackString={members[0].name ?? ''}
          />
        )}
        {members.length !== 0 && members[1] && (
          <CustomAvatar
            className="border-tertiary-100 absolute left-3 z-[2] h-6 w-6 border-2 bg-red-50"
            imageUrl={members[1].profile_image_s ?? members[1].profile_image ?? ''}
            isAvatar={members[1].is_avatar}
            fallbackString={members[1].name ?? ''}
          />
        )}
        {members.length !== 0 && members[2] && (
          <CustomAvatar
            className="border-tertiary-100 absolute left-6 h-6 w-6 border-2 bg-red-50"
            imageUrl={members[2].profile_image_s ?? members[2].profile_image ?? ''}
            isAvatar={members[2].is_avatar}
            fallbackString={members[2].name ?? ''}
          />
        )}
      </>
    )
  }

  return (
    <div onClick={close} className="relative">
      <Link href={{ pathname: PATH_NAME.loop(loop.slug) }}>
        <div className="border-tertiary-300 bg-monochrome-white relative w-full rounded-lg border">
          <div className="w-[60%] items-center p-[3%]">
            <p className="text-body-1-demi line-clamp-2 break-all">{loop.group.group_name}</p>
            {loop.latest_messages.length === 0 ? (
              <p className="text-cap-1-bold text-secondary-300 line-clamp-1 break-all">
                @{loop.group?.members[0]?.username} created ∙ {getTimeAgo(loop.latest_message_at)}
              </p>
            ) : (
              loop.latest_messages.length !== 0 &&
              loop.is_view_allowed && (
                <p className="text-cap-1-bold text-secondary-300 line-clamp-1 w-full break-all">
                  @{loop.latest_messages[0]?.owner.username} posted ∙ {getTimeAgo(loop.latest_messages[0]?.message_at)}
                </p>
              )
            )}
          </div>
          <div className="border-tertiary-200 bg-tertiary-100 h-[60%] rounded-b-lg border p-4">
            <div className="w-[60%]">
              <div className="flex items-center">
                <div className="relative flex">
                  <Members />
                </div>
                <p
                  className={`text-body-1-med text-secondary-300 ml-1 line-clamp-1 ${
                    loop.group.members.length !== 1 && 'ml-7'
                  } ${loop.group.members.length === 3 && 'ml-6'}`}>
                  {loop.group.members[0]?.username}
                  {getCollaboratorsCountString(loop.group.members.length - 1)}
                </p>
              </div>
              <p className="text-body-1-demi text-secondary-300 my-[2%] line-clamp-2">{loop.group.group_description}</p>
              <p className="text-body-1-med text-secondary-300 line-clamp-1 break-all">
                {abbreviateNumber(loop.group.no_of_videos)} posts ∙ {abbreviateNumber(loop.group.no_of_views)} views
              </p>
            </div>
          </div>
        </div>
      </Link>
      {!loop.is_view_allowed ? (
        <div className="group/video aspect-reel border-secondary-300 bg-monochrome-white absolute top-[50%] right-7 flex h-[85%] -translate-y-1/2 items-center justify-center rounded border hover:cursor-pointer">
          <div className="bg-secondary-200 rounded-full p-2">
            <Image src={icLock} alt="share" className="h-4 w-4" width={16} height={16} />
          </div>
        </div>
      ) : loop.latest_messages.length === 0 ? (
        <div className="group/video aspect-reel border-monochrome-black/20 bg-monochrome-white absolute top-[50%] right-7 flex h-[80%] -translate-y-1/2 items-center justify-center rounded border hover:cursor-pointer">
          <div className="bg-secondary-200 rounded-full p-2">
            <p className="text-cap-2-demi text-tertiary-400 ml-1 line-clamp-1"> No posts yet</p>
          </div>
        </div>
      ) : (
        <RenderedImages videos={loop.latest_messages} slug={loop.slug} />
      )}
    </div>
  )
}

function RenderedImages({ videos, slug }: { videos: any[]; slug: string }) {
  const videosLength = videos.length
  const transformValues: any = {
    1: [50],
    2: [48, 52],
    3: [46, 50, 54],
  }

  const rightValues: any = {
    1: [20],
    2: [24, 16],
    3: [28, 20, 12],
  }

  const opacitValues: any = {
    1: [1],
    2: [1, 0.5],
    3: [1, 0.66, 0.4],
  }

  return videos.map((item: any, index: number) => {
    return (
      <Link
        href={{ pathname: PATH_NAME.loop(slug), query: 'show_videos=1' }}
        key={index}
        className="group/video aspect-reel absolute top-[50%] flex h-[90%] items-center justify-center rounded hover:cursor-pointer"
        style={{
          right: `${rightValues[videosLength][index]}px`,
          transform: `translateY(-${transformValues[videosLength][index]}%)`,
          zIndex: videosLength - index + 1,
          opacity: `${opacitValues[videosLength][index]}`,
        }}>
        <CustomImage fill className="h-5/6 rounded" src={item.thumbnail_url_l || item.thumbnail} alt="" />
        <div className="bg-monochrome-black/30 absolute inset-0 hidden h-full w-full items-center justify-center group-hover/video:flex">
          <Image src={icPlay} alt="play" className="absolute" height={16} width={16} />
        </div>
      </Link>
    )
  })
}
