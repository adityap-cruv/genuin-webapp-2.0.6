'use client'
import Player from '@components/common/player'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Loader } from '@components/ui/loader'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import CustomDecorativeList from '@components/custom/custom-decorative-list'
import { Button } from '@components/ui/button'
import icShare from '@icons/icShareBlue.svg'
import Image from 'next/image'
import imgBar from '@images/empty-bottom-bar.svg'

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
        <div className="relative flex h-full flex-1 flex-col p-6 pb-0">
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
          <div className="pb-6 pt-2">
            <p className="line-clamp-2 w-5/6 overflow-hidden break-all text-body-lg font-medium">
              {videoDetails.video.description}
            </p>
          </div>
          <hr className=" border border-monochrome-black/10" />
          <p className="pt-6 text-title-md">Posted in</p>
          <div className="pt-3">
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-x-3">
                <CustomAvatar imageUrl="" fallbackString="no" isAvatar={false} className="h-11 w-11" />
                <div>
                  <p className="line-clamp-1 w-full text-body-lg">COMMUNITY_NAME</p>
                </div>
              </span>
              <span className="flex h-min items-center gap-x-3">
                <Button size="custom">
                  <p className="px-4 py-2 text-body-sm font-medium">Join Community</p>
                </Button>
                <Button size="custom" variant="outline" className="border-2 border-primary p-1">
                  <Image src={icShare} alt="share" />
                </Button>
              </span>
            </span>
            <CustomDecorativeList>
              <li className="relative w-full rounded-md border border-monochrome-9 bg-monochrome-10">
                <div>
                  <p className="line-clamp-1 w-full px-6 py-3 text-body-sm font-medium">{videoDetails.loop?.name}</p>
                </div>
              </li>
            </CustomDecorativeList>
          </div>
          <hr className="mt-6 border border-monochrome-black/10" />
          <p className="px-4 py-3 text-body-lg text-secondary">Comments (COMMENTS_NUMBER)</p>
          <hr className="border border-monochrome-black/10" />
          <div className="relative h-full w-full bg-blue-60"></div>
          <div className="absolute bottom-0 left-0 h-16 w-full bg-red">
            <p>COMMENT_INPUT</p>
          </div>
        </div>
      </div>
    )
  return <Loader size={'lg'} />
}
