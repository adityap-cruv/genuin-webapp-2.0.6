import { type VideoType } from '.'
import Link from 'next/link'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { PATH_NAME } from '@lib/utils/constants/path'
import Image from 'next/image'
import icPlay from '@icons/player-controls/icPlay.svg'

export function Posts({ videos }: { videos: VideoType[] }) {
  return (
    <div className="mb-2 grid grid-cols-2 gap-4 px-2">
      {videos?.map((item, index) => (
        <Link
          href={PATH_NAME.video(item.slug)}
          key={index}
          className="group/video relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer">
          <img src={item.thumbnail ?? ''} className="h-full w-full rounded-xl object-fill" />
          <div className="absolute bottom-2 left-2">
            <Link href={{ pathname: PATH_NAME.profile(item.owner.userName) }}>
              <div className="flex h-6 w-6 items-center">
                <CustomAvatar
                  className="h-full w-full bg-red-40"
                  imageUrl={item.owner.profileImage}
                  isAvatar={item.owner.isAvatar}
                  fallbackString={item.owner.userName}
                />
                <p className="ml-1 text-body-1-bold text-monochrome-white">@{item.owner.userName}</p>
              </div>
            </Link>
            {/* TODO: discuss with design team about description. */}
            {/* <p className="ml-1 line-clamp-2 text-body-1-demi text-monochrome-white">{item.video.description}</p> */}
          </div>
          <div className="absolute inset-0  hidden h-full w-full items-center justify-center rounded-lg bg-monochrome-black/40 group-hover/video:flex">
            <Image src={icPlay} alt="" />
          </div>
        </Link>
      ))}
    </div>
  )
}
