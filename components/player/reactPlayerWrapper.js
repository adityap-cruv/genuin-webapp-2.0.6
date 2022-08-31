import { useCallback, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { useDebounce } from 'use-debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { Image, ProgressBar, Badge, Button } from 'react-bootstrap';

import icArrowDown from '../../images/video-more-options/ic-arrow-down.svg';
import icArrowUp from '../../images/video-more-options/ic-arrow-up.svg';

export const ReactPlayerWrapper = ({
  videoUrl,
  onProgress,
  videoThumbnail,
  userName,
  description,
  profilePic,
  children,
  onDuration,
  onEnded,
  getNextVideo,
  getPrevVideo,
  roundTableMode = false,
  autoplay = false,
  autoJumpToNextVideo = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);
  const handleToggleIsPlaying = useCallback(() => {
    setIsPlaying((old) => !old);
  }, [setIsPlaying]);

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
    window.addEventListener('touchstart', touchStart);
    window.addEventListener('touchend', touchEnd);
    return () => {
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchend', touchEnd);
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

  return (
    <div className='video-container'>
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
      <FontAwesomeIcon
        icon={isPlaying ? faPause : faPlay}
        style={{
          display: isPlayingDebounced ? 'none' : 'block',
          pointerEvents: 'none',
        }}
        className='btn-play'
      />
      {Boolean(getNextVideo) && Boolean(getPrevVideo) ? (
        <div className='btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center'>
          <button className='btn-arrow'>
            <Image
              src={icArrowUp.src}
              width='24'
              height='24'
              alt='Arrow Up'
              title='Arrow Up'
              onClick={getPrevVideo}
            />
          </button>
          <button className='btn-arrow'>
            <Image
              src={icArrowDown.src}
              width='24'
              height='24'
              alt='Arrow Down'
              title='Arrow Down'
              onClick={getNextVideo}
            />
          </button>
        </div>
      ) : null}
      <div
        className='video-footer bg-gradient-180'
        style={{ pointerEvents: 'none' }}
      >
        <div className='d-flex align-items-end justify-content-between'>
          <div className='d-flex flex-column'>
            {Boolean(roundTableMode) && (
              <Badge pill bg='dark' className='mb-2 align-self-start'>
                @pusateri added
              </Badge>
            )}
            <div className='video-auther mb-2'>
              <Image
                src={profilePic}
                width='36'
                height='36'
                alt='@pusateri'
                title='@pusateri'
                className='img-auther-pic'
              />
              <h5 className='mb-0'>
                {userName}
                {Boolean(roundTableMode) && (
                  <Button
                    variant='outline-light'
                    className='me-3'
                    style={{ pointerEvents: 'all' }}
                  >
                    Watch
                  </Button>
                )}
              </h5>
            </div>
            <p className='mb-0'>{description}</p>
          </div>
          <div
            className='flex-shrink-0 position-relative video-more-option'
            style={{ pointerEvents: 'all' }}
          >
            {children}
          </div>
        </div>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
