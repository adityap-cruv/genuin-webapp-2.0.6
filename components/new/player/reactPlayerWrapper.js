import React from 'react';
import ReactPlayer from 'react-player/lazy';
import { useDebounce } from 'use-debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { Image, ProgressBar } from 'react-bootstrap';

const linkIcon = require('../../../images/video-more-options/ic-link.svg');
const profileIcon = require('../../../images/img-profile-demo.jpg');
const bookmark = require('../../../images/video-more-options/ic-bookmark.svg');
const share = require('../../../images/video-more-options/ic-share.svg');
const replay = require('../../../images/video-more-options/ic-replay.svg');

export const ReactPlayerWrapper = ({
  videoUrl,
  handleToggleIsPlaying,
  onProgress,
  onDuration,
  onEnded,
  progress,
  isPlaying,
  videoThumbnail,
  description,
  userName,
}) => {
  const [isPlayingDebounced] = useDebounce(isPlaying, 65);
  return (
    <div className='video-container'>
      <ReactPlayer
        key={videoUrl}
        url={[videoUrl]}
        playing={isPlaying}
        controls={false}
        playsinline={true}
        // light={videoThumbnail}
        config={{
          file: {
            attributes: { poster: videoThumbnail },
          },
        }}
        onClick={handleToggleIsPlaying}
        className='video-wrapper'
        width='auto'
        height='100%'
        // fluid
        // aspectRatio='9:16'
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
      <div className='video-footer bg-gradient-180'>
        <div className='d-flex align-items-end justify-content-between'>
          <div className='d-flex flex-column'>
            <div className='video-auther mb-2'>
              <Image
                src={profileIcon}
                width='36'
                height='36'
                alt='@pusateri'
                title='@pusateri'
                className='img-auther-pic'
              />
              <h5 className='mb-0'>{userName}</h5>
            </div>
            <p className='mb-0'>{description}</p>
          </div>
          <div className='flex-shrink-0 position-relative video-more-option'>
            <ul>
              <li>
                <Image
                  src={linkIcon}
                  width='24'
                  height='24'
                  alt='Link'
                  title='Link'
                />
              </li>
              <li>
                <Image
                  src={bookmark}
                  width='24'
                  height='24'
                  alt='Bookmark'
                  title='Bookmark'
                />
              </li>
              <li>
                <Image
                  src={share}
                  width='24'
                  height='24'
                  alt='Share'
                  title='Share'
                />
              </li>
              <li>
                <Image
                  src={replay}
                  width='24'
                  height='24'
                  alt='Replay'
                  title='Replay'
                />
              </li>
            </ul>
          </div>
        </div>
        <ProgressBar now={progress} />
      </div>
    </div>
  );
};
