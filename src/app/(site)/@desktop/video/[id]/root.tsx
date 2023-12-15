'use client'
import Player from '@components/common/player'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Loader } from '@components/ui/loader'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

type Props = {
  videoDetails: VideoDataType
}

export function Root({ videoDetails }: Props) {
  const sizeBox = useVideoSizeBox(true)
  if (sizeBox)
    return (
      <div className="flex h-full w-full pl-6">
        <div style={{ width: sizeBox.width }}>
          <Player shouldPlay sizeBox={sizeBox} videoData={videoDetails} loop />
        </div>
        <div className="flex-1 p-6">
          <span className="flex items-center gap-x-2">
            <CustomAvatar
              isAvatar={videoDetails.owner.is_avatar}
              fallbackString={videoDetails.owner.username ?? ''}
              imageUrl={videoDetails.owner.profile_image ?? ''}
              className="h-9 w-9"
            />
            <Link href={PATH_NAME.profile(videoDetails.owner.nickname)}>
              <p className="text-body-lg">@{videoDetails.owner.nickname}</p>
            </Link>
          </span>
          <p className="line-clamp-2 w-5/6 pt-2 text-body-lg font-medium">{videoDetails.video.description}</p>
        </div>
      </div>
    )
  return <Loader size={'lg'} />
}
