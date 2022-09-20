import { useState, useMemo, useEffect } from 'react';
import { ReactPlayerWrapper } from './reactPlayerWrapper';
import { increaseVideoViewCount } from '../../actions/postActions';

export const Player = ({
  video_id_to_use,
  description,
  videoUrl = '',
  videoThumbnail,
  userName,
  userProfileImage = '',
  getNextVideo,
  getPrevVideo,
  roundTableMode,
  children,
  autoplay,
  autoJumpToNextVideo,
  onEnded,
  showGetAppModal,
  roundTableName,
}) => {
  const [triggerPlayCount, setTriggetPlayCount] = useState(false);

  const shortDescription = useMemo(() => {
    if (description?.length > 50) {
      return `${description.slice(0, 50)}...`;
    }
    return description;
  }, [description]);

  const profilePic = useMemo(() => {
    if (Boolean(userProfileImage)) {
      return isValidHttpUrl(userProfileImage)
        ? userProfileImage
        : `https://media.qa.begenuin.com/backend_assets/lottie/${userProfileImage}.png`;
    }
    return 'https://media.qa.begenuin.com/backend_assets/lottie/snowman.png';
  }, [userProfileImage]);

  const handleProgress = (event) => {
    const playedProgress = Math.round(Number.parseFloat(event.played) * 100);
    if (playedProgress > 10 && !triggerPlayCount) {
      setTriggetPlayCount(true);
    }
  };

  useEffect(() => {
    if (triggerPlayCount) {
      increaseVideoViewCount(video_id_to_use);
    }
  }, [video_id_to_use, triggerPlayCount]);

  return (
    <>
      <div className='overlay' />
      <div
        className='main d-flex align-items-center justify-content-center'
        style={{
          backgroundImage: `url(${videoThumbnail})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <ReactPlayerWrapper
          videoUrl={videoUrl}
          onProgress={handleProgress}
          videoThumbnail={videoThumbnail}
          userName={userName}
          description={shortDescription}
          profilePic={profilePic}
          getNextVideo={getNextVideo}
          getPrevVideo={getPrevVideo}
          roundTableMode={roundTableMode}
          autoplay={autoplay}
          autoJumpToNextVideo={autoJumpToNextVideo}
          onEnded={onEnded}
          showGetAppModal={showGetAppModal}
          roundTableName={roundTableName}
        >
          {children}
        </ReactPlayerWrapper>
      </div>
    </>
  );
};

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
