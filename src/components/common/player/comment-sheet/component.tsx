import { CommentSheet, CommentSheetContent } from '@components/custom/comment-sheet'
import { X } from 'lucide-react'
import { useCommentSheetStore } from './store'
import { Comments } from '@components/common/comments'
import { openGeneratedLink, openModal } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useState } from 'react'
import { Input } from '@components/ui/input'
import { createComment } from '@lib/api/video'
import { useSearchParams } from 'next/navigation'
import { type CommentListType } from '@lib/schemas/loop/comment'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { commentDeepLink } from '@/lib/get-deeplink'

type Props = {
  videoId: string
  commentCount: number
  videoDetails: VideoPlayerModalType
}

// TODO: remove comment sheet with general sheet because there is no difference between.
// TODO: check the logic of adding new comment and optimize this component.
// TODO: Here state Comment and setComments are bad they are causing multiple rerenders.
// Sheet is only used in mobile component for now.
export function Sheet({ commentCount, videoId, videoDetails }: Props) {
  const { isOpen, close, currentVideoId } = useCommentSheetStore((state) => ({
    isOpen: state.modalIsOpen,
    close: state.closeModal,
    currentVideoId: state.currentVideoId,
  }))
  const shouldOpen = isOpen && currentVideoId === videoId
  const [currentComment, setCurrentComment] = useState('')
  const [comments, setComments] = useState<CommentListType>([])

  return (
    <CommentSheet open={shouldOpen} modal={true}>
      <CommentSheetContent
        onInteractOutside={() => {
          close()
        }}>
        <div className="h-full w-full rounded-t-[18px] bg-background outline-none sm:rounded-t-none">
          <div className="flex h-12 w-full items-center justify-between border-b border-monochrome-9 px-3 ">
            <p className="text-title-3-demi">Comments{commentCount ? `(${commentCount})` : ''}</p>
            <X
              className="h-6 w-6 cursor-pointer stroke-secondary"
              onClick={() => {
                close()
              }}
            />
          </div>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <Comments.withApi videoId={videoId} comments={comments} setComments={setComments} />
          </div>
        </div>
        <CommentInput
          setComments={setComments}
          currentComment={currentComment}
          setCurrentComment={setCurrentComment}
          videoDetails={videoDetails}
        />
      </CommentSheetContent>
    </CommentSheet>
  )
}

function CommentInput({ setComments, currentComment, setCurrentComment, videoDetails }: any) {
  const user = useGenuinOptions().user
  const embed = useGenuinOptions().embed
  const searchParams = Object.fromEntries(useSearchParams())

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
        const commentResponse = await createComment(videoDetails.video.id, videoDetails.loop.id, 3, currentComment)
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
    <>
      {embed ? (
        <div className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 px-2 py-3 shadow-md">
          <div className="flex w-full flex-1 items-center gap-x-4">
            {user ? (
              <>
                <div className="relative flex w-full items-center">
                  <Input
                    placeholder="Add a comment"
                    value={currentComment}
                    disabled={!user}
                    maxLength={500}
                    className="rounded-full border border-monochrome-9 bg-monochrome-white px-14 pl-4"
                    onChange={(event) => {
                      const newComment = event.target.value
                      setCurrentComment(newComment)
                    }}
                  />

                  {/* <Textarea
                    placeholder="Add a comment"
                    value={currentComment}
                    disabled={!user}
                    className="border-tertiary-200 h-10 rounded-full border bg-monochrome-white px-14 pl-4 pt-2"
                    onChange={(event) => {
                      let newComment = event.target.value
                      if (newComment.length > 500) {
                        newComment = newComment.slice(0, 500)
                      }
                      setCurrentComment(newComment)
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
                onClick={async () => {
                  await commentDeepLink({
                    videoSlug: videoDetails.video?.slug,
                    communityId: videoDetails.community.share_string,
                    loopId: videoDetails.loop.share_string,
                    searchParams,
                  }).then((generatedLink) => {
                    openModal({ deepLink: generatedLink, subtitle: <>Get the app to comment on this video.</> })
                  })
                }}
                placeholder="Add a comment"
                className="h-full w-full rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
                <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={async () => {
            await commentDeepLink({
              videoSlug: videoDetails.video?.slug,
              communityId: videoDetails.community.share_string,
              loopId: videoDetails.loop.share_string,
              searchParams,
            }).then((generatedLink) => {
              openGeneratedLink(generatedLink)
            })
          }}
          className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 px-2 py-3 shadow-md">
          <div className="flex w-full flex-1 items-center gap-x-4">
            <div
              placeholder="Add a comment"
              className="h-full w-full rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
              <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
