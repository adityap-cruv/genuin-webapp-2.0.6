import { CommentSheet, CommentSheetContent } from '@components/custom/comment-sheet'
import { X } from 'lucide-react'
import { useCommentSheetStore } from './store'
import { Comments } from '@components/common/comments'
import Image from 'next/image'
import icAudioRecord from '@icons/audioRecord.svg'
import icVideoRecord from '@icons/videoRecord.svg'
import { type VideoDataType } from '@lib/schemas/video'
import { generateDeepLink, openGeneratedLink, openModal } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useState } from 'react'
import { Input } from '@components/ui/input'
import { createComment } from '@lib/api/video'
import { DownloadDialog } from '@components/common/download-dialog'
import { Textarea } from '@components/ui/textarea'

type Props = {
  container: React.MutableRefObject<HTMLDivElement | null>
  videoDetails: VideoDataType
  noOfComments: number
}

// TODO: remove comment sheet with general sheet because there is no difference between.
// Sheet is only used in mobile component for now.
export function Sheet({ container, videoDetails, noOfComments }: Props) {
  const { isOpen, close, currentVideoId } = useCommentSheetStore((state) => ({
    isOpen: state.modalIsOpen,
    close: state.closeModal,
    currentVideoId: state.currentVideoId,
  }))
  const shouldOpen = isOpen && currentVideoId === videoDetails.video?.share_string
  const [currentComment, setCurrentComment] = useState('')
  const [comments, setComments] = useState([])

  return (
    <CommentSheet open={shouldOpen} modal={true}>
      <CommentSheetContent
        onInteractOutside={() => {
          close()
        }}>
        <div className="h-full w-full rounded-t-[18px] bg-background outline-none sm:rounded-t-none">
          <div className="flex h-12 w-full items-center justify-between border-b border-monochrome-9 px-3 ">
            <p className="text-title-3-demi text-secondary">Comments{noOfComments !== 0 ? `(${noOfComments})` : ''}</p>
            <X
              className="h-6 w-6 cursor-pointer stroke-secondary"
              onClick={() => {
                close()
              }}
            />
          </div>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <Comments.withApi
              setComments={setComments}
              comments={comments}
              videoId={videoDetails?.video?.share_string ?? ''}
            />
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
    <>
      {embed ? (
        <div className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 px-2 py-3 shadow-md">
          <div className="flex w-full flex-1 items-center gap-x-4">
            {user ? (
              <>
                <div className="relative flex w-full items-center">
                  {/* <Input
                    placeholder="Add a comment"
                    value={currentComment}
                    disabled={!user}
                    className="rounded-full border border-monochrome-9 bg-monochrome-white"
                    onChange={(event) => {
                      const newComment = event.target.value
                      setCurrentComment(newComment)
                    }}
                  /> */}

                  <Textarea
                    placeholder="Add a comment"
                    value={currentComment}
                    disabled={!user}
                    className="h-10 rounded-full border border-tertiary-200 bg-monochrome-white px-14 pl-4 pt-2"
                    onChange={(event) => {
                      let newComment = event.target.value
                      if (newComment.length > 500) {
                        newComment = newComment.slice(0, 500)
                      }
                      setCurrentComment(newComment)
                    }}
                  />

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
                className="h-full w-2/3 rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
                <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
              </div>
            )}
            <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
              <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
            </DownloadDialog>
            <DownloadDialog title="Get the Genuin app" subtitle="Get the app to comment on this video." asChild>
              <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
            </DownloadDialog>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            void generateDeepLink({
              action: 'comment',
              contentType: 'video',
              description: ``,
              title: ``,
              previewImage: null,
              fromUserName: null,
              pathName: PATH_NAME.video(videoDetails.video?.slug),
              utmCampaign: 'share',
              utmMedium: 'web',
              utmSource: window.location.hostname,
              community: videoDetails.community.share_string,
              loop: videoDetails.loop.share_string,
            }).then((generatedLink) => {
              openGeneratedLink(generatedLink)
            })
          }}
          className="sticky bottom-0 left-0 h-16 w-full border-t-2 border-t-monochrome-9 bg-monochrome-10 px-2 py-3 shadow-md">
          <div className="flex w-full flex-1 items-center gap-x-4">
            <div
              placeholder="Add a comment"
              className="h-full w-2/3 rounded-full border-2 border-monochrome-9 bg-monochrome-white py-2 pl-6">
              <p className="text-start text-title-3-demi text-monochrome">Add a Comment</p>
            </div>
            <Image src={icAudioRecord} alt="audio record" className="h-8 w-8" />
            <Image src={icVideoRecord} alt="audio record" className="h-8 w-8" />
          </div>
        </div>
      )}
    </>
  )
}
