import React, { useState } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import Error from 'next/error';
import { Player } from '../components/player';
import { Layout } from '../components/layout';
import { TopNav } from '../components/topNav';
import { GetAppModal } from '../components/getAppModal';
import { WelcomeModal } from '../components/welcomeModal';

import linkIcon from '../images/video-more-options/ic-link.svg';
import bookmark from '../images/video-more-options/ic-bookmark.svg';
import share from '../images/video-more-options/ic-share.svg';
import replay from '../images/video-more-options/ic-replay.svg';
import comments from '../images/video-more-options/ic-comments.svg';
import subsribePlus from '../images/video-more-options/ic-subsribe-plus.svg';

const Video = (props) => {
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);

  return !Boolean(props.data.videoUrl) ? (
    <Error statusCode='404' />
  ) : (
    <Layout>
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        video_id_to_use={props.data.video_id_to_use}
        description={props.data.description}
        videoUrl={props.data.videoUrl}
        asPath={props.data.asPath}
        link={props.data.link}
        videoThumbnail={props.data.videoThumbnail}
        videoPreviewImage={props.data.videoPreviewImage}
        userName={props.data.userName}
        userProfileImage={props.data.userProfileImage}
        showGetAppModal={handleShowModalAppDownload}
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
      return Promise.resolve({ data: resObj });
    })
    .catch((err) => {
      return Promise.resolve({ data: {} });
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
    <li>
      <Image
        src={comments.src}
        width='24'
        height='24'
        alt='Comments'
        title='Comments'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={subsribePlus.src}
        width='24'
        height='24'
        alt='Subsribe Plus'
        title='Subsribe Plus'
        onClick={showGetAppModal}
      />
    </li>
  </ul>
);
