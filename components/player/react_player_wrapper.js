import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Badge, Button, ProgressBar } from 'react-bootstrap'
import { Image, Flex, Text, Link, Box, useBreakpointValue, Avatar } from '@chakra-ui/react'

import icArrowDown from '../../assets/images/video-more-options/ic-arrow-down.svg'
import icArrowUp from '../../assets/images/video-more-options/ic-arrow-up.svg'
import icArrowLeft from '../../assets/images/video-more-options/ic-arrow-left.svg'
import icArrowRight from '../../assets/images/video-more-options/ic-arrow-right.svg'
import icFlipLeft from '../../assets/images/video-more-options/ic-flip-left.svg'
import icFlipRight from '../../assets/images/video-more-options/ic-flip-right.svg'
import icClose from '../../assets/images/video-more-options/ic-close.svg'
import earth from '../../assets/images/video-more-options/ic-earth.svg'
import roundtable from '../../assets/images/video-more-options/ic-roundtable.svg'
import { DynamicPlayer } from './dynamic_player'
import icMute from '../../assets/images/video-more-options/ic-mute.svg'
import icUnmute from '../../assets/images/video-more-options/ic-unmute.svg'
import icMuteDesktop from '../../assets/images/video-more-options/ic-mute-desktop.svg'
import icUnmuteDesktop from '../../assets/images/video-more-options/ic-unmute-desktop.svg'
import { isMobile } from 'react-device-detect'
import { FontStyle } from '../../constants/font_style'

