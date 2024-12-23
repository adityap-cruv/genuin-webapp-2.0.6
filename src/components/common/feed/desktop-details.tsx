import { CustomAvatar } from '@components/custom/custom-avatar'
import { type RefObject, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Button } from '@components/ui/button'
import { DecorativeList } from '@components/custom/decorative-list'
import { Comments, NoComments } from '@components/common/comments'
import { getVideosComments } from '@lib/api/loop'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { getCurrentShareUrl, getTimeAgo } from '@lib/utils'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { ShareIcon } from '@icons/share-icon'
import { type CommentListType } from '@lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { LockIcon } from '@icons/LockIcon'
import { TickIcon } from '@icons/tick-icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { ReadMore } from '../read-more'
import { Linkout } from '../linkout'
import MentionInput from '../comments/mention-input'
import { useFeedListContext } from '../../providers/feed-provider'
import { JoinCommunityButton } from '../join-community-button'

type DesktopDetailsProps = VideoPlayerModalType
// TODO: improve this component.
// TODO: Remove scrollDivRef dependency from CommentBox.
export function DesktopDetails({ loop, community, owner, video }: DesktopDetailsProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { updateCommunityJoinStatus } = useFeedListContext()
  // TODO: Here state Comment and setComments are bad they are causing multiple rerenders.
  const [comments, setComments] = useState<CommentListType>([])

  return (
    <div className="relative h-full w-1 flex-1 bg-monochrome-white pb-16 pl-2">
      <div className="p-4">
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
                <Link href={PATH_NAME.brand(owner.brand.brand_slug)} title={'@' + owner.userName}>
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
      </div>
      <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip">
        {(video.descriptionArr ?? video.descriptionText) && (
          <ReadMore.dynamic
            text={Array.isArray(video.descriptionArr) ? video.descriptionArr : video.descriptionText}
            maxLines={2}
            className="border-b border-tertiary-200 p-4 pt-0"
          />
        )}
        <div className="border-b border-tertiary-200 p-4">
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
                  <div className="pr-2">
                    <Link
                      href={{ pathname: PATH_NAME.community(community.slug) }}
                      title={community.name ?? 'Genuin community'}>
                      <p className="line-clamp-1 break-all text-title-3-bold">{community.name}</p>
                    </Link>
                    {community.brand && (
                      <p
                        className="line-clamp-1 max-w-[30ch] break-all text-body-1-med text-tertiary"
                        title={community.brand.name}>
                        on {community.brand?.name}
                      </p>
                    )}
                  </div>
                </span>
                {community?.type === 2 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LockIcon className="h-4 w-4 stroke-tertiary" />
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
              <div className="flex h-min flex-1 items-center justify-end gap-x-3">
                <JoinCommunityButton
                  handle={community.handle}
                  buttonText="Join Community"
                  id={community.id}
                  type={community.type === 2 ? 'private' : 'public'}
                  role={community.userRole}
                  onStatusChange={(role) => {
                    updateCommunityJoinStatus(community.id, role)
                  }}
                />
                <Button
                  title="Copy Link"
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
              </div>
            </span>
            <DecorativeList>
              <div className="h-2 w-full" />
              <Link href={PATH_NAME.loop(loop.slug)} title={loop.name ?? 'Genuin Loop'}>
                <li className="relative flex h-full w-full items-center justify-between rounded-md border border-tertiary-200 bg-monochrome-white p-4 ">
                  <p className="line-clamp-1 w-full break-all pr-2 text-body-1-demi">{loop?.name}</p>
                  <p className="whitespace-nowrap text-cap-1-med text-primary hover:text-primary-600">View Group</p>
                </li>
              </Link>
            </DecorativeList>
          </div>
        </div>
        {video.linkoutId && (
          <div className="w-auto px-4">
            <Linkout.desktop linkouts={video.linkouts} linkoutId={video.linkoutId} videoId={video.id} />
          </div>
        )}
        <div className="sticky top-0 z-10">
          <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi">
            Comments {video.commentCount !== 0 ? `(${video.commentCount})` : ''}
          </p>
        </div>
        <div className="h-full px-4 pt-2">
          <CommentBox videoId={video.id} parentRef={scrollDivRef} setComments={setComments} comments={comments} />
        </div>
      </div>
      <MentionInput
        setComments={setComments}
        videoId={video.id}
        loopId={loop.id}
        videoSlug={video.slug}
        communityId={community.id}
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
    <div className="h-full pb-20">
      <NoComments />
    </div>
  )
}
