import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";
import { useDebounce } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { ProgressBar, Badge, Button } from "react-bootstrap";

import icArrowDown from "../../images/video-more-options/ic-arrow-down.svg";
import icArrowUp from "../../images/video-more-options/ic-arrow-up.svg";
import icArrowLeft from "../../images/video-more-options/ic-arrow-left.svg";
import icArrowRight from "../../images/video-more-options/ic-arrow-right.svg";
import icFlipLeft from "../../images/video-more-options/ic-flip-left.svg";
import icFlipRight from "../../images/video-more-options/ic-flip-right.svg";
import icClose from "../../images/video-more-options/ic-close.svg";
import earth from "../../images/video-more-options/ic-earth.svg";
import { Image, Flex, Text, Link, Box } from "@chakra-ui/react";
import ReactTimeAgo from "react-time-ago";

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
  children,
  onDuration,
  onEnded,
  getNextVideo,
  getPrevVideo,
  roundTableMode = false,
  roundTableName = "",
  roundTableId,
  autoplay = true,
  autoJumpToNextVideo = false,
  watchRoundTable,
  setWatchRoundtable,
  onClose,
  direction,
  setDirection,
  verticalNavigation,
  shareUrl,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);

  const handleToggleIsPlaying = useCallback(() => {
    setIsPlaying((old) => !old);
  }, [setIsPlaying]);

  const touchStartYRef = useRef(0);
  const getPrevVideoRef = useRef(getPrevVideo);
  getPrevVideoRef.current = getPrevVideo;
  const getNextVideoRef = useRef(getNextVideo);
  getNextVideoRef.current = getNextVideo;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const setProgressWrapper = useCallback(
    (event) => {
      const playedProgress = Math.round(Number.parseFloat(event.played) * 100);
      setProgress(playedProgress);
      onProgressRef?.current?.(event);
    },
    [setProgress]
  );

  useEffect(() => {
    const touchStart = (e) => {
      touchStartYRef.current = e.changedTouches[0].clientY;
    };
    const touchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchStartYRef.current > touchEndY + 5) {
        getNextVideoRef?.current?.();
      } else if (touchStartYRef.current < touchEndY - 5) {
        getPrevVideoRef?.current?.();
      }
    };
    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchend", touchEnd);
    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
    };
  }, []);

  const onEndedWrapper = useCallback(
    (e) => {
      onEndedRef?.current?.(e);
      if (autoJumpToNextVideo) {
        if (direction === "forward") getNextVideoRef?.current?.();
        if (direction === "backward") getPrevVideoRef?.current?.();
      }
    },
    [autoJumpToNextVideo, direction]
  );

  return (
    <div
      className='video-container'
      style={{
        color: "white",
      }}
    >
      <ReactPlayer
        key={videoUrl}
        url={[videoUrl]}
        playing={isPlaying}
        controls={false}
        playsinline={true}
        config={{
          file: {
            attributes: { poster: videoThumbnail },
          },
        }}
        onClick={handleToggleIsPlaying}
        className='video-wrapper'
        width='auto'
        height='100%'
        onProgress={setProgressWrapper}
        onDuration={onDuration}
        onEnded={onEndedWrapper}
        progressInterval={200}
      />

      {/* roundtable header */}
      {watchRoundTable && (
        <Flex
          w='full'
          position='absolute'
          top='0'
          p={4}
          direction='column'
          gap={2}
        >
          <Flex
            w='full'
            justifyContent='space-between'
            alignItems='center'
            h={10}
          >
            <Text fontWeight='bold' fontSize={17}>
              <ReactTimeAgo
                timeStyle='mini'
                date={Number(videos[currentVideoIndex].conversation_at)}
                locale='en-US'
              />
            </Text>
            <Link href={roundTableId}>
              <Flex
                alignItems='center'
                gap={3}
                margin='0'
                position='absolute'
                left='50%'
                transform='translate(-50%, -50%)'
              >
                <Text
                  background='rgba(17, 17, 17, 0.6)'
                  borderRadius='5px'
                  p={2}
                  fontWeight='bold'
                  fontSize={{ base: 14, sm: 17 }}
                >
                  {roundTableName}
                </Text>
                <Image
                  src={earth.src}
                  width={{ base: 5, sm: 6 }}
                  height={{ base: 5, sm: 6 }}
                  alt='Roundtable'
                  title='Roundtable'
                />
              </Flex>
            </Link>
            <Image
              src={icClose.src}
              width={6}
              height={6}
              alt='Close'
              title='Close'
              onClick={onClose}
            />
          </Flex>
          <Flex w='full' gap={1}>
            {/* {JSON.stringify(videos)} */}
            {Boolean(videos.length) &&
              videos.map((_, index) => {
                return (
                  <Box h={1} w='full' borderRadius={10} background='white'>
                    {direction === "forward" && (
                      <Box
                        backgroundColor='#0645FF'
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
                    {direction === "backward" && (
                      <Box
                        backgroundColor='#0645FF'
                        borderRadius={10}
                        h={1}
                        float='right'
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
                );
              })}
          </Flex>
          <Flex w='full' justifyContent='space-between' alignItems='center'>
            <Text fontWeight={600} fontSize={17}>
              {videos[currentVideoIndex].meta_data.duration} sec
            </Text>
            {direction === "forward" ? (
              <Image
                src={icFlipRight.src}
                width={6}
                height={6}
                alt='Flip Right'
                title='Flip Right'
                onClick={() => setDirection("backward")}
              />
            ) : (
              <Image
                src={icFlipLeft.src}
                width={6}
                height={6}
                alt='Flip Left'
                title='Flip Left'
                onClick={() => setDirection("forward")}
              />
            )}
          </Flex>
        </Flex>
      )}

      {/* x button */}
      {!watchRoundTable && (
        <Flex
          w='full'
          position='absolute'
          top='0'
          p={4}
          direction='column'
          gap={2}
        >
          <Flex
            w='full'
            justifyContent='space-between'
            alignItems='center'
            h={10}
          >
            <Box />
            <Image
              src={icClose.src}
              width={6}
              height={6}
              alt='Close'
              title='Close'
              onClick={onClose}
            />
          </Flex>
        </Flex>
      )}

      {/* don't show it if it's watchRoundTable  */}
      {(watchRoundTable || !roundTableMode || verticalNavigation) && (
        <FontAwesomeIcon
          icon={isPlaying ? faPause : faPlay}
          style={{
            display: isPlayingDebounced ? "none" : "block",
          }}
          className='btn-play'
        />
      )}
      {Boolean(getNextVideo) &&
      Boolean(getPrevVideo) &&
      (!roundTableMode || verticalNavigation) ? (
        <div className='btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center'>
          {currentVideoIndex !== 0 && (
            <button className='btn-arrow'>
              <Image
                src={icArrowUp.src}
                width={6}
                height={6}
                alt='Arrow Up'
                title='Arrow Up'
                onClick={getPrevVideo}
              />
            </button>
          )}
          {currentVideoIndex === 0 && <Box h={12} />}
          {currentVideoIndex !== videos.length - 1 && (
            <button className='btn-arrow'>
              <Image
                src={icArrowDown.src}
                width={6}
                height={6}
                alt='Arrow Down'
                title='Arrow Down'
                onClick={getNextVideo}
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
            className='btn-arrow'
            style={{
              position: "absolute",
              top: "50%",
              right: -60,
            }}
          >
            <Image
              src={icArrowRight.src}
              width={6}
              height={6}
              alt='Arrow Right'
              title='Arrow Right'
              onClick={getNextVideo}
            />
          </Button>
        )}
      {Boolean(getNextVideo) &&
        Boolean(getPrevVideo) &&
        roundTableMode &&
        watchRoundTable && (
          <Button
            className='btn-arrow'
            style={{
              position: "absolute",
              top: "50%",
              left: -60,
            }}
          >
            <Image
              src={icArrowLeft.src}
              width={6}
              height={6}
              alt='Arrow Left'
              title='Arrow Left'
              onClick={getPrevVideo}
            />
          </Button>
        )}
      <div className='video-footer bg-gradient-180'>
        <Flex alignItems='end' justifyContent='space-between' mb={3}>
          {/* this should not show if it's rountableMode && watchRoundTable  */}
          {(!watchRoundTable || !roundTableMode) && (
            <Flex direction='column'>
              {Boolean(roundTableMode) && (
                <Link
                  key={userId}
                  href={`/p/${userId}`}
                  _hover={{
                    textDecoration: "none",
                  }}
                >
                  <Badge pill bg='dark' className='mb-2 align-self-start'>
                    @{userName} added
                  </Badge>
                </Link>
              )}
              <div className='video-auther mb-2'>
                <Image
                  src={profilePic}
                  width={9}
                  height={9}
                  alt={userName}
                  title={userName}
                  className='img-auther-pic'
                />
                <h5 className='mb-0'>
                  {Boolean(roundTableMode) ? (
                    <Flex alignItems='center'>
                      <Link href={`/rt/${roundTableId}`}>{roundTableName}</Link>
                      <Button
                        variant='outline-light'
                        className='ms-3'
                        onClick={() => {
                          if (verticalNavigation && shareUrl) {
                            window.location.href = shareUrl;
                          } else {
                            setWatchRoundtable(true);
                            setIsPlaying(true);
                          }
                        }}
                      >
                        Watch
                      </Button>
                    </Flex>
                  ) : (
                    <Link href={`/p/${userId}`}>@{userName}</Link>
                  )}
                </h5>
              </div>
              <p className='mb-0'>{description}</p>
            </Flex>
          )}
          {watchRoundTable && roundTableMode && (
            <Link
              href={`/p/${userId}`}
              _hover={{
                textDecoration: "none",
              }}
            >
              <Flex alignItems='center' gap={2}>
                <Image
                  src={profilePic}
                  width={9}
                  height={9}
                  alt={userName}
                  title={userName}
                  className='img-auther-pic'
                />
                <Text>{userName}</Text>
              </Flex>
            </Link>
          )}
          <div className='flex-shrink-0 position-relative video-more-option'>
            {children}
          </div>
        </Flex>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
