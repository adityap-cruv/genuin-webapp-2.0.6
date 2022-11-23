import React, { useRef, useState } from "react";
import axios from "axios";
import { Player } from "../components/player";
import { Layout } from "../components/layout";
import { TopNav } from "../components/topNav";
import { GetAppModal } from "../components/getAppModal";
import { WelcomeModal } from "../components/welcomeModal";
import { Error } from "../components/error";
import { SEO } from "../components/seo";
import { AppActions } from "../components/appActions";
import { appStoreLink } from "../config";
const Video = (props) => {
  const {
    videoUrl,
    videoPreviewImage,
    description,
    video_id_to_use,
    videoThumbnail,
    userNickname,
    userProfileImage,
    link,
  } = props;
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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  return !Boolean(videoUrl) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        title={`${userNickname} @ Genuin`}
        openGraphTitle={`${userNickname} @ Genuin`}
        videoUrl={videoUrl}
        videoPreviewImage={videoPreviewImage}
        description={description}
        openGraphDescription={description}
        metaImageWidth={1200}
        metaImageHeight={630}
        urlToCopy={process?.env?.hostname + "/" + video_id_to_use}
      />
      <TopNav
        showGetAppModal={showGetAppToViewDialog}
        isError={!Boolean(videoUrl)}
      />
      <Player
        key={video_id_to_use ?? `${Math.random()}`}
        video_id_to_use={video_id_to_use}
        description={description}
        videoUrl={videoUrl}
        videoThumbnail={videoThumbnail}
        userName={`@${userNickname}`}
        userProfileImage={userProfileImage}
        showGetAppModal={handleShowModalAppDownload}
        onEnded={showGetAppToViewDialog}
      >
        <AppActions
          showGetAppModal={handleShowModalAppDownload}
          userName={`@${userNickname}`}
          link={link}
          videoUrl={globalThis?.location?.href}
          videoDescription={description}
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
Video.getInitialProps = async ({ query: { video_id } }) => {
  const url = process.env.apiurl + "/api/v3/users/video/meta_data/" + video_id;
  return axios
    .get(url)
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
