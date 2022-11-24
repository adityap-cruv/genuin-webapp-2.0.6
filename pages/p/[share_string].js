import { useState, useRef, useMemo, useEffect } from "react";
import axios from "axios";
import { isValidHttpUrl, Player } from "../../components/player";
import { Layout } from "../../components/layout";
import { TopNav } from "../../components/topNav";
import { GetAppModal } from "../../components/getAppModal";
import { AppActions, ShareButton } from "../../components/appActions";
import { WelcomeModal } from "../../components/welcomeModal";
import { Error } from "../../components/error";
import { SEO } from "../../components/seo";
import { appStoreLink } from "../../config";
import { Container } from "react-bootstrap";
import views from "../../images/views.svg";
import comments from "../../images/comments.svg";
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
  Divider,
  ModalOverlay,
  useDisclosure,
  useBreakpointValue,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Text,
  Link,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const Profile = ({
  user_id,
  preview_image,
  nickname,
  bio,
  name,
  share_url,
  no_of_views,
  no_of_videos,
  no_of_replies,
  profile_image,
  videos = [],
  hashtags = [],
}) => {
  const profilePic = useMemo(() => {
    if (Boolean(profile_image)) {
      return isValidHttpUrl(profile_image)
        ? profile_image
        : `https://media.qa.begenuin.com/backend_assets/lottie/${profile_image}.png`;
    }
    return "https://media.qa.begenuin.com/backend_assets/lottie/snowman.png";
  }, [profile_image]);

  const router = useRouter();

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
  const mobile = useBreakpointValue({ base: true, sm: false });

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
  const [tabIndex, setTabIndex] = useState(0);

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  const showGetAppToSendMessage = () =>
    handleShowModalAppDownload(() => (
      <>Get the Genuin app to send a direct message to @{nickname}.</>
    ));

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
  hashtags =
    hashtags || hashtags == []
      ? ["entreprenuer", "business", "leadership", "startups"]
      : hashtags;
  const ORG_SCHEMA = JSON.stringify({
    "@context": "http://schema.org",
    "@type": "ProfilePage",
    id: `${share_url}`,
    url: `${share_url}`,
    name: `${
      Boolean(name) ? `${name} (@${nickname})` : `@${nickname}`
    } on Genuin | Connect with @${nickname} with a video reply`,
    isPartOf: "https://begenuin.com/#website",
    image: `${share_url}/#primaryimage`,
    thumbnailUrl: `${preview_image}`,
    description: `${
      Boolean(name) ? `[${name}] (@${nickname})` : `@${nickname}`
    } on Genuin | ${abbreviateNumber(
      no_of_views
    )} Views. ${no_of_videos} Videos. ${no_of_replies} Replies. ${
      bio ? bio.replace(/\n+/g, " ") : ""
    } ${
      hashtags && hashtags != [] && hashtags.length > 0
        ? hashtags.map((tag) => "#" + tag).join(" ")
        : ""
    }`,
    inLanguage: "en-US",
    potentialAction: [
      {
        "@type": "ReadAction",
        target: `${share_url}`,
      },
    ],
  });

  const [currentUrl, setCurrentUrl] = useState("");
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        openGraphType='profile'
        title={`${
          Boolean(name) ? `${name} (@${nickname})` : `@${nickname}`
        } is on Genuin. | Connect with @${nickname} with a video reply`}
        openGraphTitle={`${
          Boolean(name) ? name : `@${nickname}`
        } is on Genuin. Connect confidently.`}
        // openGraphTitle={`${Boolean(name) ? `${name} (@${nickname})` : `@${nickname}`} is on Genuin. | Connect with @${nickname} with a video reply`}
        description={`${
          Boolean(name) ? `[${name}] (@${nickname})` : `@${nickname}`
        } on Genuin. | ${abbreviateNumber(
          no_of_views
        )} Views. ${no_of_videos} Videos. ${no_of_replies} Replies. ${
          bio ? bio.replace(/\n+/g, " ") : ""
        } ${
          hashtags && hashtags != [] && hashtags.length > 0
            ? hashtags.map((tag) => "#" + tag).join(" ")
            : ""
        }`}
        openGraphDescription={`${
          Boolean(name) ? name : `@${nickname}`
        }, ${no_of_videos} Videos, ${abbreviateNumber(
          no_of_views
        )} Views, ${no_of_replies} Replies`}
        urlToCopy={share_url}
        videoPreviewImage={preview_image}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }}
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
            maxH='calc(100vh - 140px)'
            gap={{ base: 4, sm: 114 }}
            mt={{ base: 16, sm: 0 }}
            justifyContent='space-between'
          >
            {mobile && <Divider opacity={0.1} mt={2} />}
            <Flex color='#111111' flexDir='column'>
              <Flex justifyContent={"space-between"}>
                <Avatar
                  name={`@${nickname}`}
                  src={profilePic}
                  size='xl'
                  background='#A4E6DA'
                  mb={2}
                />
                {mobile && (
                  <Flex
                    textAlign='center'
                    alignItems='center'
                    justifyContent={"space-between"}
                    w='full'
                    mx={6}
                  >
                    <Flex flexGrow={1} flexDir='column'>
                      <Box fontWeight='bold'>{no_of_views}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Views
                      </Box>
                    </Flex>
                    <Flex flexGrow={1} flexDir='column'>
                      <Box fontWeight='bold'>{no_of_videos}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Videos
                      </Box>
                    </Flex>
                    <Flex flexGrow={1} flexDir='column'>
                      <Box fontWeight='bold'>{no_of_replies}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Replies
                      </Box>
                    </Flex>
                  </Flex>
                )}
              </Flex>
              <Box fontWeight='700' fontSize={17}>
                @{nickname}
              </Box>
              <Box fontWeight='600' fontSize={15}>
                {bio || "No bio yet"}
              </Box>
              {!mobile && (
                <Flex
                  justifyContent={{
                    base: "space-around",
                    sm: "space-between",
                  }}
                  textAlign='center'
                  my={4}
                >
                  <Flex flexGrow={1} flexDir='column'>
                    <Box fontWeight='bold'>{no_of_views}</Box>
                    <Box fontWeight={600} fontSize={12} color='#949494'>
                      Views
                    </Box>
                  </Flex>
                  <Flex flexGrow={1} flexDir='column'>
                    <Box fontWeight='bold'>{no_of_videos}</Box>
                    <Box fontWeight={600} fontSize={12} color='#949494'>
                      Videos
                    </Box>
                  </Flex>
                  <Flex flexGrow={1} flexDir='column'>
                    <Box fontWeight='bold'>{no_of_replies}</Box>
                    <Box fontWeight={600} fontSize={12} color='#949494'>
                      Replies
                    </Box>
                  </Flex>
                </Flex>
              )}
              <Flex gap={4} mt={2}>
                <Button
                  color='#0645ff'
                  bgColor='transparent'
                  border='1px solid #0645FF'
                  fontWeight='bold'
                  h={8}
                  px={5}
                  onClick={showGetAppToSendMessage}
                >
                  <Image
                    src={directMessage.src}
                    size={8}
                    pr={3}
                    alt='Share'
                    title='Share Profile'
                  />
                  <Text>Direct Message</Text>
                </Button>
                <ShareButton
                  url={currentUrl}
                  description='Hello, visit this profile!'
                  title='Genuin on web'
                  color='#0645ff'
                  bgColor='transparent'
                  border='1px solid #0645FF'
                  p={0}
                  minW={8}
                  h={8}
                  borderRadius='md'
                  variation='blue'
                />
              </Flex>
            </Flex>

            <Tabs
              onChange={(index) => setTabIndex(index)}
              colorScheme='black'
              display={{ base: "contents", sm: "block" }}
            >
              <TabList borderBottom={0} mb='2px'>
                <Tab flexGrow={1}>
                  <AllIcon
                    boxSize={8}
                    color={tabIndex === 0 ? "#111111" : "#949494"}
                  />
                </Tab>
                <Tab flexGrow={1}>
                  <PublicIcon
                    boxSize={8}
                    color={tabIndex === 1 ? "#111111" : "#949494"}
                  />
                </Tab>
                <Tab flexGrow={1}>
                  <RoundtableIcon
                    boxSize={8}
                    color={tabIndex === 2 ? "#111111" : "#949494"}
                  />
                </Tab>
              </TabList>

              <TabPanels overflow='scroll' maxH='full' pb={mobile ? 10 : 18}>
                <TabPanel p={0} pt={1}>
                  <Videos
                    mobile={mobile}
                    videos={videos}
                    onOpen={onOpen}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                  />
                </TabPanel>
                <TabPanel p={0} pt={1}>
                  <Videos
                    mobile={mobile}
                    videos={videos}
                    onOpen={onOpen}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                  />
                </TabPanel>
                <TabPanel p={0} pt={1}>
                  <Videos
                    mobile={mobile}
                    videos={videos}
                    onOpen={onOpen}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </Container>

        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
          <ModalOverlay
            bgColor='red'
            backgroundImage={`url(${videos[currentVideoIndex]?.videoThumbnail})`}
            backgroundRepeat='no-repeat'
            backgroundSize='cover'
            backgroundPosition='center'
            width='110%'
            h='110%'
            left={-10}
            top={-10}
            opacity={0.4}
            filter='blur(25px)'
          />
          <ModalContent
            h='full'
            marginTop={0}
            maxH='full'
            maxW='full'
            bg='transparent'
          >
            <ModalBody p={0} height='full' w='full' overflow='hidden'>
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

