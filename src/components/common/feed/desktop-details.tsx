import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Button } from '@components/ui/button'
import { DecorativeList } from '@components/custom/decorative-list'
import { Comments, NoComments } from '@components/common/comments'
import { getVideosComments } from '@lib/api/loop'
import { type RefObject, useRef, useState, useEffect } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { getCurrentShareUrl, getTimeAgo, openModal } from '@lib/utils'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { Input } from '@components/ui/input'
import { createComment } from '@lib/api/video'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ShareIcon } from '@icons/share-icon'
import { AudioRecordIcon } from '@icons/audio-record-icon'
import { VideoRecordIcon } from '@icons/video-record-icon'
import { type CommentListType } from '@lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { LockIcon } from '@icons/LockIcon'
import { TickIcon } from '@icons/tick-icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { DownloadDialogModal } from '../modals/download-app'
import { JoinCommunityButton } from '@components/pages/community/join-community-button'

export function DesktopDetails({ loop, community, owner, video }: VideoPlayerModalType) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  // TODO: Here state Comment and setComments are bad they are causing multiple rerenders.
  const [currentComment, setCurrentComment] = useState('')
  const [comments, setComments] = useState<CommentListType>([])

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-x-clip bg-monochrome-white pb-16 pl-2">
      <div className="border-b border-tertiary-200 p-4">
        <span className="flex items-center gap-x-2">
          <CustomAvatar
            isAvatar={owner.isAvatar}
            fallbackString={owner.userName}
            imageUrl={owner.profileImage}
            className="h-9 w-9"
          />
          <span className="flex items-center gap-x-1">
            {owner.brand ? (
              <div className="flex items-center gap-1">
                <Link href={PATH_NAME.brand(owner.brand.brand_slug)}>
                  <p className="line-clamp-1 break-all text-title-3-demi">@{owner.userName}</p>
                </Link>
                <div className="flex items-center">
                  <TickIcon className="h-3 w-3 fill-primary" />
                  <p className="text-cap-2-demi text-primary">Brand</p>
                </div>
              </div>
            ) : (
              <Link href={PATH_NAME.profile(owner.userName)}>
                <p className="line-clamp-1 break-all text-title-3-demi">@{owner.userName}</p>
              </Link>
            )}
            <p className="shrink-0 text-body-1-demi text-tertiary">{getTimeAgo(video.createdAt) + ' ago'}</p>
          </span>
        </span>
        {video.description && (
          <p className="line-clamp-2 w-5/6 overflow-hidden break-all pt-3 text-title-3-med">{video.description}</p>
        )}
      </div>
      <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip">
        <div className="p-4">
          <p className="text-title-3-bold">Posted in</p>
          <div className="pt-3">
            <span className="flex items-center justify-between">
              <div className="flex items-center justify-center">
                <span className="flex flex-1 items-center gap-x-3">
                  <CustomAvatar
                    imageUrl={community.profileImage ?? ''}
                    fallbackString={community.name ?? ''}
                    isAvatar={false}
                    className="h-11 w-11"
                  />
                  {/* TODO: What if there is no community name. */}
                  <div>
                    <Link href={{ pathname: PATH_NAME.community(community.slug) }}>
                      <p className="line-clamp-1 break-all pr-2 text-title-3-bold">{community.name}</p>
                    </Link>
                    {community.brand && (
                      <p
                        className="truncate text-body-1-med text-tertiary"
                        style={{
                          maxWidth: '10ch',
                        }}>
                        on {community.brand?.name}
                      </p>
                    )}
                  </div>
                </span>
                {community?.type === 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <LockIcon className="h-4 w-4 stroke-tertiary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="w-64 bg-monochrome-black">
                        <p className="text-center text-cap-1-med text-monochrome-white">
                          This community is private. Only people approved by it's moderators can see and participate in
                          this community.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="flex h-min flex-1 items-center justify-end gap-x-3">
                {/* <JoinButton
                  handle={community.handle}
                  id={community.id}
                  userRole={community.userRole}
                  isCommunityPrivate={community.type === 2}
                /> */}
                <JoinCommunityButton
                  handle={community.handle}
                  buttonText="Join Community"
                  id={community.id}
                  isCommunityPrivate={community.type === 2}
                  isJoinRequested={false}
                />
                <Button
                  size="custom"
                  variant="outline"
                  className="min-w-max border border-primary p-1 hover:border-primary-600 "
                  onClick={async () =>
                    await shareFn({
                      shareLink: getCurrentShareUrl({ url: community.shareUrl }),
                      toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                    })
                  }>
                  <ShareIcon className="h-5 w-5 fill-primary hover:fill-primary-600" />
                </Button>
              </span>
            </span>
            <DecorativeList>
              <div className="h-2 w-full" />
              <Link href={PATH_NAME.loop(loop.slug)}>
                <li className="relative flex h-full w-full items-center justify-between rounded-md border border-tertiary-200 bg-monochrome-white p-4 ">
                  <p className="line-clamp-1 w-full break-all pr-2 text-body-1-demi">{loop?.name}</p>
                  <p className="whitespace-nowrap text-cap-1-med text-primary hover:text-primary-600">View Loop</p>
                </li>
              </Link>
            </DecorativeList>
          </div>
        </div>
        <div className="sticky top-0 z-10">
          <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi text-tertiary">
            Comments {video.commentCount !== 0 ? `(${video.commentCount})` : ''}
          </p>
        </div>
        <div className="h-full px-4 pt-2">
          <CommentBox videoId={video.id} parentRef={scrollDivRef} setComments={setComments} comments={comments} />
        </div>
      </div>
      <CommentInput
        setComments={setComments}
        currentComment={currentComment}
        setCurrentComment={setCurrentComment}
        videoId={video.id}
        loopId={loop.id}
      />
      <Toaster />
    </div>
  )
}

