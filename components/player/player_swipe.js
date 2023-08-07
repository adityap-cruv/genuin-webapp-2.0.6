import React, { useMemo } from 'react'
import { ReactPlayerWrapper } from './react_player_wrapper_swipe'
import { Box, Flex } from '@chakra-ui/react'

export const Player = ({
  videoId,
  description,
  videoUrl = '',
  videoThumbnail,
  videos = [],
  index,
  currentVideoIndexRef,
  loadMoreVideos = () => { },
  videosLength,
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
  uniqueKey,
  disableWatch,
  contextReel, //! this is temporary
  scrollToNextVideo = () => { },
  loop
}) => {
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
        videoThumbnail={videoThumbnail}
        videos={videos}
        index={index}
        currentVideoIndexRef={currentVideoIndexRef}
        videosLength={videosLength}
        loadMoreVideos={loadMoreVideos}
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
        uniqueKey={uniqueKey}
        disableWatch={disableWatch}
        contextReel={contextReel}
        scrollToNextVideo={scrollToNextVideo}
        loop={loop}
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
