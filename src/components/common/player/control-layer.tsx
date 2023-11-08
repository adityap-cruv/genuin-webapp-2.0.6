import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { checkAndAppendHttps, generateDeepLink, getAvatarFallback, openGeneratedLink } from '@lib/utils'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import icLink from '@icons/icLink.svg'
import icShare from '@icons/icShare.svg'
import icSubscribe from '@icons/icSubscribe.svg'
import icComment from '@icons/icComment.svg'
import Image from 'next/image'
import { DownloadDialog } from '../download-dialog'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import icReply from '@icons/icReply.svg'
import icSave from '@icons/icSave.svg'
import icMute from '@icons/player-controls/icMute.svg'
import icUnmute from '@icons/player-controls/icUnmute.svg'
import icLoop from '@icons/icLoop.svg'
import icRightArrow from '@icons/icRightArrow.svg'
import { VideoDataType } from '@lib/schemas/video'
import { usePlayerControlStore } from '@lib/stores/common/player-control-store'
import { isMobile } from 'react-device-detect'
import { useToast } from '@components/ui/use-toast'

export const ControlLayer = {
  default: DefaultLayer,
  community: CommunityLayer,
}

interface Props {
  videoData?: VideoDataType
}

function DefaultLayer({ videoData }: Props) {
  const { toggleMuted, muted } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
  }))

  if (videoData) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={!muted ? icUnmute : icMute}
          alt="volume-control"
          className="absolute left-3 top-3 z-20 cursor-pointer"
          onClick={(e) => {
            toggleMuted()
            e.stopPropagation()
          }}
        />
        <div className="absolute bottom-0 left-0 w-full p-2">
          {videoData.video_type === 'rt' || videoData.loop ? (
            <Loop videoData={videoData} />
          ) : (
            <Public videoData={videoData} />
          )}
        </div>
      </div>
    )
  }
}

interface CommunityLayerProps {
  videoData: VideoDataType
}

function CommunityLayer({ videoData }: CommunityLayerProps) {
  const { toggleMuted, muted } = usePlayerControlStore((state) => ({
    toggleMuted: state.toggleMuted,
    muted: state.muted,
  }))

  if (videoData) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={!muted ? icUnmute : icMute}
          alt="volume-control"
          className="absolute left-3 top-16 z-20 cursor-pointer sm:top-3"
          onClick={(e) => {
            toggleMuted()
            e.stopPropagation()
          }}
        />
        <div className="absolute bottom-0 left-0 w-full">
          <Public videoData={videoData} />
          <CommunityReelSection videoData={videoData} />
        </div>
      </div>
    )
  }
}

