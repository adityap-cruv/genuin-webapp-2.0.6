import React, { useState } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import Error from 'next/error';
import { Player } from '../components/new/player';
import { Layout } from '../components/new/layout';
import { TopNav } from '../components/new/topNav';
import { GetAppModal } from '../components/new/getAppModal';
import { WelcomeModal } from '../components/new/welcomeModal';

const linkIcon = require('../images/video-more-options/ic-link.svg');
const bookmark = require('../images/video-more-options/ic-bookmark.svg');
const share = require('../images/video-more-options/ic-share.svg');
const replay = require('../images/video-more-options/ic-replay.svg');
const comments = require('../images/video-more-options/ic-comments.svg');
const subsribePlus = require('../images/video-more-options/ic-subsribe-plus.svg');

const ShortUrlPage = (props) => {
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
        {...props.data}
        {...props.url}
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
ShortUrlPage.getInitialProps = async ({ query: { video_id } }) => {
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
export default ShortUrlPage;

const ShareControls = ({ showGetAppModal }) => (
  <ul>
    <li>
      <Image
        src={linkIcon}
        width='24'
        height='24'
        alt='Link'
        title='Link'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={bookmark}
        width='24'
        height='24'
        alt='Bookmark'
        title='Bookmark'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={share}
        width='24'
        height='24'
        alt='Share'
        title='Share'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={replay}
        width='24'
        height='24'
        alt='Replay'
        title='Replay'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={comments}
        width='24'
        height='24'
        alt='Comments'
        title='Comments'
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={subsribePlus}
        width='24'
        height='24'
        alt='Subsribe Plus'
        title='Subsribe Plus'
        onClick={showGetAppModal}
      />
    </li>
  </ul>
);
