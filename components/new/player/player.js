import React, { useState, useMemo, useEffect } from 'react';
import Microlink from '@microlink/react';
import { Layout } from './layout';
import { TopNav } from './topNav';
import { ReactPlayerWrapper } from './reactPlayerWrapper';
import { increaseVideoViewCount } from '../../../actions/postActions';

export const Player = ({
  video_id_to_use,
  description,
  videoUrl,
  asPath,
  link,
  videoThumbnail,
  videoPreviewImage,
  userName,
  installUrl,
}) => {
  const [progress, setProgress] = useState(0);
  const [triggerPlayCount, setTriggetPlayCount] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  if (typeof window === 'undefined') {
    global.window = {};
  }
  const urlToCopy = useMemo(
    () => process.env.hostname + '/' + video_id_to_use,
    [video_id_to_use]
  );
  const hashtags = useMemo(
    () => description.match(/#\w+/g) || [],
    [description]
  );
  const baseUrl = useMemo(() => process.env.hostname + asPath, [asPath]);

  const metaLink = useMemo(
    () => (link.indexOf('://') === -1 ? 'http://' + link : link),
    [link]
  );

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

  return !Boolean(videoUrl) ? (
    <Error statusCode='404' />
  ) : (
    <>
      <Layout
        title='Genuin'
        videoUrl={videoUrl}
        metaImageWidth={metaImageWidth}
        metaImageHeight={metaImageHeight}
        metaImage={videoPreviewImage}
        content={videoThumbnail}
        description={description}
        currentUrl={urlToCopy}
        keyword='genuine'
      >
        <TopNav />
        <ReactPlayerWrapper
          videoUrl={videoUrl}
          isPlaying={isPlaying}
          handleToggleIsPlaying={handleToggleIsPlaying}
          onProgress={handleProgress}
          progress={progress}
          videoThumbnail={videoThumbnail}
          userName={userName}
        />
      </Layout>
    </>
  );
};
