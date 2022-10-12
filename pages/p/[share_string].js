import { useState, useRef } from 'react';
import axios from 'axios';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { AppActions } from '../../components/appActions';
import { WelcomeModal } from '../../components/welcomeModal';
import { Error } from '../../components/error';
import { SEO } from '../../components/seo';
import { appStoreLink } from '../../config';

const Profile = ({
  user_id,
  preview_image,
  nickname,
  profile_image,
  videos = [],
}) => {
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null;
    setShowModalAppDownload(false);
  };
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message;
    setShowModalAppDownload(true);
  };

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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoPreviewImage={preview_image}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        description={videos[currentVideoIndex]?.description}
      />
      <TopNav showGetAppModal={showGetAppToViewDialog} />
      <Player
        key={currentVideoIndex}
        userName={`@${nickname}`}
        userProfileImage={profile_image}
        videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
        description={videos[currentVideoIndex]?.description}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
        onEnded={showGetAppToViewDialog}
      >
        <AppActions
          showGetAppModal={handleShowModalAppDownload}
          userName={`@${nickname}`}
          videoUrl={globalThis?.location?.href}
          videoDescription={videos[currentVideoIndex]?.description}
          videoTitle='Genuin'
        />
      </Player>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
        getAppLink={appStoreLink}
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
