import { useMemo, useState, useRef, useEffect } from "react";
import axios from "axios";
import { Error } from "../../components/error";
import { Player } from "../../components/player";
import { Layout } from "../../components/layout";
import { TopNav } from "../../components/topNav";
import { GetAppModal } from "../../components/getAppModal";
import { WelcomeModal } from "../../components/welcomeModal";
import { SEO } from "../../components/seo";
import { AppActions, ShareButton } from "../../components/appActions";
import { appStoreLink } from "../../config";
import { Container } from "react-bootstrap";
import views from "../../images/views.svg";
import comments from "../../images/comments.svg";
import shareImg from "../../images/video-more-options/ic-share-blue.svg";
import directMessage from "../../images/direct_message_grey.svg";
import {
  Avatar,
  Box,
  Button,
  Image,
  Link,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  Divider,
  HStack,
  useDisclosure,
  useBreakpointValue,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const RoundTable = ({
  details,
  videos = [],
  users = {
    members: [],
    subscribers: [],
  },
}) => {
  const { group } = details;
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [watchRoundTable, setWatchRoundtable] = useState(false);
  const [direction, setDirection] = useState("forward");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const mobile = useBreakpointValue({ base: true, sm: false });
  const router = useRouter();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null;
    setShowModalAppDownload(false);
  };
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message;
    setShowModalAppDownload(true);
  };

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

  const showGetAppToSubscribeDialog = () =>
    handleShowModalAppDownload(() => (
      <>
        Get the app to subscribe to <strong>{group.group_name}</strong>{" "}
        roundtable.
      </>
    ));

  return !Boolean(group?.group_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        title={group.group_name}
        openGraphTitle={group.group_name}
        videoUrl={videos?.[currentVideoIndex]?.video_url}
        description={group?.group_description}
        openGraphDescription={group?.group_description}
      />
      {!router.query.v && (
        <TopNav showGetAppModal={showGetAppToViewDialog} isContiner isBlue />
      )}
      <section className='section-content d-flex flex-column h-100'>
        <Container className='container-false d-none d-md-block'></Container>
        {/* if there is a specific video url */}
        {router.query.v && (
          <Player
            key={currentVideoIndex}
            videos={videos}
            currentVideoIndex={currentVideoIndex}
            video_id_to_use={videos?.[currentVideoIndex]?.conversation_id}
            description={group?.group_description}
            videoUrl={videos?.[currentVideoIndex]?.video_url}
            videoThumbnail={videos?.[currentVideoIndex]?.thumbnail_url}
            userName={`@${videos?.[currentVideoIndex]?.owner?.nickname}`}
            userProfileImage={videos?.[currentVideoIndex]?.owner?.profile_image}
            roundTableMode
            roundTableName={group?.group_name}
            showGetAppModal={handleShowModalAppDownload}
            watchRoundTable={watchRoundTable}
            setWatchRoundtable={setWatchRoundtable}
          >
            <AppActions
              showGetAppModal={handleShowModalAppDownload}
              roundTable
              roundTableName={group?.group_name}
              roundTableId={details.chat_id}
              link={videos?.[currentVideoIndex]?.link}
              videoUrl={globalThis?.location?.href}
              videoDescription={group?.group_description}
              videoTitle='Genuin'
              watchRoundTable={watchRoundTable}
            />
          </Player>
        )}

        {/* if there is no specific video url */}
        {!router.query.v && (
          <Container
            style={{
              height: "calc(100% - 70px)",
            }}
          >
            <Flex
              flexDir={{
                base: "column",
                sm: "row",
              }}
              maxH='calc(100vh - 140px)'
              h='full'
              gap={{ base: 4, sm: "calc(100% / 12)" }}
              mt={{ base: 16, sm: 0 }}
              justifyContent='space-between'
            >
              {mobile && <Divider opacity={0.1} />}

              {/* profile info */}
              <Flex
                color='#111111'
                flexDir='column'
                w={{ base: "100%", sm: "calc(100% / 12 * 3)" }}
              >
                <Flex justifyContent={"space-between"}>
                  <Avatar
                    name={group.group_name}
                    src={""}
                    size='xl'
                    background='#A4E6DA'
                    mb={3}
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
                        <Box fontWeight='bold'>{group.no_of_views}</Box>
                        <Box fontWeight={600} fontSize={12} color='#949494'>
                          Views
                        </Box>
                      </Flex>
                      <Flex flexGrow={1} flexDir='column'>
                        <Box fontWeight='bold'>{group.no_of_videos}</Box>
                        <Box fontWeight={600} fontSize={12} color='#949494'>
                          Videos
                        </Box>
                      </Flex>
                      <Flex flexGrow={1} flexDir='column'>
                        <Box fontWeight='bold'>{group.no_of_subscribers}</Box>
                        <Box fontWeight={600} fontSize={12} color='#949494'>
                          Subscribers
                        </Box>
                      </Flex>
                    </Flex>
                  )}
                </Flex>

                <Box fontWeight='700' fontSize={17}>
                  @{group.group_name}
                </Box>
                <Box fontWeight='600' fontSize={15} mb={1}>
                  {group?.group_description || "No bio yet"}
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
                      <Box fontWeight='bold'>{group.no_of_views}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Views
                      </Box>
                    </Flex>
                    <Flex flexGrow={1} flexDir='column'>
                      <Box fontWeight='bold'>{group.no_of_videos}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Videos
                      </Box>
                    </Flex>
                    <Flex flexGrow={1} flexDir='column'>
                      <Box fontWeight='bold'>{group.no_of_subscribers}</Box>
                      <Box fontWeight={600} fontSize={12} color='#949494'>
                        Subscribers
                      </Box>
                    </Flex>
                  </Flex>
                )}
                <Flex gap={4} mt={2}>
                  <Button
                    bgColor='#0645FF'
                    fontWeight='bold'
                    h={8}
                    px={5}
                    onClick={showGetAppToSubscribeDialog}
                  >
                    <Text color='white'>Subscribe</Text>
                  </Button>
                  <ShareButton
                    url={currentUrl}
                    description='Hello, visit this roundtable!'
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

              {/* videos and profiles */}
              <Flex
                overflowY='auto'
                direction='column'
                gap={4}
                pb={{ base: 0, sm: 8 }}
                w='full'
                h='full'
              >
                <Flex position='relative'>
                  <Videos
                    mobile={mobile}
                    videos={videos}
                    onOpen={onOpen}
                    setCurrentVideoIndex={setCurrentVideoIndex}
                    setWatchRoundtable={setWatchRoundtable}
                  />
                  <Box
                    position='absolute'
                    zIndex={10}
                    background='linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
                    h='full'
                    w={10}
                    left={0}
                    top={0}
                  />
                  <Box
                    position='absolute'
                    zIndex={10}
                    background='linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%)'
                    h='full'
                    w={10}
                    right={0}
                    top={0}
                  />
                </Flex>
                {mobile && <Divider opacity={0.1} />}

                <Participants members={users.members} mobile={mobile} />
              </Flex>
            </Flex>
          </Container>
        )}

        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
          <ModalContent
            h='full'
            marginTop={0}
            maxH='full'
            maxW='full'
            bg='transparent'
          >
            <ModalBody p={0} height='full' w='full'>
              <Player
                key={currentVideoIndex}
                videos={videos}
                currentVideoIndex={currentVideoIndex}
                video_id_to_use={videos?.[currentVideoIndex]?.conversation_id}
                description={group?.group_description}
                videoUrl={videos?.[currentVideoIndex]?.video_url}
                videoThumbnail={videos?.[currentVideoIndex]?.thumbnail_url}
                userName={videos?.[currentVideoIndex]?.owner?.nickname}
                userId={videos?.[currentVideoIndex]?.owner?.member_id}
                userProfileImage={
                  videos?.[currentVideoIndex]?.owner?.profile_image
                }
                onClickOutsideOfVideo={() => {
                  onClose();
                  setWatchRoundtable(false);
                }}
                roundTableMode
                roundTableName={group?.group_name}
                showGetAppModal={handleShowModalAppDownload}
                getNextVideo={getNextVideo}
                getPrevVideo={getPrevVideo}
                watchRoundTable={watchRoundTable}
                setWatchRoundtable={setWatchRoundtable}
                autoJumpToNextVideo
                autoplay={watchRoundTable}
                onClose={onClose}
                roundTableId={details.chat_id}
                direction={direction}
                setDirection={setDirection}
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  roundTable
                  roundTableName={group?.group_name}
                  roundTableId={details.chat_id}
                  link={videos?.[currentVideoIndex]?.link}
                  videoUrl={globalThis?.location?.href}
                  videoDescription={group?.group_description}
                  videoTitle='Genuin'
                  watchRoundTable={watchRoundTable}
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
      />
      <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
    </Layout>
  );
};

