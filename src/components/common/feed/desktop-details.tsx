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
import { useFeedListStore } from './store'
import { type VideoDataType } from '@lib/schemas/video'
import { getLoopVideoComments } from '@lib/api/loop'
import { type RefObject, useRef } from 'react'
import { Loader } from '@components/ui/loader'
import { useMotionValueEvent, useScroll } from 'framer-motion'

export function DesktopDetails() {
  const { videoList, currentIndex } = useFeedListStore((state) => ({
    videoList: state.videoList,
    currentIndex: state.currentIndex,
  }))
  const videoDetails = videoList[currentIndex]
  const scrollDivRef = useRef<HTMLDivElement>(null)

  if (videoDetails)
    return (
      <div className="relative flex-1 overflow-x-clip pb-16">
        <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip">
          <div className="w-full p-6 pb-4">
            <InfoArea videoDetails={videoDetails} />
          </div>
          <div className="sticky top-0 z-10">
            <p className="border-b border-t border-monochrome-black/10 bg-monochrome-white px-4 py-3 text-body-lg text-secondary">
              Comments {videoDetails.video.no_of_comments !== 0 ? `(${videoDetails.video.no_of_comments})` : ''}
            </p>
          </div>
          <div className="h-full pl-6">
            <CommentBox shareString={videoDetails.video.share_string} parentRef={scrollDivRef} />
          </div>
        </div>
        <CommentInput />
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
      <div className="h-full overflow-visible">
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

function InfoArea({ videoDetails }: { videoDetails: VideoDataType }) {
  return (
    <>
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
          <div className="h-2 w-full" />
          <Link href={{ pathname: PATH_NAME.loop(videoDetails.loop?.share_string) }}>
            <li className="relative flex w-full items-center justify-between rounded-md border border-monochrome-9 bg-monochrome-10 ">
              <p className="line-clamp-1 break-all px-6 py-3 text-body-sm font-medium">{videoDetails.loop?.name}</p>
              <p className="pr-4 text-cap-lg text-primary" style={{ fontWeight: 500 }}>
                View Loop
              </p>
            </li>
          </Link>
        </DecorativeList>
      </div>
    </>
  )
}

function CommentInput() {
  return (
    <div className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 py-3 shadow-md">
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
  )
}