export const ReactPlayerWrapper = ({
  videoUrl,
  onProgress,
  videoThumbnail,
  videos,
  currentVideoIndex,
  userName,
  userId,
  description,
  profilePic,
  rtProfilePic,
  children,
  onDuration,
  onEnded,
  getNextVideo,
  getPrevVideo,
  roundTableMode = false,
  roundTableName = '',
  roundTableId,
  autoplay = true,
  autoJumpToNextVideo = false,
  watchRoundTable,
  setWatchRoundtable,
  direction,
  setDirection,
  verticalNavigation,
  shareUrl,
  muted,
  onClick,
  updateVideoDetails,
  singleVideoView = false,
  onClose,
  progress
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [rtEnded, setRtEnded] = useState(false)
  const [isMutedDebounced] = useDebounce(muted, 800)

  const handleOnClick = useCallback(() => {
    if (isMobile) {
      onClick()
    } else {
      setIsPlaying((old) => !old)
    }
  }, [])

  const touchStartYRef = useRef(0)
  const getPrevVideoRef = useRef(getPrevVideo)
  getPrevVideoRef.current = getPrevVideo
  const getNextVideoRef = useRef(getNextVideo)
  getNextVideoRef.current = getNextVideo
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress
  const onDurationRef = useRef(onDuration)
  onDurationRef.current = onDuration
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  const mobile = useBreakpointValue({ base: true, md: false })

  // const setProgressWrapper = useCallback(
  //   (event) => {
  //     const playedProgress = Math.round(Number.parseFloat(event.played) * 100)
  //     setProgress(playedProgress)
  //     onProgressRef?.current?.(event)
  //   }, [setProgress])

  // const setDurationWrapper = useCallback((event) => {
  //   onDurationRef?.current?.(event)
  // })

  useEffect(() => {
    const touchStart = (e) => {
      touchStartYRef.current = e.changedTouches[0].clientY
    }

    const popstateHandler = (e) => {
      onClose()
    }

    const touchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY
      if (touchStartYRef.current > touchEndY + 5) {
        setRtEnded(false)
        setIsPlaying(true)
        getNextVideoRef?.current?.()
      } else if (touchStartYRef.current < touchEndY - 5) {
        getPrevVideoRef?.current?.()
      }
      // setIsPlaying(true);
      // clearInterval(delay);
    }

    window.addEventListener('touchstart', touchStart)
    window.addEventListener('popstate', popstateHandler)
    window.addEventListener('touchend', touchEnd)
    return () => {
      window.removeEventListener('popstate', popstateHandler)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchend', touchEnd)
    }
  }, [])

  const onEndedWrapper = useCallback(
    (e) => {
      if (roundTableMode) {
        setRtEnded(true)
        setIsPlaying(false)
      }

      if (!roundTableMode) {
        onEndedRef?.current?.(e)
      }
      if (autoJumpToNextVideo) {
        if (direction === 'forward') getNextVideoRef?.current?.()
        if (direction === 'backward') getPrevVideoRef?.current?.()
      }
    },
    [autoJumpToNextVideo, direction]
  )

  const changeState = () => {
    if (rtEnded) {
      setRtEnded(false)
      setIsPlaying(true)
    }
  }

  const getTimeDiff = () => {
    let time = Math.floor(
      (Date.now() - Number(videos[currentVideoIndex]?.conversation_at)) / 1000
    )
    if (time < 60) {
      return `${time}s`
    }
    time = Math.floor(time / 60)
    if (time < 60) {
      return `${time}m`
    }
    time = Math.floor(time / 60)
    if (time < 24) {
      return `${time}h`
    }
    time = Math.floor(time / 24)
    if (time < 7) {
      return `${time}d`
    }
    return `${Math.floor(time / 7)}w`
  }

  return (
    <div
      className="video-container"
      style={{
        color: 'white',
        display: 'flex'
      }}

    >
      <DynamicPlayer
        isPlaying={isPlaying}
        url={videoUrl}
        muted={muted}
        uniqueKey={videos[currentVideoIndex]?.conversation_id || 'genuin-player'}
        onClick={handleOnClick}
        onDuration={(event) => {
          updateVideoDetails({ duration: event?.target?.duration })
        }}
        onEnded={onEndedWrapper}
        onTimeUpdate={(event) => {
          updateVideoDetails({ currentTime: event?.target?.currentTime })
        }}
        loop={false}
        autoPlay={autoplay}
      />
      {!isMobile && <div style={{
        position: 'absolute',
        top: watchRoundTable ? '100px' : '10px',
        left: '1%',
        zIndex: 2
      }}
      onClick={() => {
        onClick()
      }}>
        <img src={muted ? icMuteDesktop.src : icUnmuteDesktop.src}/>
      </div>}
      {/* roundtable header */}
      {watchRoundTable && (
        <Flex
          w="full"
          position="absolute"
          top="0"
          p={4}
          direction="column"
          gap={2}
        >
          <Flex
            w="full"
            justifyContent="space-between"
            alignItems="center"
            h={10}
          >
            <Text fontWeight="bold" fontSize={17}>
              {videos[currentVideoIndex] && `${getTimeDiff()}`}
            </Text>
            <Link href={'/l/' + roundTableId}>
              <Flex
                alignItems="center"
                gap={3}
                margin="0"
                position="absolute"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                <Text
                  background="rgba(17, 17, 17, 0.6)"
                  borderRadius="5px"
                  p={2}
                  fontWeight="bold"
                  fontSize={{ base: 14, sm: 17 }}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {roundTableName}
                </Text>
                <Image
                  src={earth.src}
                  width={{ base: 5, sm: 6 }}
                  height={{ base: 5, sm: 6 }}
                  alt="Roundtable"
                  title="Roundtable"
                />
              </Flex>
            </Link>
            <Image
              src={icClose.src}
              width={6}
              height={6}
              alt="Close"
              title="Close"
              onClick={onClose}
            />
          </Flex>
          <Flex w="full" gap={1}>
            {/* {JSON.stringify(videos)} */}
            {Boolean(videos.length) &&
              videos.map((_, index) => {
                return (
                  <Box h={1} w="full" borderRadius={10} background="white" key={index}>
                    {direction === 'forward' && (
                      <Box
                        backgroundColor="#0645FF"
                        borderRadius={10}
                        h={1}
                        w={`${
                          index < currentVideoIndex
                            ? 100
                            : index === currentVideoIndex
                              ? progress
                              : 0
                        }%`}
                      />
                    )}
                    {direction === 'backward' && (
                      <Box
                        backgroundColor="#0645FF"
                        borderRadius={10}
                        h={1}
                        float="right"
                        w={`${
                          index > currentVideoIndex
                            ? 100
                            : index === currentVideoIndex
                              ? progress
                              : 0
                        }%`}
                      />
                    )}
                  </Box>
                )
              })}
          </Flex>
          <Flex w="full" justifyContent="space-between" alignItems="center">
            <Text fontWeight={600} fontSize={17}>
              {videos[currentVideoIndex]?.meta_data?.duration} Sec
            </Text>
            {direction === 'forward' ? (
              <Image
                src={icFlipRight.src}
                width={6}
                height={6}
                alt="Flip Right"
                title="Flip Right"
                onClick={() => setDirection('backward')}
              />
            ) : (
              <Image
                src={icFlipLeft.src}
                width={6}
                height={6}
                alt="Flip Left"
                title="Flip Left"
                onClick={() => setDirection('forward')}
              />
            )}
          </Flex>
        </Flex>
      )}
      {/* x button */}
      {!watchRoundTable && !mobile && !singleVideoView && (
        <Flex
          w="full"
          position="absolute"
          top="0"
          p={4}
          direction="column"
          gap={2}
        >
          <Flex
            w="full"
            justifyContent="space-between"
            alignItems="center"
            h={10}
          >
            <Box />
            <Image
              src={icClose.src}
              width={6}
              height={6}
              // marginTop={mobile ? '50px' : '0px' }
              alt="Close"
              title="Close"
              onClick={onClose}
            />
          </Flex>
        </Flex>
      )}

      {/* don't show it if it's watchRoundTable  */}
      {(watchRoundTable || (!verticalNavigation && roundTableMode) || (verticalNavigation && !roundTableMode) || (verticalNavigation && (roundTableMode && !rtEnded))) && (
        <>{isMobile ? <>
          {muted
            ? <Image
              src={icMute.src}
              className="btn-play"
              opacity={0.7}
              style={{
                display: isMutedDebounced ? 'none' : 'block'
              }}
            />
            : <Image
              src={icUnmute.src}
              className="btn-play"
              style={{
                display: isMutedDebounced ? 'block' : 'none'
              }}
              opacity={0.7}
            />}</> : <>
        </>}

        </>
      )}
      {Boolean(getNextVideo) &&
      Boolean(getPrevVideo) && !singleVideoView &&
      (!roundTableMode || verticalNavigation) ? (
          <div className="btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center">
            {currentVideoIndex !== 0 && (
              <button className='btn-arrow' onClick={() => { changeState(); getPrevVideo() }}>
                <Image
                  src={icArrowUp.src}
                  width={12}
                  height={6}
                  alt="Arrow Up"
                  title="Arrow Up"
                />
              </button>
            )}
            {currentVideoIndex === 0 && <Box h={12} />}
            {currentVideoIndex !== videos.length - 1 && (
              <button className='btn-arrow' onClick={() => { changeState(); getNextVideo() }}>
                <Image
                  src={icArrowDown.src}
                  width={12}
                  height={6}
                  alt="Arrow Down"
                  title="Arrow Down"
                />
              </button>
            )}
            {currentVideoIndex === videos.length - 1 && <Box h={16} />}
          </div>
        ) : null}
      {Boolean(getNextVideo) &&
        Boolean(getPrevVideo) &&
        roundTableMode &&
        watchRoundTable && (
        <Button
          className="btn-arrow"
          style={{
            position: 'absolute',
            top: '50%',
            right: -60
          }}
          onClick={getNextVideo}
        >
          <Image
            src={icArrowRight.src}
            width={6}
            height={6}
            alt="Arrow Right"
            title="Arrow Right"
          />
        </Button>
      )}
      {Boolean(getNextVideo) &&
        Boolean(getPrevVideo) &&
        roundTableMode &&
        watchRoundTable && (
        <Button
          className="btn-arrow"
          style={{
            position: 'absolute',
            top: '50%',
            left: -60
          }}
          onClick={getPrevVideo}
        >
          <Image
            src={icArrowLeft.src}
            width={6}
            height={6}
            alt="Arrow Left"
            title="Arrow Left"
          />
        </Button>
      )}
      {Boolean(roundTableMode) && Boolean(rtEnded) && !watchRoundTable && (
        <div className='rt-video-overlay'>
          <Flex direction='column' alignItems='center' justifyContent='center' mb={3}>
            <div className='watch-again-auther mb-2'>
              <Button
                transform = 'translate(-50%, -50%)'
                border='1px solid #FFFFFF'
                fontWeight='bold'
                display='flex'
                height = '32px'
                cursor = 'pointer'
                position = 'absolute'
                top = '48%'
                left = '50%'
                variant='outline-light'
                style = {{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '200px !important'
                }}
                justifyContent='center'
                className='watch-roundtable'
                onClick={() => {
                  if (singleVideoView) {
                    window.history.pushState(null, '', `/l/${roundTableId}`)
                    window.location.reload()
                    return
                  }
                  if (verticalNavigation && shareUrl) {
                    window.location.href = `${process.env.hostname}l/${shareUrl.split('/').pop()}`
                    onClose()
                  } else {
                    setWatchRoundtable(true)
                    setIsPlaying(true)
                  }
                }}
              >
                <Image
                  src={roundtable.src}
                  size={1}
                  className='left'
                  alt='Watch'
                  ml='-1'
                  mt='-0.5'
                  md='-0.5'
                  pr={3}
                />
                {/* Watch roundtable */}
                <Text color='white' marginTop={'-0.5'}>
                Watch Loop
                </Text>
              </Button>
            </div>
            <div className='video-auther'>
              <Button
                transform = 'translate(-50%, -50%)'
                // border='1px solid #FFFFFF'
                fontWeight='bold'
                display='flex'
                width = '187px !important'
                height = '32px'
                cursor = 'pointer'
                position = 'absolute'
                top = '52%'
                left = '50%'
                variant='outline'
                // className='ms-3'
                justifyContent='center'
                className='watch-again'
                // className='btn-watch-roundtable'
                onClick={() => {
                  setIsPlaying(true)
                  setRtEnded(false)
                }}
              >
                {/* Watch again */}
                <Text color='white'>
                Watch again
                </Text>
              </Button>
            </div>
          </Flex>
        </div>)}
      <div className='video-footer bg-gradient-180'>
        <Flex alignItems='end' justifyContent='space-between' mb={3}>
          {/* this should not show if it's rountableMode && watchRoundTable  */}
          {(!watchRoundTable || !roundTableMode) && (
            <Flex direction="column" style={{
              wordBreak: 'break-word',
              width: '84%'
            }}>
              {Boolean(roundTableMode) && (
                <Link
                  key={userName}
                  href={`/p/${userName}`}
                  _hover={{
                    textDecoration: 'none'
                  }}
                >
                  <Badge
                    pill bg="dark"
                    className="mb-2 align-self-start trunc"
                    style={{
                      fontSize: FontStyle.subtitle.fontSize,
                      fontWeight: 700,
                      lineHeight: FontStyle.subtitle.fontSize
                    }}
                  >
                    <Flex direction='horizontal'>
                      <Text style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        maxWidth: '75%'
                      }}>
                        @{userName}
                      </Text>
                      <pre style={{
                        overflow: 'visible'
                      }}> added</pre>
                    </Flex>
                  </Badge>
                </Link>
              )}
              <div className="video-auther mb-2"
                style={{
                  fontWeight: 'bold',
                  fontSize: FontStyle.title.fontSize,
                  lineHeight: FontStyle.title.lineHeight
                }}>
                {roundTableMode ? (
                  <Avatar
                    name={roundTableName}
                    width={9}
                    height={9}
                    src={rtProfilePic ?? ''}
                    size="l"
                    background="#A4E6DA"
                    className="img-auther-pic"
                  />
                ) : (
                  <Image
                    src={profilePic}
                    width={9}
                    height={9}
                    alt={userName}
                    title={userName}
                    className="img-auther-pic"
                  />
                )}
                {roundTableMode ? (
                  <Flex alignItems="center">
                    <Link
                      href={`/l/${roundTableId}`}
                      style={{
                        marginRight: '10px',
                        maxWidth: '150px'
                      }}
                    >
                      <Text
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {roundTableName}
                      </Text>
                    </Link>
                    <Button
                      variant="outline-light"
                      onClick={() => {
                        if (singleVideoView) {
                          window.history.pushState(null, '', `/l/${roundTableId}`)
                          window.location.reload()
                          return
                        }
                        if (verticalNavigation && shareUrl) {
                          window.location.href = shareUrl
                          // window.location.href = `${process.env.hostname}rt/${shareUrl.split("/").pop()}`
                          onClose()
                        } else {
                          setWatchRoundtable(true)
                          setIsPlaying(true)
                        }
                      }}
                      style={{
                        fontWeight: '700',
                        fontSize: FontStyle.subtitle.fontSize
                      }}
                    >
                          Watch
                    </Button>
                  </Flex>
                ) : (
                  <Link
                    href={`/p/${userName}`}
                    maxW="150px"
                  >
                    <Text
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      fontSize={FontStyle.title.fontSize}
                    >
                          @{userName}
                    </Text>
                  </Link>
                )}
              </div>
              <p className="mb-0" style={{
                fontSize: FontStyle.subtitle.fontSize,
                fontWeight: '600'
              }}>{description}</p>
            </Flex>
          )}
          {watchRoundTable && roundTableMode && (
            <Link
              href={`/p/${userName}`}
              _hover={{
                textDecoration: 'none'
              }}
            >
              <Flex alignItems="center" gap={2}>
                <Image
                  src={profilePic}
                  width={9}
                  height={9}
                  alt={userName}
                  title={userName}
                  className="img-auther-pic"
                />
                <Text
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  maxW='70%'
                  fontSize={FontStyle.title.fontSize}
                  fontWeight='bold'
                >
                  @{userName}
                </Text>
              </Flex>
            </Link>
          )}
          <div className="flex-shrink-0 position-relative video-more-option">
            {children}
          </div>
        </Flex>
        <ProgressBar now={progress}/>
      </div>
    </div>
  )
}
