import React, { useCallback, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import { useDebounce } from 'use-debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { Image, ProgressBar, Badge, Button } from 'react-bootstrap';

const icArrowDown = require('../../../images/video-more-options/ic-arrow-down.svg');
const icArrowUp = require('../../../images/video-more-options/ic-arrow-up.svg');

export const ReactPlayerWrapper = ({
  videoUrl,
  isPlaying,
  handleToggleIsPlaying,
  onProgress,
  progress,
  videoThumbnail,
  userName,
  description,
  profilePic,
  children,
  onDuration,
  onEnded,
  getNextVideo,
  getPrevVideo,
}) => {
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);
  const ts = useRef(0);
  const prevRef = useRef(getPrevVideo);
  prevRef.current = getPrevVideo;
  const nextRef = useRef(getNextVideo);
  nextRef.current = getNextVideo;

  useEffect(() => {
    const touchStart = (e) => {
      ts.current = e.changedTouches[0].clientY;
    };
    const touchEnd = (e) => {
      const te = e.changedTouches[0].clientY;
      if (ts.current > te + 5) {
        nextRef?.current?.();
      } else if (ts.current < te - 5) {
        prevRef?.current?.();
      }
    };
    window.addEventListener('touchstart', touchStart);
    window.addEventListener('touchend', touchEnd);
    return () => {
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchend', touchEnd);
    };
  }, []);

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
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
        progressInterval={500}
      />
      <FontAwesomeIcon
        icon={isPlaying ? faPause : faPlay}
        style={{
          display: isPlayingDebounced ? 'none' : 'block',
        }}
        className='btn-play'
      />
      {Boolean(getNextVideo) && Boolean(getPrevVideo) ? (
        <div className='btn-arrow-controler d-none d-md-flex flex-column align-items-center justify-content-center'>
          <button className='btn-arrow'>
            <Image
              src={icArrowUp}
              width='24'
              height='24'
              alt='Arrow Up'
              title='Arrow Up'
              onClick={getPrevVideo}
            />
          </button>
          <button className='btn-arrow'>
            <Image
              src={icArrowDown}
              width='24'
              height='24'
              alt='Arrow Down'
              title='Arrow Down'
              onClick={getNextVideo}
            />
          </button>
        </div>
      ) : null}
      <div className='video-footer bg-gradient-180'>
        <div className='d-flex align-items-end justify-content-between'>
          <div className='d-flex flex-column'>
            <Badge pill bg='dark' className='mb-2'>
              @pusateri added
            </Badge>
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
                <Button variant='outline-light' className='me-3'>
                  Watch
                </Button>
              </h5>
            </div>
            <p className='mb-0'>{description}</p>
          </div>
          <div className='flex-shrink-0 position-relative video-more-option'>
            {children}
          </div>
        </div>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
