import { useRef, useMemo, useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { FeedVideoType } from '@/type'
import CommentsLayout from '../comments/comments-layout'
import { useExpandViewContext } from '@/context/expand-view'
import { CloseIcon } from '../icons/close-icon'

type FullScreenCommentBoxProps = {
  videosDetails: FeedVideoType
  isMobileCommentView?: boolean
}

const FullScreenCommentBoxLayout = ({
  videosDetails,
}: FullScreenCommentBoxProps) => {
  const [isMobileCommentView, setIsMobileCommentView] = useState(
    window.innerWidth < 1280,
  )

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobileCommentView(window.innerWidth < 1280)
      }, 100) // Debounce effect
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <FullScreenCommentBox
      videosDetails={videosDetails}
      isMobileCommentView={isMobileCommentView}
    />
  )
}

const FullScreenCommentBox = ({
  videosDetails,
  isMobileCommentView,
}: FullScreenCommentBoxProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { toggleCommentBox, isCommentBoxOpen } = useExpandViewContext()
  const [shouldRender, setShouldRender] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isCommentBoxOpen) {
      setShouldRender(true)
      setTimeout(() => {
        setIsAnimating(true)
      }, 100) // Delay before showing
    } else {
      setIsAnimating(false)
      setTimeout(() => setShouldRender(false), 700) // Wait for closing animation
    }
  }, [isCommentBoxOpen])

  const commentBoxContent = useMemo(
    () => (
      <div
        ref={scrollDivRef}
        className='hide-scrollbar relative bg-background flex h-full flex-col overflow-hidden overflow-y-scroll rounded-2xl'>
        <CommentsLayout videoDetails={videosDetails} />
      </div>
    ),
    [videosDetails],
  )

  if (!shouldRender) return undefined

  return (
    <>
      {isMobileCommentView ? (
        <Dialog open={isAnimating}>
          <DialogContent
            showClose={false}
            className='mb-4 w-full max-w-[500px] p-0 sm:h-3/4 sm:p-0 sm:w-full'>
            <DialogClose className='absolute right-4 top-4 z-20 outline-none'>
              <CloseIcon onClick={toggleCommentBox} />
            </DialogClose>
            {commentBoxContent}
          </DialogContent>
        </Dialog>
      ) : (
        <div
          style={{ height: 'calc(100% - 32px)' }}
          className={`rounded-2xl my-4 bg-monochrome-white pl-2 transition-all duration-700 ease-in-out ${
            isAnimating ? 'w-1/4 opacity-100' : 'w-0 opacity-0'
          }`}>
          {commentBoxContent}
        </div>
      )}
    </>
  )
}

export default FullScreenCommentBoxLayout
