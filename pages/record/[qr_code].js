import React, { useState } from 'react';
import axios from 'axios';
import Error from 'next/error';
import { Image } from 'react-bootstrap';
import { Player } from '../../components/new/player';
import { Layout } from '../../components/new/layout';
import { TopNav } from '../../components/new/topNav';
import { GetAppModal } from '../../components/new/getAppModal';
import { WelcomeModal } from '../../components/new/welcomeModal';

const linkIcon = require('../../images/video-more-options/ic-link.svg');
const bookmark = require('../../images/video-more-options/ic-bookmark.svg');
const share = require('../../images/video-more-options/ic-share.svg');
const replay = require('../../images/video-more-options/ic-replay.svg');
const comments = require('../../images/video-more-options/ic-comments.svg');
const subsribePlus = require('../../images/video-more-options/ic-subsribe-plus.svg');

const Record = (props) => {
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const totalVideos = props?.data?.videos?.length ?? 0;

  const getNextVideo = () => {
    if (currentVideoIndex < totalVideos - 1) {
      setCurrentVideoIndex((old) => old + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };
  const getPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex((old) => old - 1);
    } else {
      setCurrentVideoIndex(totalVideos - 1);
    }
  };
  return !Boolean(props.data.user_id) ? (
    <Error statusCode='404' />
  ) : (
    <Layout>
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        userName={
          Boolean(props.data.name) ? props.data.name : props.data.nickname
        }
        userProfileImage={props.data.profile_image}
        videoThumbnail={props.data.videos[currentVideoIndex]?.videoThumbnail}
        videoPreviewImage={
          props.data.videos[currentVideoIndex]?.videoPreviewImage
        }
        description={props.data.videos[currentVideoIndex]?.description}
        link={props.data.videos[currentVideoIndex]?.link}
        videoUrl={props.data.videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
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
Record.getInitialProps = async ({ query: { qr_code } }) => {
  return new Promise(function (resolve, reject) {
    var url_to_use = `${process.env.apiurl}/api/v3/qr/web?qr_code=${qr_code}`;

    axios
      .get(url_to_use)
      .then((response) => {
        if (
          response.data.data.owner.nickname !== undefined &&
          response.data.data.owner.nickname !== null &&
          response.data.data.owner.nickname !== ''
        ) {
          var url_to_use2 = `${process.env.apiurl}/api/v3/p/web?username=${response.data.data.owner.nickname}&start=0&rows=10`;
          axios
            .get(url_to_use2)
            .then((response2) => {
              var final_response = response2.data.data;
              final_response['is_record'] = true;
              final_response['owner'] = response.data.data.owner;
              resolve({ data: final_response });
            })
            .catch((err) => {
              resolve({ data: {} });
            });
        } else {
          resolve({ data: {} });
        }
      })
      .catch((err) => {
        resolve({ data: {} });
      });
  });
};
export default Record;

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
