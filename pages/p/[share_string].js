import React, { useState } from "react";
import axios from "axios";
import { Image } from "react-bootstrap";
import Error from "next/error";
import { Player } from "../../components/new/player";
import { Layout } from "../../components/new/layout";
import { TopNav } from "../../components/new/topNav";
import { GetAppModal } from "../../components/new/getAppModal";
import { WelcomeModal } from "../../components/new/welcomeModal";

const linkIcon = require("../../images/video-more-options/ic-link.svg");
const bookmark = require("../../images/video-more-options/ic-bookmark.svg");
const share = require("../../images/video-more-options/ic-share.svg");
const replay = require("../../images/video-more-options/ic-replay.svg");
const comments = require("../../images/video-more-options/ic-comments.svg");
const subsribePlus = require("../../images/video-more-options/ic-subsribe-plus.svg");

/*
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
*/

const Profile = (props) => {
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
    <Error statusCode="404" />
  ) : (
    <Layout>
      <TopNav showGetAppModal={handleShowModalAppDownload} />
      <Player
        userName={props.data.name}
        userProfileImage={props.data.profile_image}
        videoThumbnail={props.data.videos[currentVideoIndex]?.videoThumbnail}
        videoPreviewImage={
          props.data.videos[currentVideoIndex]?.videoPreviewImage
        }
        description={props.data.videos[currentVideoIndex]?.description}
        link={props.data.videos[currentVideoIndex]?.link}
        videoUrl={props.data.videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
      >
        <ShareControls showGetAppModal={handleShowModalAppDownload} />
        <div className="position-absolute top-50">
          <button onClick={getNextVideo}>Next</button>
          <button onClick={getPrevVideo}>Prev</button>
        </div>
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
    share_string !== ""
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}&start=0&rows=10`;
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve({ data: response.data.data });
      })
      .catch((err) => {
        return Promise.resolve({ data: {} });
      });
  } else {
    return Promise.resolve({ data: {} });
  }
};
export default Profile;

const ShareControls = ({ showGetAppModal }) => (
  <ul>
    <li>
      <Image
        src={linkIcon}
        width="24"
        height="24"
        alt="Link"
        title="Link"
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={bookmark}
        width="24"
        height="24"
        alt="Bookmark"
        title="Bookmark"
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={share}
        width="24"
        height="24"
        alt="Share"
        title="Share"
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={replay}
        width="24"
        height="24"
        alt="Replay"
        title="Replay"
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={comments}
        width="24"
        height="24"
        alt="Comments"
        title="Comments"
        onClick={showGetAppModal}
      />
    </li>
    <li>
      <Image
        src={subsribePlus}
        width="24"
        height="24"
        alt="Subsribe Plus"
        title="Subsribe Plus"
        onClick={showGetAppModal}
      />
    </li>
  </ul>
);
