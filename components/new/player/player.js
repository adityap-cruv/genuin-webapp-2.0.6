import React, { useState, useMemo } from 'react';
import Microlink from '@microlink/react';
import { Layout } from './layout';
import { TopNav } from './topNav';
import { ReactPlayerWrapper } from './reactPlayerWrapper';

export const Player = ({
  video_id_to_use,
  description,
  videoUrl,
  asPath,
  link,
  videoThumbnail,
  videoPreviewImage,
  userName,
}) => {
  const [progress, setProgress] = useState(0);
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
  };

  const preview = (
    <Microlink
      media='logo'
      url={metaLink}
      style={{
        maxWidth: '100%',
        height: '96px',
        backgroundColor: 'lightgrey',
        borderRadius: '5px',
      }}
    />
  );

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
