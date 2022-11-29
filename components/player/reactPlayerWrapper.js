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
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

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
  autoplay = false,
  autoJumpToNextVideo = false,
  watchRoundTable,
  setWatchRoundtable,
  onClose,
}) => {
  console.log("videos", videos);
  console.log("videoUrl", videoUrl);
  console.log("userId", userId);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);
  const handleToggleIsPlaying = useCallback(() => {
    setIsPlaying((old) => !old);
  }, [setIsPlaying]);
  const [flip, setFlip] = useState("left");

  const touchStartYRef = useRef(0);
  const getprevVideoRef = useRef(getPrevVideo);
  getprevVideoRef.current = getPrevVideo;
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
        getprevVideoRef?.current?.();
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
        getNextVideoRef?.current?.();
      }
    },
    [autoJumpToNextVideo]
  );

  TimeAgo.addDefaultLocale(en);
  const timeAgo = new TimeAgo("en-US");
  const ago = timeAgo.format(Number(videos[currentVideoIndex].conversation_at));
  console.log("ago", ago);

  return (
    <div
      className='video-container'
      style={{
        pointerEvents: watchRoundTable || !roundTableMode ? "all" : "none",
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
      <Flex
        w='full'
        position='absolute'
        top='0'
        p={4}
        direction='column'
        background='whiteAlpha.500'
        gap={2}
      >
        <Flex
          w='full'
          justifyContent='space-between'
          alignItems='center'
          h={10}
        >
          <Text fontWeight='bold' fontSize={17}>
            {ago}
          </Text>
          <Link href={"roundtableURL"}>
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
                fontSize={17}
              >
                {roundTableName}
              </Text>
              <Image
                src={earth.src}
                width={6}
                height={6}
                alt='Arrow Down'
                title='Arrow Down'
                onClick={getNextVideo}
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
            videos.map((video, index) => {
              return (
                <Box h={1} w='full' borderRadius={10} background='white'>
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
                </Box>
              );
            })}
        </Flex>
        <Flex w='full' justifyContent='space-between' alignItems='center'>
          <Text fontWeight={600} fontSize={17}>
            {videos[currentVideoIndex].meta_data.duration}
          </Text>
          {flip === "left" ? (
            <Image
              src={icFlipRight.src}
              width={6}
              height={6}
              alt='Flip Right'
              title='Flip Right'
              onClick={() => setFlip("right")}
            />
          ) : (
            <Image
              src={icFlipLeft.src}
              width={6}
              height={6}
              alt='Flip Left'
              title='Flip Left'
              onClick={() => setFlip("left")}
            />
          )}
        </Flex>
      </Flex>

      {/* don't show it if it's watchRoundTable  */}
      {(watchRoundTable || !roundTableMode) && (
        <FontAwesomeIcon
          icon={isPlaying ? faPause : faPlay}
          style={{
            display: isPlayingDebounced ? "none" : "block",
            pointerEvents: "none",
          }}
          className='btn-play'
        />
      )}
      {Boolean(getNextVideo) && Boolean(getPrevVideo) && !roundTableMode ? (
        <div className='btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center'>
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
        </div>
      ) : null}
      <div
        className='video-footer bg-gradient-180'
        style={{ pointerEvents: "none" }}
      >
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
                  pointerEvents='all'
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
                    <>
                      {roundTableName}
                      <Button
                        variant='outline-light'
                        className='ms-3'
                        style={{ pointerEvents: "all" }}
                        onClick={() => setWatchRoundtable(true)}
                      >
                        Watch
                      </Button>
                    </>
                  ) : (
                    userName
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
              pointerEvents='all'
            >
              <Flex alignItems='center' gap={2} pointerEvents='all'>
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
          <div
            className='flex-shrink-0 position-relative video-more-option'
            style={{ pointerEvents: "all" }}
          >
            {children}
          </div>
        </Flex>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
