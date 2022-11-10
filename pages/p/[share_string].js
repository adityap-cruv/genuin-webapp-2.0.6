import { useState, useRef, useMemo } from "react";
import axios from "axios";
import { isValidHttpUrl, Player } from "../../components/player";
import { Layout } from "../../components/layout";
import { TopNav } from "../../components/topNav";
import { GetAppModal } from "../../components/getAppModal";
import { AppActions } from "../../components/appActions";
import { WelcomeModal } from "../../components/welcomeModal";
import { Error } from "../../components/error";
import { SEO } from "../../components/seo";
import { appStoreLink } from "../../config";
import { Col, Container, Row, Modal, Image, Button } from "react-bootstrap";
import views from "../../images/views.svg";
import comments from "../../images/comments.svg";
import shareImg from "../../images/video-more-options/ic-share-blue.svg";
import directMessage from "../../images/direct_message.svg";

const Profile = ({
  user_id,
  preview_image,
  nickname,
  name,
  share_url,
  no_of_views,
  no_of_videos,
  no_of_replies,
  profile_image,
  videos = [],
  bio,
}) => {
  const profilePic = useMemo(() => {
    if (Boolean(profile_image)) {
      return isValidHttpUrl(profile_image)
        ? profile_image
        : `https://media.qa.begenuin.com/backend_assets/lottie/${profile_image}.png`;
    }
    return "https://media.qa.begenuin.com/backend_assets/lottie/snowman.png";
  }, [profile_image]);

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

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
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
        title={`${
          Boolean(name) ? name : `@${nickname}`
        } is on Genuin. Connect confidently.`}
        openGraphTitle={`${
          Boolean(name) ? name : `@${nickname}`
        } is on Genuin. Connect confidently.`}
        videoPreviewImage={preview_image}
        urlToCopy={share_url}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        description={`${
          Boolean(name) ? name : `@${nickname}`
        }, ${no_of_videos} Videos, ${abbreviateNumber(
          no_of_views
        )} Views, ${no_of_replies} Replies`}
      />
      <TopNav showGetAppModal={showGetAppToViewDialog} isContiner isBlue />
      <section className='section-content d-flex flex-column h-100'>
        <Container className='container-false d-none d-md-block'></Container>
        <Container>
          <Row>
            <Col className='profile-info'>
              <Image
                src={profilePic}
                className='profile-image-avatar'
                alt={`@${nickname}`}
                title={`@${nickname}`}
              />
              <div className='profile-nickname'>@{nickname}</div>
              <div className='profile-bio'>{bio || "No bio yet"}</div>
              <div className='profile-stats'>
                <div>
                  <div>{no_of_views}</div>
                  <div className='profile-stats-label'>Views</div>
                </div>
                <div>
                  <div>{no_of_videos}</div>
                  <div className='profile-stats-label'>Videos</div>
                </div>
                <div>
                  <div>{no_of_replies}</div>
                  <div className='profile-stats-label'>Replies</div>
                </div>
              </div>
              <div className='profile-actions'>
                <Button className='profile-actions-button'>
                  <Image
                    src={directMessage.src}
                    width='20'
                    height='20'
                    style={{
                      paddingRight: 6,
                    }}
                    alt='Share'
                    title='Share Profile'
                  />
                  Direct Message
                </Button>
                <Button className='profile-actions-button'>
                  <Image
                    src={shareImg.src}
                    width='20'
                    height='20'
                    alt='Share'
                    title='Share Profile'
                  />
                </Button>
              </div>
            </Col>
            <Col>
              <div className='video-gallery'>
                {videos.map((video, index) => (
                  <div className='video-thumbnail-wrapper'>
                    <img
                      src={video.videoThumbnail}
                      className='video-thumbnail'
                      onClick={() => {
                        handleShow();
                        setCurrentVideoIndex(index);
                      }}
                    />
                    <div className='video-thumbnail-icons'>
                      <div>
                        <img src={comments.src} style={{ paddingRight: 2 }} />{" "}
                        {video.noOfConversation}
                      </div>
                      <div>
                        <img src={views.src} style={{ paddingRight: 3 }} />
                        {video.noOfViews}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
        <Modal
          show={show}
          onHide={handleClose}
          centered
          className='modal-profile-video'
        >
          <Player
            videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
            description={videos[currentVideoIndex]?.description}
            link={videos[currentVideoIndex]?.link}
            videoUrl={videos[currentVideoIndex]?.videoUrl}
            userName={`@${nickname}`}
            userProfileImage={profile_image}
            showGetAppModal={showGetAppToViewDialog}
            onEnded={showGetAppToViewDialog}
            getNextVideo={getNextVideo}
            getPrevVideo={getPrevVideo}
          >
            <AppActions
              showGetAppModal={showGetAppToViewDialog}
              userName={`@${nickname}`}
              link={videos[currentVideoIndex].link}
              videoUrl={globalThis?.location?.href}
              videoDescription={videos[currentVideoIndex].description}
              videoTitle='Genuin'
            />
          </Player>
        </Modal>
      </section>
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
    share_string !== ""
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
