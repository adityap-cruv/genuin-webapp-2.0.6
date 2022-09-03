import { useState, useMemo } from 'react';
import axios from 'axios';
import { Image } from 'react-bootstrap';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { WelcomeModal } from '../../components/welcomeModal';
import { Error } from '../../components/error';
import { SEO } from '../../components/seo';
import linkIcon from '../../images/video-more-options/ic-link.svg';
import share from '../../images/video-more-options/ic-share.svg';
import comments from '../../images/video-more-options/ic-comments.svg';
import subsribePlus from '../../images/video-more-options/ic-subsribe-plus.svg';

const Profile = ({
  user_id,
  preview_image,
  name,
  profile_image,
  videos = [],
}) => {
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);
  const handleShowModalAppDownload = () => setShowModalAppDownload(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const totalVideos = videos?.length ?? 0;

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

  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoPreviewImage={preview_image}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        description={videos[currentVideoIndex]?.description}
      />
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        key={currentVideoIndex}
        userName={name}
        userProfileImage={profile_image}
        videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
        description={videos[currentVideoIndex]?.description}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
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
Profile.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}&start=0&rows=10`;
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve(response?.data?.data ?? {});
      })
      .catch((err) => {
        return Promise.resolve({});
      });
  } else {
    return Promise.resolve({});
  }
};
export default Profile;

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
