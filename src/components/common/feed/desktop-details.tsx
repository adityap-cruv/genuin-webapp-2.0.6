import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Button } from '@components/ui/button'
import icShare from '@icons/icShareBlue.svg'
import { DecorativeList } from '@components/custom/decorative-list'
import Image from 'next/image'
import icAudioRecord from '@icons/audioRecord.svg'
import icVideoRecord from '@icons/videoRecord.svg'
import { Comments, NoComments } from '@components/common/comments'
import { type VideoDataType } from '@lib/schemas/video'
import { getLoopVideoComments } from '@lib/api/loop'
import { type RefObject, useRef, useState, useEffect } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { getTimeAgo, openModal } from '@lib/utils'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { Input } from '@components/ui/input'
import { createComment, joinCommunity } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { DownloadDialog } from '../download-dialog'
import { ShareIcon } from '@icons/share-icon'
import { Textarea } from '@components/ui/textarea'

type DesktopDetailsProps = {
  videoDetails: VideoDataType
}
export function DesktopDetails({ videoDetails }: DesktopDetailsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [isCommunityJoined, setIsCommunityJoined] = useState(false)
  const [currentComment, setCurrentComment] = useState('')
  const [comments, setComments] = useState([])
  const user = useGenuinOptions().user

  if (videoDetails)
    return (
      <div className="relative flex h-full flex-1 flex-col overflow-x-clip bg-monochrome-white pb-16 pl-2">
        <div className="border-b border-tertiary-200 p-4">
          <span className="flex items-center gap-x-2">
            <CustomAvatar
              isAvatar={videoDetails.owner.is_avatar}
              fallbackString={videoDetails.owner.username ?? ''}
              imageUrl={videoDetails.owner.profile_image ?? ''}
              className="h-9 w-9"
            />
            <span className="flex items-center gap-x-1">
              <Link href={PATH_NAME.profile(videoDetails.owner.nickname)}>
                <p className="text-title-3-demi">@{videoDetails.owner.nickname}</p>
              </Link>
              <p className="text-body-1-demi text-tertiary">{getTimeAgo(videoDetails?.video?.created_at) + ' ago'}</p>
            </span>
          </span>
          {videoDetails?.video?.description && (
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
                <span className="flex h-min flex-1 items-center justify-end gap-x-3">
                  <Button
                    size="custom"
                    className={`${isCommunityJoined && 'rounded border border-primary '}`}
                    variant={isCommunityJoined ? 'outline' : 'default'}
                    onClick={
                      user
                        ? async () => {
                            !isCommunityJoined
                              ? await joinCommunity(
                                  false,
                                  [videoDetails.community.id],
                                  [
                                    {
                                      user_id: user?.id,
                                    },
                                  ]
                                ).then((res) => {
                                  if (res.code === 200) {
                                    setIsCommunityJoined((prev) => !prev)
                                  }
                                })
                              : setIsCommunityJoined((prev) => !prev)
                          }
                        : () => {
                            openModal({
                              title: 'Get the Genuin app',
                              subtitle: (
                                <>
                                  Get the app to join the <br />
                                  <span className="font-bold">@{videoDetails.community.handle}</span> community.
                                </>
                              ),
                            })
                          }
                    }>
                    <p
                      className={`whitespace-nowrap px-4 py-1.5 text-body-1-demi  ${
                        isCommunityJoined ? 'text-primary' : 'text-monochrome-white'
                      }`}>
                      {isCommunityJoined ? 'Joined' : 'Join Community'}
                    </p>
                  </Button>
                  <Button
                    size="custom"
                    variant="outline"
                    className="min-w-max border border-primary p-1 hover:border-primary-600 "
                    onClick={async () =>
                      await shareFn({
                        shareLink:
                          window.location.host +
                          PATH_NAME.community(videoDetails.community.slug) +
                          '?utm_source=app_web',
                        toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                      })
                    }>
                    <ShareIcon className="h-5 w-5 fill-primary hover:fill-primary-600" />
                  </Button>
                </span>
              </span>
              <DecorativeList>
                <div className="h-2 w-full" />
                <Link href={PATH_NAME.loop(videoDetails.loop.slug)}>
                  <li className="relative flex h-full w-full items-center justify-between rounded-md border border-tertiary-200 bg-monochrome-white p-4 ">
                    <p className="line-clamp-1 w-full break-all pr-2 text-body-1-demi">{videoDetails.loop?.name}</p>
                    <p className="whitespace-nowrap text-cap-1-med text-primary hover:text-primary-600">View Loop</p>
                  </li>
                </Link>
              </DecorativeList>
            </div>
          </div>
          <div className="sticky top-0 z-10">
            <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi text-tertiary">
              Comments {videoDetails?.video?.no_of_comments !== 0 ? `(${videoDetails?.video?.no_of_comments})` : ''}
            </p>
          </div>
          <div className="h-full px-4 pt-2">
            <CommentBox
              shareString={videoDetails?.video?.share_string ?? ''}
              parentRef={scrollDivRef}
              setComments={setComments}
              comments={comments}
            />
          </div>
        </div>
        <CommentInput
          setComments={setComments}
          currentComment={currentComment}
          setCurrentComment={setCurrentComment}
          videoDetails={videoDetails}
        />
        <Toaster />
      </div>
    )
}

function CommentBox({
  shareString,
  parentRef,
  setComments,
  comments,
}: {
  shareString: string
  parentRef: RefObject<HTMLDivElement>
  setComments: any
  comments: any
}) {
  const {
    data: commentPages,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = getLoopVideoComments(shareString)

  useEffect(() => {
    setComments(commentPages?.pages.flatMap((item) => item.comments))
  }, [commentPages])

  const { scrollYProgress } = useScroll({ container: parentRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    value = Number(value.toFixed(1))
    if (value >= 0.8) void fetchNextPage()
  })

  if (isLoading) {
    return <FeedShimmer.comments iterations={2} />
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

function CommentInput({ setComments, currentComment, setCurrentComment, videoDetails }: any) {
  const user = useGenuinOptions().user
  async function handleClick() {
    if (currentComment.length !== 0) {
      const newComment = {
        owner: {
          nickname: user?.nickname,
          is_avatar: user?.isAvatar,
          profile_image: user?.image,
        },
        comment: {
          created_at: new Date().toISOString(),
          type: 'text',
          text: currentComment,
          no_of_sparks: 0,
          url: null,
          thumbnail: null,
          share_string: null,
        },
      }
      await createComment(videoDetails.video.id, videoDetails.loop.id, 3, currentComment)
      setComments((prevComments: any) => [newComment, ...prevComments])
      setCurrentComment('')
    }
  }
  return (
    <div className="absolute bottom-0 left-0 max-h-16 w-full border-t-2 border-t-tertiary-200 bg-tertiary-200 py-3 shadow-md">
      <button className="flex w-full flex-1 items-center gap-x-4 px-6">
        {user ? (
          <>
            <div className="relative flex w-full items-center">
              <Input
                placeholder="Add a comment"
                value={currentComment}
                maxLength={500}
                disabled={!user}
                className="rounded-full border border-tertiary-200 bg-monochrome-white px-14 pl-4"
                onChange={(event) => {
                  const newComment = event.target.value
                  setCurrentComment(newComment)
                }}
              />

              {/* <Textarea
                placeholder="Add a comment"
                value={currentComment}
                maxLength={500}
                disabled={!user}
                className="h-10 rounded-full border border-tertiary-200 bg-monochrome-white px-14 pl-4 pt-2"
                onChange={(event) => {
                  setCurrentComment(event.target.value)
                }}
              /> */}

              <button
                onClick={handleClick}
                disabled={currentComment.length === 0}
                className={`absolute right-4 text-body-1-bold ${
                  currentComment.length === 0 ? 'text-primary-600' : 'text-primary'
                }`}>
                Post
              </button>
            </div>
          </>
        ) : (
          <div
            onClick={() => {
              openModal({
                title: 'Get the Genuin app',
                subtitle: <>Get the app to comment on this video.</>,
              })
            }}
            placeholder="Add a comment"
            className="h-full w-2/3 rounded-full border-2 border-tertiary-200 bg-monochrome-white py-2 pl-6">
            <p className="text-start text-title-3-demi text-tertiary">Add a Comment</p>
          </div>
        )}

        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
          <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
        </DownloadDialog>
        <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
          <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
        </DownloadDialog>
      </button>
    </div>
  )
}
