import { useState, useMemo, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import NextHead from 'next/head';
import { ReactPlayerWrapper } from './reactPlayerWrapper';
import { increaseVideoViewCount } from '../../actions/postActions';

export const Player = ({
  video_id_to_use,
  description,
  videoUrl = '',
  asPath,
  link,
  videoThumbnail,
  videoPreviewImage = '',
  userName,
  userProfileImage = '',
  getNextVideo,
  getPrevVideo,
  children,
}) => {
  const [progress, setProgress] = useState(0);
  const [triggerPlayCount, setTriggetPlayCount] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const urlToCopy = useMemo(
    () => process.env.hostname + '/' + video_id_to_use,
    [video_id_to_use]
  );
  const shortDescription = useMemo(() => {
    if (description?.length > 50) {
      return `${description.slice(0, 50)}...`;
    }
    return description;
  }, [description]);

  const hashtags = useMemo(
    () => description?.match(/#\w+/g) || [],
    [description]
  );
  const baseUrl = useMemo(() => process.env.hostname + asPath, [asPath]);
  const title = 'Genuin';

  const metaLink = useMemo(
    () => (link?.indexOf('://') === -1 ? 'http://' + link : link),
    [link]
  );
  const installURL = process.env.installurl + video_id_to_use;

  const profilePic = useMemo(() => {
    if (Boolean(userProfileImage)) {
      return isValidHttpUrl(userProfileImage)
        ? userProfileImage
        : `https://media.qa.begenuin.com/backend_assets/lottie/${userProfileImage}.png`;
    }
    return 'https://media.qa.begenuin.com/backend_assets/lottie/snowman.png';
  }, [userProfileImage]);

  const handleToggleIsPlaying = () => {
    setIsPlaying((old) => !old);
  };

  const metaImageWidth = 1200;
  const metaImageHeight = 630;

  const handleProgress = (event) => {
    const playedProgress = Math.round(Number.parseFloat(event.played) * 100);
    setProgress(playedProgress);
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
      <NextHead>
        <meta property='og:video:url' content={videoUrl} />
        <meta property='og:video:secure_url' content={videoUrl} />
        <meta property='og:video:type' content='video/mp4' />
      </NextHead>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: 'website',
          url: urlToCopy,
          title: 'Genuin',
          description: description,
          videos: [
            {
              url: videoUrl,
              secure_url: videoUrl,
              type: 'video/mp4',
              width: '720',
              height: '1280',
              alt: 'Genuin',
            },
          ],
          images: [
            {
              url: videoPreviewImage,
              width: metaImageWidth,
              height: metaImageHeight,
              alt: 'Genuin',
            },
          ],
          site_name: 'Genuin',
        }}
        facebook={{
          appId: 1234567890,
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />

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
          isPlaying={isPlaying}
          handleToggleIsPlaying={handleToggleIsPlaying}
          onProgress={handleProgress}
          progress={progress}
          videoThumbnail={videoThumbnail}
          userName={userName}
          description={shortDescription}
          profilePic={profilePic}
          getNextVideo={getNextVideo}
          getPrevVideo={getPrevVideo}
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
