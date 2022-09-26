import { useState, useRef } from 'react';
import axios from 'axios';
import { Error } from '../../components/error';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { WelcomeModal } from '../../components/welcomeModal';
import { SEO } from '../../components/seo';
import { AppActions } from '../../components/appActions';
import { appStoreLink } from '../../config';

const RoundTable = ({ group, preview_image, chats = [] }) => {
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
  const [currentVideoIndex] = useState(0);

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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  return !Boolean(group?.group_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        videoPreviewImage={preview_image}
        videoUrl={chats?.[currentVideoIndex]?.video_url}
        description={group.group_description}
      />
      <TopNav showGetAppModal={showGetAppToViewDialog} />
      <Player
        key={currentVideoIndex}
        video_id_to_use={chats?.[currentVideoIndex]?.conversation_id}
        description={group?.group_description}
        videoUrl={chats?.[currentVideoIndex]?.video_url}
        videoThumbnail={chats?.[currentVideoIndex]?.thumbnail_url}
        userName={chats?.[currentVideoIndex]?.owner?.name}
        userProfileImage={chats?.[currentVideoIndex]?.owner?.profile_image}
        roundTableMode
        roundTableName={group?.group_name}
        showGetAppModal={handleShowModalAppDownload}
        onEnded={showGetAppToViewDialog}
      >
        <AppActions
          showGetAppModal={handleShowModalAppDownload}
          roundTable
          roundTableName={'sdffsd'}
          videoUrl={globalThis?.location?.href}
          videoDescription={group?.group_descriptio}
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
