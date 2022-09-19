import { useState } from 'react';
import axios from 'axios';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { WelcomeModal } from '../../components/welcomeModal';
import { SEO } from '../../components/seo';
import { Error } from '../../components/error';
import { AppActions } from '../../components/appActions';
import { appStoreLink } from '../../config';

const Record = (props) => {
  const {
    videos = [],
    user_id,
    preview_image,
    name,
    nickname,
    profile_image,
  } = props;
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const handleCloseAppDownload = () => {
    setShowModalAppDownload(false);
    getAppComponentRef.current = () => null;
  };
  const handleShowModalAppDownload = (message = () => null) => {
    setShowModalAppDownload(true);
    getAppComponentRef.current = message;
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
  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        videoPreviewImage={preview_image}
        description={videos[currentVideoIndex]?.description}
      />
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        key={currentVideoIndex}
        userName={Boolean(name) ? name : nickname}
        userProfileImage={profile_image}
        videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
        description={videos[currentVideoIndex]?.description}
        link={videos[currentVideoIndex]?.link}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
        onEnded={() => handleShowModalAppDownload()}
      >
        <AppActions showGetAppModal={handleShowModalAppDownload} />
      </Player>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        getAppLink={appStoreLink}
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
              var final_response = response2?.data?.data;
              final_response['is_record'] = true;
              final_response['owner'] = response?.data?.data?.owner ?? {};
              resolve(final_response);
            })
            .catch((err) => {
              resolve({});
            });
        } else {
          resolve({});
        }
      })
      .catch((err) => {
        resolve({});
      });
  });
};
export default Record;
