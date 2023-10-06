import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { VideoDataSchema } from './video-data-schema'
import { z } from 'zod'
import { getAvatarFallback } from '@lib/utils'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import icLink from '@icons/icLink.svg'
import icShare from '@icons/icShare.svg'
import icSubscribe from '@icons/icSubscribe.svg'
import icComment from '@icons/icComment.svg'
import Image from 'next/image'
import { DownloadDialog } from '../download-dialog'

interface Props {
  videoData: z.infer<typeof VideoDataSchema> | null
}

export function ControlLayer({ videoData = null }: Props) {
  if (videoData) {
    return (
      <div className="absolute bottom-0 left-0 w-full p-2">
        {videoData.video_type === 'rt' && videoData.loop ? (
          <Loop videoData={videoData} />
        ) : (
          <Public videoData={videoData} />
        )}
      </div>
    )
  }
}

function Loop({ videoData }: Props) {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-end">
        <Badge variant="default" className="mb-2">
          <p className="text-title-sm text-monochrome-white">
            @{videoData?.owner.nickname}
            <span>&nbsp;added</span>
          </p>
        </Badge>
        <div className="flex items-center">
          <Link className="flex items-center" href={`/l/${videoData?.loop?.share_string}`}>
            <Avatar className="bg-red-40">
              <AvatarImage src={videoData?.loop?.profile_image ?? undefined} />
              <AvatarFallback>
                <p className="text-title-lg">{getAvatarFallback(videoData?.loop?.name)}</p>
              </AvatarFallback>
            </Avatar>
            <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">{videoData?.loop?.name}</p>
          </Link>
          <Button variant="outline" outlineColor="white" size="sm">
            <p className="text-title-sm text-monochrome-white">Watch</p>
          </Button>
        </div>
        <p className="line-clamp-2 py-2 text-body-sm text-monochrome-white">{videoData?.video.description}</p>
      </div>
      <Actions
        link={videoData?.video.link ?? ''}
        shareUrl={`${process.env.NEXT_PUBLIC_HOST_URL}/v/${videoData?.video.share_string}?l=${videoData?.loop?.share_string}`}
      />
    </div>
  )
}

function Public({ videoData }: Props) {
  return (
    <div>
      <div>
        <div className="flex items-center">
          <Link className="flex items-center" href={`/p/${videoData?.owner.nickname}`}>
            <Avatar className="bg-red-40">
              <AvatarImage src={videoData?.owner.profile_image} />
              <AvatarFallback>
                <p className="text-title-lg">{getAvatarFallback(videoData?.owner.username)}</p>
              </AvatarFallback>
            </Avatar>
            <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">{videoData?.loop?.name}</p>
          </Link>
        </div>
        <p className="line-clamp-2 py-2 text-body-sm text-monochrome-white">{videoData?.video.description}</p>
      </div>
      <Actions
        link={videoData?.video.link ?? ''}
        shareUrl={`${process.env.NEXT_PUBLIC_HOST_URL}/v/${videoData?.video.share_string}`}
      />
    </div>
  )
}

function Actions({ link = 'www.google.com', shareUrl = '' }: { link: string; shareUrl: string }) {
  function appendHttps(link: string) {
    return link.startsWith('http') || link.startsWith('https') ? link : 'https://' + link
  }

  return (
    <div className="flex flex-col">
      {link && (
        <Link href={appendHttps(link)} target="_blank">
          <ActionItem>
            <Image src={icLink} alt="link" height={20} width={20} />
          </ActionItem>
        </Link>
      )}
      <DownloadDialog
        title="Get the Genuin app"
        subtitle="Get the app to watch the comments on this video."
        asChild={false}>
        <ActionItem>
          <Image src={icComment} alt="comments" height={20} width={20} />
        </ActionItem>
      </DownloadDialog>
      <DownloadDialog title="Get the Genuin app" subtitle="Get the app to subscribe to Loop." asChild={false}>
        <ActionItem>
          <Image src={icSubscribe} alt="subscribe" height={18} width={18} />
        </ActionItem>
      </DownloadDialog>
      <ActionItem>
        <Image src={icShare} alt="share" height={20} width={20} />
      </ActionItem>
    </div>
  )
}

function ActionItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 cursor-pointer rounded-full bg-monochrome-white/10 p-3 hover:bg-monochrome-white/40">
      {children}
    </div>
  )
}
