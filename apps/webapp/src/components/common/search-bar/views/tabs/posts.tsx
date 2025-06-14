import { type VideoType } from '.'
import Link from 'next/link'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { PATH_NAME } from '@lib/utils/constants/path'
import icPlay from '@icons/player-controls/icPlay.svg'
import { NoResults } from './no-results'
import { useSearchBarStore } from '../../store'
import { CustomImage } from '@/components/custom/custom-image'

export function Posts({ videos }: { videos?: VideoType[] }) {
  const { close } = useSearchBarStore()
  if (videos)
    return (
      <div className="mb-2 grid grid-cols-2 gap-4 px-2">
        {videos.map((item, index) => (
          <Link
            href={PATH_NAME.video(item.slug)}
            key={index}
            onClick={close}
            className="group/video aspect-reel relative flex w-full items-center justify-center duration-300 hover:cursor-pointer">
            <CustomImage
              alt={item.description ?? 'video thumbnail'}
              src={item.thumbnail ?? ''}
              fill
              className="rounded-xl object-fill"
            />
            <div className="absolute bottom-2 left-2">
              <Link href={{ pathname: PATH_NAME.profile(item.owner.userName) }}>
                <div className="flex h-6 w-6 items-center">
                  <CustomAvatar
                    className="bg-red-40 h-full w-full"
                    imageUrl={item.owner.profileImage}
                    isAvatar={item.owner.isAvatar}
                    fallbackString={item.owner.userName}
                  />
                  <p className="text-body-1-bold text-monochrome-white ml-1">@{item.owner.userName}</p>
                </div>
              </Link>
              {/* TODO: discuss with design team about description. */}
              {/* <p className="ml-1 line-clamp-2 text-body-1-demi text-monochrome-white">{item.video.description}</p> */}
            </div>
            <div className="bg-monochrome-black/40 absolute inset-0 hidden h-full w-full items-center justify-center rounded-lg group-hover/video:flex">
              <CustomImage src={icPlay} alt="" />
            </div>
          </Link>
        ))}
      </div>
    )

  return <NoResults />
}
