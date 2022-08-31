import { useState } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import Error from 'next/error';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { WelcomeModal } from '../../components/welcomeModal';

import linkIcon from '../../images/video-more-options/ic-link.svg';
import bookmark from '../../images/video-more-options/ic-bookmark.svg';
import share from '../../images/video-more-options/ic-share.svg';
import replay from '../../images/video-more-options/ic-replay.svg';
import comments from '../../images/video-more-options/ic-comments.svg';
import subsribePlus from '../../images/video-more-options/ic-subsribe-plus.svg';

const RoundTable = (props) => {
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

  return !Boolean(props?.data?.group?.group_id) ? (
    <Error statusCode='404' />
  ) : (
    <Layout>
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        key={currentVideoIndex}
        video_id_to_use={props.data.video_id_to_use}
        description={props.data.group.group_description}
        videoUrl={props.data.chats?.[currentVideoIndex]?.video_url}
        asPath={props.data.asPath}
        link={props.data.link}
        videoThumbnail={props.data.chats?.[currentVideoIndex]?.thumbnail_url}
        videoPreviewImage={props.data.chats?.[currentVideoIndex]?.thumbnail_url}
        userName={props.data.group.group_name}
        userProfileImage={props.data.userProfileImage}
        roundTableMode
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
RoundTable.getInitialProps = async ({ query: { share_string, v } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/rt/web?chat_id=${share_string}`;
    if (v !== undefined && v !== null) {
      url_to_use = `${url_to_use}&video_id=${v}`;
    }
    return axios
      .get(url_to_use)
      .then((response) => {
        console.log(response.data);
        return Promise.resolve({ data: response.data.data });
      })
      .catch((err) => {
        return Promise.resolve({ data: {} });
      });
  } else {
    return Promise.resolve({ data: {} });
  }
};
export default RoundTable;

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
  </ul>
);