const Videos = ({ videos, onOpen, setCurrentVideoIndex, mobile }) => (
  <Box overflowY='scroll'>
    <Grid
      templateColumns={[
        "1fr 1fr 1fr",
        "1fr",
        "1fr 1fr ",
        "1fr 1fr 1fr",
        "1fr 1fr 1fr 1fr",
      ]}
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
          {!mobile && (
            <Image
              src={video.videoThumbnail}
              onClick={() => {
                onOpen();
                setCurrentVideoIndex(index);
              }}
            />
          )}
          {mobile && (
            <Link href={`/${video.share_string}`}>
              <Image src={video.videoThumbnail} />
            </Link>
          )}

          <Flex
            position='absolute'
            _groupHover={{
              opacity: 1,
            }}
            opacity={0}
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
  </Box>
);

const RoundtableIcon = (props) => (
  <Icon viewBox='0 0 27 28' {...props}>
    <path
      d='M22.7334 9.73315C22.3334 9.73315 22.0667 9.73316 21.6667 9.8665C20.8667 8.13316 19.4 6.79984 17.8 5.99984C17.9334 5.73317 17.9334 5.33319 17.9334 4.93319C17.9334 2.53319 16.0667 0.666504 13.6667 0.666504C11.2667 0.666504 9.40002 2.53319 9.40002 4.93319C9.40002 5.33319 9.40003 5.59984 9.53337 5.99984C7.80003 6.79984 6.46671 8.2665 5.66671 9.8665C5.40004 9.73316 5.00004 9.73315 4.60004 9.73315C2.20004 9.73315 0.333374 11.5998 0.333374 13.9998C0.333374 16.3998 2.20004 18.2665 4.60004 18.2665C5.00004 18.2665 5.26671 18.2665 5.66671 18.1332C6.46671 19.8665 7.93337 21.1998 9.53337 21.9998C9.40003 22.2665 9.40002 22.6665 9.40002 23.0665C9.40002 25.4665 11.2667 27.3332 13.6667 27.3332C16.0667 27.3332 17.9334 25.4665 17.9334 23.0665C17.9334 22.6665 17.9334 22.3998 17.8 21.9998C19.5334 21.1998 20.8667 19.7332 21.6667 18.1332C21.9334 18.2665 22.3334 18.2665 22.7334 18.2665C25.1334 18.2665 27 16.3998 27 13.9998C27 11.5998 25.1334 9.73315 22.7334 9.73315ZM13.6667 2.79985C14.8667 2.79985 15.8 3.73319 15.8 4.93319C15.8 6.13319 14.8667 7.06649 13.6667 7.06649C12.4667 7.06649 11.5334 6.13319 11.5334 4.93319C11.5334 3.73319 12.4667 2.79985 13.6667 2.79985ZM2.4667 13.9998C2.4667 12.7998 3.40004 11.8665 4.60004 11.8665C5.80004 11.8665 6.73336 12.7998 6.73336 13.9998C6.73336 15.1998 5.80004 16.1332 4.60004 16.1332C3.40004 16.1332 2.4667 15.1998 2.4667 13.9998ZM13.6667 25.1998C12.4667 25.1998 11.5334 24.2665 11.5334 23.0665C11.5334 21.8665 12.4667 20.9332 13.6667 20.9332C14.8667 20.9332 15.8 21.8665 15.8 23.0665C15.8 24.2665 14.8667 25.1998 13.6667 25.1998ZM16.7334 20.1332C15.9334 19.3332 14.8667 18.7998 13.6667 18.7998C12.4667 18.7998 11.4 19.3332 10.6 20.1332C9.2667 19.4665 8.20003 18.3998 7.53337 17.0665C8.33337 16.2665 8.8667 15.1998 8.8667 13.9998C8.8667 12.7998 8.33337 11.7332 7.53337 10.9332C8.20003 9.59985 9.2667 8.53316 10.6 7.8665C11.4 8.6665 12.4667 9.19983 13.6667 9.19983C14.8667 9.19983 15.9334 8.6665 16.7334 7.8665C18.0667 8.53316 19.1334 9.59985 19.8 10.9332C19 11.7332 18.4667 12.7998 18.4667 13.9998C18.4667 15.1998 19 16.2665 19.8 17.0665C19.1334 18.3998 18.0667 19.4665 16.7334 20.1332ZM22.7334 16.1332C21.5334 16.1332 20.6 15.1998 20.6 13.9998C20.6 12.7998 21.5334 11.8665 22.7334 11.8665C23.9334 11.8665 24.8667 12.7998 24.8667 13.9998C24.8667 15.1998 23.9334 16.1332 22.7334 16.1332Z'
      fill={props.color}
    />
  </Icon>
);