const Videos = ({
  videos,
  onOpen,
  setCurrentVideoIndex,
  mobile,
  setWatchRoundtable,
}) => (
  <Box overflow='auto' whiteSpace='nowrap' pl={0}>
    {!Boolean(videos.length) && (
      <Flex
        w='full'
        h='full'
        alignItems='center'
        justifyContent='center'
        fontWeight={700}
        fontSize={20}
        color='#949494'
      >
        No videos yet
      </Flex>
    )}
    {Boolean(videos.length) &&
      videos.map((video, index) => (
        <Box
          cursor='pointer'
          transition='transform .2s'
          key={video.thumbnail_url}
          h={{ base: 120, sm: 240 }}
          display='inline-block'
          pr={index === videos.length - 1 ? 0 : 4}
          position='relative'
          zIndex={index === videos.length - 1 || index === 0 ? 11 : 9}
        >
          {!mobile && (
            <Image
              src={video.thumbnail_url}
              onClick={() => {
                onOpen();
                setWatchRoundtable(false);
                setCurrentVideoIndex(index);
              }}
              h='full'
            />
          )}
          {mobile && (
            // this needs to point to the same page but with &video_id=${v} at te end
            <Link href={`/${video.share_string}`}>
              <Image src={video.thumbnail_url} h='full' />
            </Link>
          )}

          <Box
            position='absolute'
            gap={3}
            top={3}
            left={2}
            color='white'
            fontSize='15px'
            fontWeight='bold'
          >
            {video.meta_data.duration}
          </Box>
        </Box>
      ))}
  </Box>
);

