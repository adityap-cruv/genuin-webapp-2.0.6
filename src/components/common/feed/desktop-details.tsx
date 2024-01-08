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
import { Comments, NoComments } from '@components/common/comments'
import { type VideoDataType } from '@lib/schemas/video'
import { getLoopVideoComments } from '@lib/api/loop'
import { type RefObject, useRef } from 'react'
import { Loader } from '@components/ui/loader'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { getTimeAgo } from '@lib/utils'

type DesktopDetailsProps = {
  videoDetails: VideoDataType
}
export function DesktopDetails({ videoDetails }: DesktopDetailsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const scrollDivRef = useRef<HTMLDivElement>(null)

  if (videoDetails)
    return (
      <div className="relative flex h-full flex-1 flex-col overflow-x-clip bg-monochrome-white pb-16 pl-2">
        <div className="border-b border-monochrome-black/10 p-4">
          <span className="flex items-center gap-x-2">
            <CustomAvatar
              isAvatar={videoDetails.owner.is_avatar}
              fallbackString={videoDetails.owner.username ?? ''}
              imageUrl={videoDetails.owner.profile_image ?? ''}
              className="h-9 w-9"
            />
            <span className="flex items-center gap-x-1">
              <Link href={PATH_NAME.profile(videoDetails.owner.nickname)}>
                <p className="text-body-lg">@{videoDetails.owner.nickname}</p>
              </Link>
              <p className="text-body-1-demi text-secondary">{getTimeAgo(videoDetails.video.created_at) + ' ago'}</p>
            </span>
          </span>
          {videoDetails.video.description && (
            <p className="line-clamp-2 w-5/6 overflow-hidden break-all pt-3 text-title-3-med">
              {videoDetails.video.description}
            </p>
          )}
        </div>
        <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip">
          <div className="p-4">
            <p className="text-title-3-bold">Posted in</p>
            <div className="pt-3">
              <span className="flex items-center justify-between">
                <span className="flex flex-1 items-center gap-x-3">
                  <CustomAvatar
                    imageUrl={videoDetails.community.dp ?? ''}
                    fallbackString={videoDetails.community.name ?? ''}
                    isAvatar={false}
                    className="h-11 w-11"
                  />
                  <Link href={{ pathname: PATH_NAME.community(videoDetails.community.slug) }}>
                    <p className="line-clamp-1 break-all pr-2 text-title-3-bold">{videoDetails.community.name}</p>
                  </Link>
                </span>
                <span className="flex h-min flex-1 items-center gap-x-3">
                  <DownloadDialog
                    title="Get the Genuin app"
                    subtitle={
                      <>
                        Get the app to join the <br />
                        <span className="font-bold">@{videoDetails.community.handle}</span> community.
                      </>
                    }
                    asChild>
                    <Button size="custom">
                      <p className="whitespace-nowrap px-4 py-1 text-title-3-demi">Join Community</p>
                    </Button>
                  </DownloadDialog>
                  <Button
                    size="custom"
                    variant="outline"
                    className="min-w-max border-2 border-primary p-1 "
                    onClick={async () =>
                      await shareFn({
                        shareLink:
                          window.location.host +
                          PATH_NAME.community(videoDetails.community.slug) +
                          '&utm_source=app_web',
                        toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                      })
                    }>
                    <Image src={icShare} alt="share" className="h-5 w-5" />
                  </Button>
                </span>
              </span>
              <DecorativeList>
                <div className="h-2 w-full" />
                <a href={PATH_NAME.loop(videoDetails.loop.slug)}>
                  <li className="relative flex h-full w-full items-center justify-between rounded-md border border-monochrome-9 bg-monochrome-10 p-4 ">
                    <p className="line-clamp-1 w-full break-all pr-2 text-body-1-demi">{videoDetails.loop?.name}</p>
                    <p className="whitespace-nowrap text-cap-1-med text-primary">View Loop</p>
                  </li>
                </a>
              </DecorativeList>
            </div>
          </div>
          <div className="sticky top-0 z-10">
            <p className="border-b border-t border-monochrome-black/10 bg-monochrome-white px-4 py-3 text-title-3-demi text-secondary">
              Comments {videoDetails.video.no_of_comments !== 0 ? `(${videoDetails.video.no_of_comments})` : ''}
            </p>
          </div>
          <div className="h-full px-4 pt-2">
            <CommentBox shareString={videoDetails.video.share_string} parentRef={scrollDivRef} />
          </div>
        </div>
        <CommentInput />
        <Toaster />
      </div>
    )
}

function CommentBox({ shareString, parentRef }: { shareString: string; parentRef: RefObject<HTMLDivElement> }) {
  const {
    data: commentPages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = getLoopVideoComments(shareString)
  const comments = commentPages?.pages.flatMap((item) => item.comments)
  const { scrollYProgress } = useScroll({ container: parentRef })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    value = Number(value.toFixed(1))
    if (value >= 0.8) void fetchNextPage()
  })

  if (isLoading) {
    return <Loader size="md" />
  }

  if (comments && comments?.length !== 0)
    return (
      <div className="h-full overflow-visible pb-40">
        <Comments.withoutApi
          comments={comments}
          fetchNextPage={() => {}}
          hasNextPage={hasNextPage}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
        />
      </div>
    )
  return (
    <div className="h-full w-full">
      <NoComments />
    </div>
  )
}

function CommentInput() {
  return (
    <div className="absolute bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 py-3 shadow-md">
      <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
        <button className="flex w-full flex-1 items-center gap-x-4 pl-6">
          <div
            placeholder="Add a comment"
            className="h-full w-2/3 rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
            <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
          </div>
          <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
          <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
        </button>
      </DownloadDialog>
    </div>
  )
}
