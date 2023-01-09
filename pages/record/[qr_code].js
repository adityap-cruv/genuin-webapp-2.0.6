import { useState, useRef } from "react";
import axios from "axios";
import { Player } from "../../components/player";
import { Layout } from "../../components/layout";
import { TopNav } from "../../components/topNav";
import { GetAppModal } from "../../components/getAppModal";
import { WelcomeModal } from "../../components/welcomeModal";
import { SEO } from "../../components/seo";
import { Error } from "../../components/error";
import { AppActions } from "../../components/appActions";
import { appStoreLink } from "../../config";

const Record = (props) => {
  const {
    videos = [],
    user_id,
    preview_image,
    name,
    nickname,
    share_url,
    no_of_views,
    no_of_videos,
    no_of_replies,
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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  const abbreviateNumber = (value) => {
    var newValue = value;
    if (value >= 1000) {
      var suffixes = ["", "k", "m", "b", "t"];
      var suffixNum = Math.floor(("" + value).length / 3);
      var shortValue = "";
      for (var precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum != 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(precision)
        );
        var dotLessShortValue = (shortValue + "").replace(
          /[^a-zA-Z 0-9]+/g,
          ""
        );
        if (dotLessShortValue.length <= 2) {
          break;
        }
      }
      if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
      newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
  };

  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        title={`Record and publish videos for ${
          Boolean(name) ? name : `@${nickname}`
        }`}
        openGraphTitle={`Record and publish videos for ${
          Boolean(name) ? name : `@${nickname}`
        }`}
        videoUrl={videos[currentVideoIndex]?.video_url_m3u8 ?? videos[currentVideoIndex]?.videoUrl}
        videoPreviewImage={preview_image}
        urlToCopy={share_url}
        description={`${
          Boolean(name) ? name : `@${nickname}`
        }, ${no_of_videos} Videos, ${abbreviateNumber(
          no_of_views
        )} Views, ${no_of_replies} Replies`}
        openGraphDescription={`${
          Boolean(name) ? name : `@${nickname}`
        }, ${no_of_videos} Videos, ${abbreviateNumber(
          no_of_views
        )} Views, ${no_of_replies} Replies`}
      />
      <TopNav showGetAppModal={() => showGetAppToViewDialog()} />
      <Player
        key={currentVideoIndex}
        userName={Boolean(name) ? name : nickname}
        userProfileImage={profile_image}
        videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
        description={videos[currentVideoIndex]?.description}
        link={videos[currentVideoIndex]?.link}
        videoUrl={videos[currentVideoIndex]?.video_url_m3u8 ?? videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
        onEnded={showGetAppToViewDialog}
        autoplay
      >
        <AppActions
          showGetAppModal={handleShowModalAppDownload}
          userName={Boolean(name) ? name : nickname}
          videoUrl={globalThis?.location?.href}
          videoDescription={videos[currentVideoIndex]?.description}
          videoTitle='Genuin'
        />
      </Player>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
      <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
    </Layout>
  );
};
Record.getInitialProps = async ({ query: { qr_code } }) => {
  return new Promise(function (resolve, reject) {
    var url_to_use = `${process.env.apiurl}/api/v3/public/qr?qr_code=${qr_code}`;

    axios
      .get(url_to_use)
      .then((response) => {
        if (
          response.data.data.owner.nickname !== undefined &&
          response.data.data.owner.nickname !== null &&
          response.data.data.owner.nickname !== ""
        ) {
          var url_to_use2 = `${process.env.apiurl}/api/v3/public/p?username=${response.data.data.owner.nickname}&start=0&rows=10`;
          axios
            .get(url_to_use2)
            .then((response2) => {
              var final_response = response2?.data?.data;
              final_response["is_record"] = true;
              final_response["owner"] = response?.data?.data?.owner ?? {};
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