const PublicIcon = (props) => (
  <Icon viewBox='0 0 27 28' {...props}>
    <path
      d='M13.258 0.666504C5.87573 0.666504 0 6.65761 0 14.1849C0 20.176 3.91714 25.399 9.19021 27.0888C11.7514 27.8569 14.4633 26.7816 15.6686 24.3237C15.9699 23.5556 16.2712 22.6339 16.2712 21.8658V21.5585C16.2712 21.2513 15.9699 21.0977 15.8192 21.2513C15.0659 21.5585 14.162 21.7122 13.258 21.7122C9.34089 21.5586 6.02637 18.3326 6.17703 14.1849C6.17703 10.1908 9.49156 6.81123 13.4087 6.81123C17.4765 6.81123 20.6403 10.1908 20.6403 14.1849V21.7122C20.6403 23.2484 20.339 24.6309 19.7363 26.0135C23.8041 23.7092 26.6667 19.2543 26.6667 14.1849C26.516 6.81123 20.6403 0.666504 13.258 0.666504Z'
      fill={props.color}
    />
  </Icon>
);
const AllIcon = (props) => (
  <Icon viewBox='0 0 22 24' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.90916 1.36364C2.90916 0.610516 2.29864 0 1.54552 0C0.792401 0 0.181885 0.610516 0.181885 1.36364V8.99997C0.181885 9.75309 0.792401 10.3636 1.54552 10.3636C2.29864 10.3636 2.90916 9.75309 2.90916 8.99997V1.36364ZM2.90916 15C2.90916 14.2468 2.29864 13.6364 1.54552 13.6364C0.792401 13.6364 0.181885 14.2468 0.181885 15V22.6364C0.181885 23.3895 0.792401 24 1.54552 24C2.29864 24 2.90916 23.3895 2.90916 22.6364V15ZM11.091 0C11.8441 0 12.4546 0.610516 12.4546 1.36364V9C12.4546 9.75312 11.8441 10.3636 11.091 10.3636C10.3378 10.3636 9.72734 9.75312 9.72734 9V1.36364C9.72734 0.610516 10.3378 0 11.091 0ZM22.0001 1.36364C22.0001 0.610516 21.3896 0 20.6364 0C19.8833 0 19.2728 0.610516 19.2728 1.36364V9C19.2728 9.75312 19.8833 10.3636 20.6364 10.3636C21.3896 10.3636 22.0001 9.75312 22.0001 9V1.36364ZM11.091 13.6364C11.8441 13.6364 12.4546 14.2468 12.4546 15V22.6364C12.4546 23.3895 11.8441 24 11.091 24C10.3378 24 9.72734 23.3895 9.72734 22.6364V15C9.72734 14.2468 10.3378 13.6364 11.091 13.6364ZM22.0001 15C22.0001 14.2468 21.3896 13.6364 20.6364 13.6364C19.8833 13.6364 19.2728 14.2468 19.2728 15V22.6364C19.2728 23.3895 19.8833 24 20.6364 24C21.3896 24 22.0001 23.3895 22.0001 22.6364V15Z'
      fill={props.color}
    />
  </Icon>
);

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