function CommunityReelSection({ videoData }: CommunityLayerProps) {
  return (
    <div className="mt-2 flex h-14 w-full items-center justify-between bg-monochrome-black/40 px-2">
      <div className="flex items-center gap-x-2">
        <Avatar className="bg-red-40">
          <AvatarImage src={videoData.loop?.profile_image || ''} />
          <AvatarFallback>{getAvatarFallback(videoData.loop?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="line-clamp-1 max-w-[150px] text-title-sm text-monochrome-white">{videoData.loop?.name}</p>
          <div className="flex items-center gap-x-2">
            <Image src={icLoop} alt="loop" />
            <p className="text-cap-lg text-monochrome-white/60">View Loop</p>
          </div>
        </div>
      </div>
      <div className="flex gap-x-2">
        <Button size="sm">
          <p className="text-title-sm text-monochrome-white">Subscribe</p>
        </Button>
        <Image src={icRightArrow} alt="right" />
      </div>
    </div>
  )
}

interface LoopProps {
  videoData?: VideoDataType
}

function Loop({ videoData }: LoopProps) {
  return (
    <div className="flex justify-between">
      <div className="flex w-4/5 flex-col justify-end">
        <Link
          className="hover:opacity-60"
          href={{
            pathname: PATH_NAME.profile(videoData?.owner.nickname),
          }}>
          <Badge variant="default" className="mb-2 cursor-pointer">
            <p className="text-title-sm text-monochrome-white">
              @{videoData?.owner.nickname}
              <span>&nbsp;added</span>
            </p>
          </Badge>
        </Link>
        <div className="flex items-center">
          <Link
            className="flex cursor-pointer items-center hover:opacity-60"
            href={{ pathname: PATH_NAME.loop(videoData?.loop?.share_string) }}>
            <Avatar className="bg-red-40">
              <AvatarImage src={videoData?.loop?.profile_image ?? undefined} />
              <AvatarFallback>
                <p className="text-title-lg">{getAvatarFallback(videoData?.loop?.name)}</p>
              </AvatarFallback>
            </Avatar>
            <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">{videoData?.loop?.name}</p>
          </Link>
          <Link
            href={{
              pathname: PATH_NAME.loop(videoData?.loop?.share_string),
              query: { v: videoData?.video.share_string },
            }}>
            <Button variant="outline" outlineColor="white" size="sm" className="[&>p]:hover:text-monochrome-black">
              <p className="text-title-sm text-monochrome-white">Watch</p>
            </Button>
          </Link>
        </div>
        <p className="line-clamp-3 h-min w-full py-2 text-body-sm text-monochrome-white">
          {videoData?.video.description}
        </p>
      </div>
      {/* todo configure share title and description correctly */}
      <Actions
        link={videoData?.video.link ?? ''}
        shareTitle={videoData?.video.description ?? ''}
        shareDescription={videoData?.video.description ?? ''}
        isLoop={true}
      />
    </div>
  )
}

interface PublicProps {
  videoData: VideoDataType
}

function Public({ videoData }: PublicProps) {
  return (
    <div className="flex justify-between p-2">
      <div className="flex w-4/5 flex-col justify-end">
        <div className="flex items-center">
          <Link
            className="flex cursor-pointer items-center hover:opacity-60"
            href={{ pathname: PATH_NAME.profile(videoData?.owner.nickname) }}>
            <Avatar className="bg-red-40">
              <AvatarImage src={videoData?.owner.profile_image ?? undefined} />
              <AvatarFallback>
                <p className="text-title-lg">{getAvatarFallback(videoData?.owner?.username)}</p>
              </AvatarFallback>
            </Avatar>
            <p className="line-clamp-1 px-2 text-title-md text-monochrome-white">@{videoData?.owner.nickname}</p>
          </Link>
        </div>
        {videoData.video.description && (
          <p className="line-clamp-3 h-min w-full py-2 text-body-sm text-monochrome-white">
            {videoData?.video.description}
          </p>
        )}
      </div>
      {/* todo configure share title and description correctly */}
      <Actions
        link={videoData?.video.link ?? ''}
        shareTitle={videoData?.video.description ?? ''}
        shareDescription={videoData?.video.description ?? ''}
        isLoop={false}
      />
    </div>
  )
}

interface ActionsProps {
  link: string
  shareTitle: string
  shareDescription: string
  isLoop?: boolean
}

function Actions({ link = '', shareDescription = '', shareTitle = '', isLoop = false }: ActionsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

  return (
    <>
      {isMobile ? (
        <>
          <div className="flex flex-col">
            {link && (
              <Link href={checkAndAppendHttps(link)} target="_blank">
                <ActionItem title="Click Here!">
                  <Image src={icLink} alt="link" height={20} width={20} />
                </ActionItem>
              </Link>
            )}
            {!isLoop && (
              <ActionItem
                title="Save this Video!"
                onClick={() => {
                  generateDeepLink({
                    action: 'save',
                    contentType: 'pv',
                    title: null,
                    description: null,
                    fromUserName: null,
                    pathName: window.location.pathname,
                    previewImage: null,
                    sourceId: null,
                    utmCampaign: 'share',
                    utmMedium: 'web',
                    utmSource: window.location.hostname,
                    parentId: null,
                  })
                    .then((link) => openGeneratedLink(link))
                    .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                }}>
                <Image src={icSave} width={20} height={20} alt="Save video" />
              </ActionItem>
            )}
            {isLoop && (
              <>
                <ActionItem
                  title="See Comments!"
                  onClick={() => {
                    generateDeepLink({
                      action: 'comment',
                      contentType: 'loop',
                      title: null,
                      description: null,
                      fromUserName: null,
                      pathName: window.location.pathname,
                      previewImage: null,
                      sourceId: null,
                      utmCampaign: 'share',
                      utmMedium: 'web',
                      utmSource: window.location.hostname,
                      parentId: null,
                    })
                      .then((link) => openGeneratedLink(link))
                      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                  }}>
                  <Image src={icComment} alt="comments" height={20} width={20} />
                </ActionItem>

                <ActionItem
                  title="Subscribe to Loop!"
                  onClick={() => {
                    generateDeepLink({
                      action: 'subscribe',
                      contentType: 'loop',
                      title: null,
                      parentId: null,
                      description: null,
                      fromUserName: null,
                      pathName: window.location.pathname,
                      previewImage: null,
                      sourceId: null,
                      utmCampaign: 'share',
                      utmMedium: 'web',
                      utmSource: window.location.hostname,
                    })
                      .then((link) => openGeneratedLink(link))
                      .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                  }}>
                  <Image src={icSubscribe} alt="subscribe" height={18} width={18} />
                </ActionItem>
              </>
            )}
            <ActionItem
              title="Share Video!"
              onClick={() => shareFn({ description: shareDescription, title: shareTitle })}>
              <Image src={icShare} alt="share" height={20} width={20} />
            </ActionItem>
            {!isLoop && (
              <ActionItem
                title="Reply to Video!"
                onClick={() => {
                  generateDeepLink({
                    action: 'reply',
                    contentType: 'pv',
                    title: null,
                    description: null,
                    fromUserName: null,
                    pathName: window.location.pathname,
                    previewImage: null,
                    sourceId: null,
                    utmCampaign: 'share',
                    utmMedium: 'web',
                    utmSource: window.location.hostname,
                    parentId: null,
                  })
                    .then((link) => openGeneratedLink(link))
                    .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                }}>
                <Image src={icReply} height={20} width={20} alt="reply" />
              </ActionItem>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col">
            {link && (
              <Link href={checkAndAppendHttps(link)} target="_blank">
                <ActionItem title="Click Here!">
                  <Image src={icLink} alt="link" height={20} width={20} />
                </ActionItem>
              </Link>
            )}
            {!isLoop && (
              <DownloadDialog title="Get the Genuin app" subtitle="Get the app to save the video." asChild={false}>
                <ActionItem title="Save this Video!">
                  <Image src={icSave} width={20} height={20} alt="Save video" />
                </ActionItem>
              </DownloadDialog>
            )}
            {isLoop && (
              <>
                <DownloadDialog
                  title="Get the Genuin app"
                  subtitle="Get the app to watch the comments on this video."
                  asChild={false}>
                  <ActionItem title="See Comments!">
                    <Image src={icComment} alt="comments" height={20} width={20} />
                  </ActionItem>
                </DownloadDialog>
                <DownloadDialog title="Get the Genuin app" subtitle="Get the app to subscribe to Loop." asChild={false}>
                  <ActionItem title="Subscribe to Loop!">
                    <Image src={icSubscribe} alt="subscribe" height={18} width={18} />
                  </ActionItem>
                </DownloadDialog>
              </>
            )}
            <ActionItem
              title="Share Video!"
              onClick={() =>
                shareFn({
                  description: shareDescription,
                  title: shareTitle,
                  toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                })
              }>
              <Image src={icShare} alt="share" height={20} width={20} />
            </ActionItem>
            {!isLoop && (
              <DownloadDialog title="Get the Genuin app" subtitle="Get the app to reply to video." asChild={false}>
                <ActionItem title="Reply to Video!">
                  <Image src={icReply} height={20} width={20} alt="reply" />
                </ActionItem>
              </DownloadDialog>
            )}
          </div>
        </>
      )}
    </>
  )
}

interface ActionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function ActionItem({ children, onClick, title }: ActionItemProps) {
  return (
    <div
      onClick={onClick}
      title={title}
      className="mt-3 cursor-pointer rounded-full bg-monochrome-white/10 p-3 hover:bg-monochrome-white/40">
      {children}
    </div>
  )
}
