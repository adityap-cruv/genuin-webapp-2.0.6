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
import { Container } from "react-bootstrap";
import views from "../../images/views.svg";
import comments from "../../images/comments.svg";
import shareImg from "../../images/video-more-options/ic-share-blue.svg";
import directMessage from "../../images/direct_message.svg";
import {
  Box,
  Image,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  Avatar,
  ModalOverlay,
  useDisclosure,
  Grid,
} from "@chakra-ui/react";

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

  const { isOpen, onOpen, onClose } = useDisclosure();

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
          <Flex
            flexDir={{
              base: "column",
              sm: "row",
            }}
            gap={114}
            mt={16}
            justifyContent='space-between'
          >
            <Flex color='#111111' flexDir='column'>
              <Avatar
                name={`@${nickname}`}
                src={profilePic}
                size='xl'
                background='#A4E6DA'
              />
              <Box fontWeight='700' fontSize={17}>
                @{nickname}
              </Box>
              <Box fontWeight='600' fontSize={15}>
                {bio || "No bio yet"}
              </Box>
              <Flex justifyContent={"space-between"} textAlign='center' my={4}>
                <Box>
                  <Box fontWeight='bold'>{no_of_views}</Box>
                  <Box fontWeight={600} fontSize={12} color='#949494'>
                    Views
                  </Box>
                </Box>
                <Box>
                  <Box fontWeight='bold'>{no_of_videos}</Box>
                  <Box fontWeight={600} fontSize={12} color='#949494'>
                    Videos
                  </Box>
                </Box>
                <Box>
                  <Box fontWeight='bold'>{no_of_replies}</Box>
                  <Box fontWeight={600} fontSize={12} color='#949494'>
                    Replies
                  </Box>
                </Box>
              </Flex>
              <Flex gap={4}>
                <Button
                  color='#0645ff'
                  bgColor='transparent'
                  border='1px solid #0645FF'
                >
                  <Image
                    src={directMessage.src}
                    size={8}
                    pr={3}
                    alt='Share'
                    title='Share Profile'
                  />
                  Direct Message
                </Button>
                <Button
                  color='#0645ff'
                  bgColor='transparent'
                  border='1px solid #0645FF'
                  p='0'
                >
                  <Image
                    src={shareImg.src}
                    size={8}
                    alt='Share'
                    title='Share Profile'
                  />
                </Button>
              </Flex>
            </Flex>
            <Flex>
              <Grid
                templateColumns={[
                  "auto",
                  "1fr",
                  "1fr 1fr ",
                  "1fr 1fr 1fr",
                  "1fr 1fr 1fr 1fr",
                ]}
                maxHeight='calc(100vh - 70px)'
                overflowY='scroll'
                pb={16}
                gap={6}
              >
                {videos.map((video, index) => (
                  <Box
                    cursor='pointer'
                    transition='transform .2s'
                    _hover={{
                      transform: "scale(0.97)",
                    }}
                    key={video.video_uuid}
                    role='group'
                  >
                    <Image
                      src={video.videoThumbnail}
                      onClick={() => {
                        onOpen();
                        setCurrentVideoIndex(index);
                      }}
                    />
                    <Flex
                      position='absolute'
                      _groupHover={{
                        opacity: 1,
                      }}
                      gap={3}
                      bottom={3}
                      left={2}
                      color='white'
                      fontSize='15px'
                      fontWeight='bold'
                    >
                      <Flex>
                        <Image mr={2} src={comments.src} h={5} mt={1} />
                        {video.noOfConversation}
                      </Flex>
                      <Flex>
                        <Image src={views.src} mr={1} mt={1} />
                        {video.noOfViews}
                      </Flex>
                    </Flex>
                  </Box>
                ))}
              </Grid>
            </Flex>
          </Flex>
        </Container>

        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
          <ModalOverlay />
          <ModalContent maxW='44rem' h='full'>
            <ModalBody py={2} m={4} height='full'>
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
            </ModalBody>
          </ModalContent>
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
