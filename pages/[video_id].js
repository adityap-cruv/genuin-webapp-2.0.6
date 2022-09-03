import React, { useState } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import { Player } from '../components/player';
import { Layout } from '../components/layout';
import { TopNav } from '../components/topNav';
import { GetAppModal } from '../components/getAppModal';
import { WelcomeModal } from '../components/welcomeModal';
import { Error } from '../components/error';
import { SEO } from '../components/seo';
import linkIcon from '../images/video-more-options/ic-link.svg';
import bookmark from '../images/video-more-options/ic-bookmark.svg';
import share from '../images/video-more-options/ic-share.svg';
import replay from '../images/video-more-options/ic-replay.svg';

const Video = (props) => {
  const {
    videoUrl,
    videoPreviewImage,
    description,
    video_id_to_use,
    videoThumbnail,
    userName,
    userProfileImage,
  } = props;
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);

  return !Boolean(videoUrl) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoUrl={videoUrl}
        videoPreviewImage={videoPreviewImage}
        description={description}
        urlToCopy={process?.env?.hostname + '/' + video_id_to_use}
      />
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        key={video_id_to_use ?? `${Math.random()}`}
        video_id_to_use={video_id_to_use}
        description={description}
        videoUrl={videoUrl}
        videoThumbnail={videoThumbnail}
        userName={userName}
        userProfileImage={userProfileImage}
        showGetAppModal={handleShowModalAppDownload}
        onEnded={() => handleShowModalAppDownload()}
      >
        <ShareControls showGetAppModal={handleShowModalAppDownload} />
      </Player>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
      />
      <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
    </Layout>
  );
};
Video.getInitialProps = async ({ query: { video_id } }) => {
  return axios
    .get(process.env.apiurl + '/api/v3/users/video/meta_data/' + video_id)
    .then((response) => {
      var resObj = response.data.data;
      var video_id_to_use =
        resObj.video_uuid !== undefined && resObj.video_uuid !== null
          ? resObj.video_uuid
          : video_id;
      Object.assign(resObj, {
        video_id: video_id,
        video_id_to_use: video_id_to_use,
      });
      return Promise.resolve(resObj);
    })
    .catch((err) => {
      return Promise.resolve({});
    });
};
export default Video;

const ShareControls = ({ showGetAppModal }) => (
  <ul>
    <li>
      <Image
        src={linkIcon.src}
        width='24'
        height='24'
        alt='Link'
        title='Link'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={bookmark.src}
        width='24'
        height='24'
        alt='Bookmark'
        title='Bookmark'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={share.src}
        width='24'
        height='24'
        alt='Share'
        title='Share'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={replay.src}
        width='24'
        height='24'
        alt='Replay'
        title='Replay'
        onClick={showGetAppModal}
      />
    </li>
  </ul>
);