function CommentBox({
  videoId,
  parentRef,
  setComments,
  comments,
}: {
  videoId: string
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
  } = getVideosComments(videoId)

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

function CommentInput({
  setComments,
  currentComment,
  setCurrentComment,
  videoId,
  loopId,
}: {
  setComments: any
  currentComment: any
  setCurrentComment: any
  videoId: string
  loopId: string
}) {
  const user = useGenuinOptions().user
  async function handleClick() {
    if (currentComment.length !== 0) {
      const newComment = {
        owner: {
          member_id: user?.id,
          name: user?.name,
          nickname: user?.nickname,
          bio: user?.bio,
          is_avatar: user?.isAvatar,
          profile_image: user?.image,
        },
        chat_id: null,
        conversation_id: null,
        comment_id: null,
        type: 'text',
        url: null,
        video_url_m3u8: null,
        thumbnail: null,
        link: null,
        duration: null,
        meta_data: null,
        created_at: Date.now(),
        no_of_views: 0,
        is_read: false,
        comment_text: currentComment,
        comment_data: JSON.stringify([currentComment]),
        no_of_sparks: 0,
        is_sparked: false,
      }
      try {
        const commentResponse = await createComment(videoId, loopId, 3, currentComment)
        if (commentResponse.code === 200) {
          setComments((prevComments: any) => [newComment, ...prevComments])
          setCurrentComment('')
        }
      } catch (e) {
        throw new Error()
      }
    }
  }
  return (
    <div className="absolute bottom-0 left-0 max-h-16 w-full border-t-2 border-t-tertiary-200 bg-tertiary-200 py-3 shadow-md">
      <div className="flex w-full flex-1 items-center gap-x-4 px-6">
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

        <AudioRecordIcon
          className="fill-secondary"
          onClick={() => {
            DownloadDialogModal.open({ title: 'Get the Genuin app', subtitle: 'Get the app to comment on this video.' })
          }}
        />
        <VideoRecordIcon
          className="fill-secondary"
          onClick={() => {
            DownloadDialogModal.open({
              title: 'Get the Genuin app',
              subtitle: 'Get the app to comment on this video.',
            })
          }}
        />
      </div>
    </div>
  )
}
