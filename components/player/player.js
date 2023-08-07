import React, { useMemo, useRef } from 'react'
import { ReactPlayerWrapper } from './react_player_wrapper'
import { TopNav } from '../navbar/top_nav'
import { Flex, useBreakpointValue, Image } from '@chakra-ui/react'
import { analyticsService } from '../basic/analytics_service'

// for debounceTimeout function
let debounceTimeout = null

export const Player = ({
  videoId,
  description,
  videoUrl = '',
  videoThumbnail,
  videos = [],
  currentVideoIndex,
  userName,
  userProfileImage = '',
  rtProfileImage = '',
  userId,
  getNextVideo,
  getPrevVideo,
  roundTableMode,
  children,
  autoplay,
  autoJumpToNextVideo,
  onEnded,
  showGetAppModal,
  roundTableName,
  roundTableId,
  onClickOutsideOfVideo,
  watchRoundTable = false,
  setWatchRoundtable = () => {},
  onClose = () => {},
  direction,
  setDirection,
  verticalNavigation,
  shareUrl,
  muted,
  onClick,
  singleVideoView
}) => {
  const pad = useBreakpointValue({ base: true, xs: true, sm: true, md: true, lg: false, xl: false })
  const videoPlayingDetails = useRef({ duration: 0, currentTime: 0 })

  const updateVideoPlayingDetail = ({ duration = null, currentTime = null }) => {
    if (duration) {
      videoPlayingDetails.current.duration = duration
    } else {
      videoPlayingDetails.current.currentTime = currentTime
    }
  }
  const shortDescription = useMemo(() => {
    if (description?.length > 50) {
      return `${description.slice(0, 50)}...`
    }
    return description
  }, [description])

  const profilePic = useMemo(() => {
    if (userProfileImage) {
      return isValidHttpUrl(userProfileImage)
        ? userProfileImage
        : `https://media.qa.begenuin.com/backend_assets/lottie/${userProfileImage}.png`
    }
    return 'https://media.qa.begenuin.com/backend_assets/lottie/snowman.png'
  }, [userProfileImage])

  return (
    <Flex
      w='100%'
      h='100%'
      justifyContent='center'
      alignItems='center'
      position='fixed'
      backgroundColor='black'
    >
      <Image
        src={videoThumbnail}
        backgroundColor={videoThumbnail ? 'transparent' : 'rgba(0,0,0,0.9)'}
        backgroundRepeat='no-repeat'
        backgroundSize='cover'
        backgroundPosition='center'
        width='110%'
        height='110%'
        top='-10'
        pos='absolute'
        filter='blur(25px) brightness(30%)'
        onError={({ currentTarget }) => {
          currentTarget.onerror = null // prevents looping
          currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)'
          currentTarget.style.filter = 'brightness(0%)'
        }}
      />
      {/* don't show if it's a pad & watch roundtable  */}
      {!pad && (
        <TopNav showGetAppModal={showGetAppModal} variant='light' isContiner={true} />
      )}
      <ReactPlayerWrapper
        videoUrl={videoUrl}
        videoThumbnail={videoThumbnail}
        videos={videos}
        currentVideoIndex={currentVideoIndex}
        userName={userName}
        userId={userId}
        description={shortDescription}
        profilePic={profilePic}
        rtProfilePic = {rtProfileImage}
        // analyticsService for getNextVideo 'video_watch'
        getNextVideo = {() => {
          getNextVideo()

          clearTimeout(debounceTimeout)
          debounceTimeout = setTimeout(() => {
            const event_name = 'video_watch'
            const event_details = {
              video_share_string: videoId,
              loop_share_string: roundTableId,
              page: window.location.href,
              duration: Math.round(videoPlayingDetails.current.duration),
              watch_time: Math.round(videoPlayingDetails.current.currentTime)
            }
            analyticsService({ eventDetails: event_details, eventName: event_name })

            debounceTimeout = null
          }, 500)
        }}
        // analyticsService for getPrevVideo 'video_watch'
        getPrevVideo={() => {
          getPrevVideo()
          const event_name = 'video_watch'
          const event_details = {
            video_share_string: videoId,
            loop_share_string: roundTableId,
            page: window.location.href,
            duration: Math.round(videoPlayingDetails.current.duration),
            watch_time: Math.round(videoPlayingDetails.current.currentTime)
          }
          analyticsService({ eventDetails: event_details, eventName: event_name })
        }}
        roundTableMode={roundTableMode}
        autoplay={autoplay}
        autoJumpToNextVideo={autoJumpToNextVideo}
        // analyticsService for onEnded 'video_watch'
        onEnded = {() => {
          onEnded()
          clearTimeout(debounceTimeout)
          debounceTimeout = setTimeout(() => {
            const event_name = 'video_watch'
            const event_details = {
              video_share_string: videoId,
              page: window.location.href,
              duration: Math.round(videoPlayingDetails.current.duration),
              watch_time: Math.round(videoPlayingDetails.current.currentTime)
            }
            analyticsService({ eventDetails: event_details, eventName: event_name })

            debounceTimeout = null
          }, 500)
        }}
        roundTableName={roundTableName}
        roundTableId={roundTableId}
        watchRoundTable={watchRoundTable}
        setWatchRoundtable={setWatchRoundtable}
        direction={direction}
        setDirection={setDirection}
        verticalNavigation={verticalNavigation}
        shareUrl={shareUrl}
        muted={muted}
        onClick={onClick}
        updateVideoDetails={updateVideoPlayingDetail}
        singleVideoView={singleVideoView}
      >
        {children}
      </ReactPlayerWrapper>
    </Flex>
  )
}

export function isValidHttpUrl (string) {
  let url
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}