const Participants = ({ members, mobile }) => {
  return (
    <Flex direction='column'>
      <Text
        fontSize={{ base: 17, sm: 20 }}
        fontWeight='bold'
        color='#111111'
        mb={5}
      >
        Participants
      </Text>
      {mobile && (
        <Flex direction='column' gap={6}>
          {members
            // .concat(members)
            // .concat(members)
            .map((user, index) => (
              <Link
                key={user.user_id}
                href={`/p/${user.user_id}`}
                _hover={{
                  textDecoration: "none",
                }}
              >
                <HStack
                  cursor='pointer'
                  transition='transform .2s'
                  _hover={{
                    transform: "scale(0.97)",
                  }}
                  key={user.user_id}
                  color='#111111'
                  justifyContent='space-between'
                >
                  <Avatar
                    name={user.nickname}
                    src={user.profile_image_s}
                    h='44px'
                    w='44px'
                    background='#A4E6DA'
                  />
                  <Flex direction='column' w='70%'>
                    <Text
                      fontWeight='bold'
                      fontSize={15}
                      display='inline-block'
                      overflow='hidden'
                      textOverflow='ellipsis'
                      whiteSpace='nowrap'
                    >
                      @{user.nickname}
                    </Text>
                    <Text
                      fontWeight={600}
                      fontSize={{ base: 15, sm: 12 }}
                      overflow='hidden'
                      text-overflow='ellipsis'
                      display='-webkit-box'
                      css={{
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                      }}
                      line-clamp='2'
                    >
                      {user.bio}
                    </Text>
                  </Flex>
                  <Link href={`/p/${user.user_id}`}>
                    <Image
                      src={directMessage.src}
                      size={6}
                      pr={3}
                      alt='Share'
                      title='Share Profile'
                    />
                  </Link>
                </HStack>
              </Link>
            ))}
        </Flex>
      )}
      {!mobile && (
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
          {members.map((user, index) => (
            <Link
              href={`/p/${user.user_id}`}
              key={user.user_id}
              _hover={{
                textDecoration: "none",
              }}
            >
              <VStack
                cursor='pointer'
                transition='transform .2s'
                _hover={{
                  transform: "scale(0.97)",
                }}
                key={user.user_id}
                border='1px solid #949494'
                borderRadius={10}
                maxW={180}
                h={240}
                color='#111111'
                textAlign='center'
                p={6}
              >
                <Avatar
                  name={user.nickname}
                  src={user.profile_image_s}
                  size='xl'
                  mb={2}
                  background='#A4E6DA'
                />
                <Text
                  fontWeight='bold'
                  fontSize={15}
                  display='inline-block'
                  maxW='80%'
                  overflow='hidden'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                >
                  @{user.nickname}
                </Text>
                <Text
                  fontWeight={600}
                  fontSize={12}
                  overflow='hidden'
                  text-overflow='ellipsis'
                  display='-webkit-box'
                  css={{
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                  }}
                  line-clamp='2'
                >
                  {user.bio}
                </Text>
              </VStack>
            </Link>
          ))}
        </Grid>
      )}
    </Flex>
  );
};

RoundTable.getInitialProps = async ({ query: { share_string, v } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ""
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/rt/videos?chat_id=${share_string}`;
    if (v !== undefined && v !== null) {
      url_to_use = `${url_to_use}&video_id=${v}`;
    }

    try {
      let videos = await axios.get(
        `${process.env.apiurl}/api/v3/rt/videos?chat_id=${share_string}`
      );
      let users = await axios.get(
        `${process.env.apiurl}/api/v3/rt/users?chat_id=${share_string}`
      );
      let details = await axios.get(
        `${process.env.apiurl}/api/v3/rt/details?chat_id=${share_string}`
      );

      return {
        videos: videos?.data?.data,
        users: users?.data?.data,
        details: details?.data?.data,
      };
    } catch (error) {
      return {};
    }
  } else {
    return Promise.resolve({});
  }
};
export default RoundTable;
