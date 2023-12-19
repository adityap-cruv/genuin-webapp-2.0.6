'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Loader } from '@components/ui/loader'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Button } from '@components/ui/button'
import icShare from '@icons/icShareBlue.svg'
import { DecorativeList } from '@components/custom/decorative-list'
import Image from 'next/image'
import icAudioRecord from '@icons/audioRecord.svg'
import icVideoRecord from '@icons/videoRecord.svg'
import { DownloadDialog } from '@components/common/download-dialog'
import { Comments } from '@components/common/player/comments'
import dynamic from 'next/dynamic'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

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
                  <p className="line-clamp-1 w-full break-all text-body-lg">COMMUNITY_NAME</p>
                </div>
              </span>
              <span className="flex h-min items-center gap-x-3">
                <Button size="custom">
                  <p className="whitespace-nowrap px-4 py-2 text-body-sm font-medium">Join Community</p>
                </Button>
                <Button size="custom" variant="outline" className="min-w-max border-2 border-primary p-1 ">
                  <Image src={icShare} alt="share" className="h-5 w-5" />
                </Button>
              </span>
            </span>
            <DecorativeList>
              <li className="relative w-full rounded-md border border-monochrome-9 bg-monochrome-10">
                <p className="line-clamp-1 break-all px-6 py-3 text-body-sm font-medium">{videoDetails.loop?.name}</p>
              </li>
            </DecorativeList>
          </div>
          <span className="sticky top-0">
            <hr className="mt-6 border border-monochrome-black/10" />
            <p className="px-4 py-3 text-body-lg text-secondary">Comments (COMMENTS_NUMBER)</p>
            <hr className="border border-monochrome-black/10" />
          </span>
          <div className="h-full overflow-clip pb-16">
            <Comments videoId={videoDetails.video.share_string} />
          </div>
          <div className="absolute bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 py-3 shadow-md">
            <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
              <button className="flex w-full flex-1 items-center gap-x-4 pl-6">
                <div
                  placeholder="Add a comment"
                  className="h-full w-2/3 rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
                  <p className="text-start text-body-lg text-monochrome">Add a Comment</p>
                </div>
                <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
                <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
              </button>
            </DownloadDialog>
          </div>
        </div>
      </div>
    )
  return <Loader size="lg" />
}
