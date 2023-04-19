import React, { useState, useMemo, useEffect } from 'react'
import { ReactPlayerWrapper } from './react_player_wrapper_swipe'
import { increaseVideoViewCount } from '../../actions/postActions'
import { Box, Flex } from '@chakra-ui/react'

export const Player = ({
  video_id_to_use,
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
  watchRoundTable = false,
  setWatchRoundtable = () => {},
  onClose = () => {},
  direction,
  setDirection,
  verticalNavigation,
  shareUrl,
  muted,
  onClick,
  loadMoreVideos = () => { },
  setCurrentVideoIndex,
  uniqueKey,
  disableWatch,
  contextReel//! this is temporary
}) => {
  const [triggerPlayCount, setTriggetPlayCount] = useState(false)
  const [duration, setDuration] = useState(0)

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

  const handleDuration = (event) => {
    setDuration(Math.round(Number.parseFloat(event)))
  }

  const handleProgress = (event) => {
    const playedProgress = Math.round(Number.parseFloat(event.played) * 100)
    if (playedProgress >= duration / 2 && !triggerPlayCount) {
      setTriggetPlayCount(true)
    }
  }

  useEffect(() => {
    if (triggerPlayCount) {
      let type = 1
      if (roundTableMode) {
        type = 2
      }
      increaseVideoViewCount(video_id_to_use, type)
    }
  }, [video_id_to_use, triggerPlayCount])

  return (
    <Flex
      w='100%'
      h='100%'
      justifyContent='center'
      alignItems='center'
      position='relative'
    >
      <Box
        backgroundImage={`url(${videoThumbnail})`}
        backgroundColor={videoThumbnail ? 'transparent' : 'rgba(0,0,0,0.9)'}
        backgroundRepeat='no-repeat'
        backgroundSize='cover'
        backgroundPosition='center'
        width='100%'
        h='100%'
        left={0}
        top={0}
        pos='absolute'
        filter='blur(25px) brightness(95%)'
      />
      {/* don't show if it's a pad & watch roundtable  */}
      {/* {(!watchRoundTable || !pad) && (
        <TopNav showGetAppModal={showGetAppModal} variant='light' />
      )} */}
      <ReactPlayerWrapper
        videoUrl={videoUrl}
        onProgress={handleProgress}
        onDuration={handleDuration}
        videoThumbnail={videoThumbnail}
        videos={videos}
        currentVideoIndex={currentVideoIndex}
        userName={userName}
        userId={userId}
        description={shortDescription}
        profilePic={profilePic}
        rtProfilePic = {rtProfileImage}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
        roundTableMode={roundTableMode}
        autoplay={autoplay}
        autoJumpToNextVideo={autoJumpToNextVideo}
        onEnded={onEnded}
        roundTableName={roundTableName}
        roundTableId={roundTableId}
        watchRoundTable={watchRoundTable}
        setWatchRoundtable={setWatchRoundtable}
        onClose={() => {
          onClose()
        }}
        direction={direction}
        setDirection={setDirection}
        verticalNavigation={verticalNavigation}
        shareUrl={shareUrl}
        muted={muted}
        onClick={onClick}
        loadMoreVideos={loadMoreVideos}
        setCurrentVideoIndex={setCurrentVideoIndex}
        uniqueKey={uniqueKey}
        disableWatch={disableWatch}
        contextReel={contextReel}
        duration={duration}
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
