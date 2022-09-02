import { useState } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import { Error } from '../../components/error';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { WelcomeModal } from '../../components/welcomeModal';
import { SEO } from '../../components/seo';
import linkIcon from '../../images/video-more-options/ic-link.svg';
import share from '../../images/video-more-options/ic-share.svg';
import comments from '../../images/video-more-options/ic-comments.svg';
import subsribePlus from '../../images/video-more-options/ic-subsribe-plus.svg';

const RoundTable = ({ group, preview_image, chats = [] }) => {
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // uncomment when there are multiple vides passed in chats
  // const totalVideos = videos?.length ?? 0;
  // const getNextVideo = () => {
  //   if (currentVideoIndex < totalVideos - 1) {
  //     setCurrentVideoIndex((old) => old + 1);
  //   } else {
  //     setCurrentVideoIndex(0);
  //   }
  // };
  // const getPrevVideo = () => {
  //   if (currentVideoIndex > 0) {
  //     setCurrentVideoIndex((old) => old - 1);
  //   } else {
  //     setCurrentVideoIndex(totalVideos - 1);
  //   }
  // };

  return !Boolean(group?.group_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoPreviewImage={preview_image}
        videoUrl={chats?.[currentVideoIndex]?.video_url}
        description={group.group_description}
      />
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        key={currentVideoIndex}
        video_id_to_use={chats?.[currentVideoIndex]?.conversation_id}
        description={group?.group_description}
        videoUrl={chats?.[currentVideoIndex]?.video_url}
        videoThumbnail={chats?.[currentVideoIndex]?.thumbnail_url}
        userName={chats?.[currentVideoIndex]?.owner?.name}
        userProfileImage={chats?.[currentVideoIndex]?.owner?.profile_image}
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
    console.log(url_to_use);
    if (v !== undefined && v !== null) {
      url_to_use = `${url_to_use}&video_id=${v}`;
    }
    return axios
      .get(url_to_use)
      .then((response) => {
        console.log(response?.data?.data);
        return Promise.resolve(response?.data?.data ?? {});
      })
      .catch((err) => {
        return Promise.resolve({});
      });
  } else {
    return Promise.resolve({});
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
