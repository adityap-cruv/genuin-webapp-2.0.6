import { useEffect, memo, useState, useRef } from 'react'
import { useSizeContext } from '@/context/size'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FeedVideoType } from '@/type'
import { cn } from '@/utils'
import { Loader } from '../loader'
import { PlayerModalMobile } from '../full-screen-view/mobile'
import { CommunityUserRole, mapCommunityUserRole } from '../tree-structure'
import { useExpandViewContext } from '@/components/expand-view/context'
import { ExpandView } from '../expand-view'
import { useAuth } from '@/context/auth'
import { getUpdatedVideoDetails } from '../authentication/api/auth'

type PlayerModalPropsType = {
  videos?: FeedVideoType[]
  isLoading: boolean
  fetchNextPage: () => void
  open: boolean
  startIndex?: number
  closeModal?: () => void
  onCommunityRoleChanged: (communityId: string, role: CommunityUserRole) => void
  onSpark: (videoId: string, isSparked: boolean) => void
  onCommentCountChange: (videoId: string, count: number) => void
  onSubscriberChange: (loopId: string, isSubscribed: boolean) => void
}

export const PlayerModal = memo(function PlayerModal({
  videos,
  isLoading,
  open,
  startIndex = 0,
  fetchNextPage,
  closeModal,
  onCommunityRoleChanged,
  onSpark,
  onCommentCountChange,
  onSubscriberChange,
}: PlayerModalPropsType) {
  const { user } = useAuth()
  const { setFullScreen, toggleFullScreen } = useExpandViewContext()
  const [activeIndex, setActiveIndex] = useState(startIndex)
  const { isMobile, sizeBoxes } = useSizeContext()

  // Combine both refs into one
  const stateRef = useRef({
    hasDetailsFetched: false,
    prevUser: user,
  })

  useEffect(() => {
    if (!videos) return
    if (activeIndex === videos.length - 4) {
      fetchNextPage()
    }
  }, [activeIndex, videos])

  useEffect(() => {
    setActiveIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    setFullScreen(open)
  }, [open])

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videos || videos.length === 0) return
      try {
        const videoIds = videos.map((v) => v.video.uuid)
        const updated = await getUpdatedVideoDetails(videoIds)

        updated.forEach((item) => {
          const index = videos.findIndex(
            (v) => v.video.uuid === item.video.uuid,
          )
          if (index !== -1) {
            const updatedRole = mapCommunityUserRole(
              item.community.logged_in_user_role,
            )
            onCommunityRoleChanged(videos[index].community.uuid, updatedRole)
            onCommentCountChange(item.video.uuid, item.video.no_of_comments)
            onSubscriberChange(item.loop.uuid, item.loop.is_subscriber)
          }
        })
        stateRef.current.hasDetailsFetched = true
      } catch (error) {
        console.error('Error updating video details:', error)
      }
    }

    // Only fetch if modal is open, user exists, and details haven't been fetched yet
    if (
      user &&
      !stateRef.current.prevUser &&
      open &&
      videos &&
      videos.length > 0 &&
      !stateRef.current.hasDetailsFetched
    ) {
      void fetchVideoDetails()
    }

    // Reset the flag when modal closes
    if (!open) {
      stateRef.current.hasDetailsFetched = false
    }
    stateRef.current.prevUser = user
  }, [user, open, videos])

  if (!open) return null

  return (
    <>
      {isMobile ? (
        <Dialog open={open}>
          <DialogContent
            className={cn(
              'bg-transparent p-0 flex items-center justify-center h-full w-full',
            )}
            showClose={false}>
            {isLoading || !videos ? (
              <div className='bg-background p-6 rounded-lg'>
                <Loader className='fill-primary stroke-primary' />
              </div>
            ) : (
              <PlayerModalMobile
                activeIndex={activeIndex}
                closeModal={toggleFullScreen}
                shouldPlay
                showNavigationBar
                sizeBox={sizeBoxes.modal ?? { width: 0, height: 0 }}
                updateActiveIndex={setActiveIndex}
                videos={videos}
                forStandardWall={false}
                showClose
                onSpark={onSpark}
                onCommentCountChange={onCommentCountChange}
              />
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <div>
          {isLoading || !videos ? (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black h-screen w-full'>
              <Loader className='fill-primary stroke-primary' />
            </div>
          ) : (
            <ExpandView
              videos={videos}
              activeIndex={activeIndex}
              onCloseExpandView={() => closeModal?.()}
              onSpark={onSpark}
              onCommentCountChange={onCommentCountChange}
              onActiveIndexChange={setActiveIndex}
            />
          )}
        </div>
      )}
    </>
  )
})
