import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Error } from "../../components/basic/error";
import { isValidHttpUrl, Player } from "../../components/player/player";
import { Layout } from "../../components/layout/layout";
import { TopNav } from "../../components/basic/top_nav";
import { GetAppModal } from "../../components/basic/get_app_modal";
import { WelcomeModal } from "../../components/basic/welcome_modal";
import { SEO } from "../../components/basic/seo";
import {
  AppActions,
  ShareButton,
  MobileShareButton,
} from "../../components/basic/app_actions";
import { Container } from "react-bootstrap";
import directMessage from "../../assets/images/direct_message_grey.svg";
import icPreviewPlaceholder from "../../assets/images/video-more-options/ic_preview_placeholder.png";
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
  Text,
  VStack,
  Spinner
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { GenuinLoader } from "../../components/basic/genuin_loader";

const RoundTable = ({
  details = {},
  rt_videos = [],
  users = {
    members: [],
    subscribers: [],
  },
  end_of_videos,
  rt
}) => {
  const [videos, setVideos] = useState(rt_videos)
  const [noMoreVideos, setNoMoreVideos] = useState(end_of_videos);
  const loadMoreVideos = async () => {
    try {
      const res = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=${rt}&last_video_id=${videos[videos.length - 1].conversation_id}`
      );
      const newVideos = res?.data?.data?.chats ?? [];
      if (res?.data?.data?.end_of_videos) {
        setNoMoreVideos(true);
      }
      setVideos(videos.concat(newVideos));
    } catch (error) {
      console.log("error in loading more videos :: ", error)
    }
  }
  const { group } = details;
  // const [showModalWelcome, setShowModalWelcome] = useState(true);
  // const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [watchRoundTable, setWatchRoundtable] = useState(true);
  const [direction, setDirection] = useState("forward");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const mobile = useBreakpointValue({ base: true, sm: false });
  //! This is just faking profile loading 
  //TODO: find better way to detect mobile early before rendering....
  const [isLoadingFake, setIsLoadingFake] = useState(true);
  setTimeout(() => {
    setIsLoadingFake(false);
  }, 100)

  const router = useRouter();
  const { asPath } = useRouter();

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    if (router?.query?.v) {
      var idx = videos.findIndex(({ share_string }) => share_string === router?.query?.v)
      if (videos?.[idx]?.share_string) {
        setCurrentVideoIndex(idx);
        window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[idx]?.share_string}`)
        onOpen();
      } else {
        setIsError(true)
      }
    } else if (router?.query?.v !== null && router?.query?.v !== undefined && router?.query?.v == "") {
      setIsError(true)
    }
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
      window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[currentVideoIndex + 1]?.share_string}`)
      setCurrentVideoIndex((old) => old + 1);
    } else {
      window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[0]?.share_string}`)
      setCurrentVideoIndex(0);
    }
  };
  const getPrevVideo = () => {
    if (currentVideoIndex > 0) {
      window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[currentVideoIndex - 1]?.share_string}`)
      setCurrentVideoIndex((old) => old - 1);
    } else {
      window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[totalVideos - 1]?.share_string}`)
      setCurrentVideoIndex(totalVideos - 1);
    }
  };

  // const [firstTime, setFirstTime] = useState(true)

  // useEffect(() => {
  //   if(firstTime){
  //     setFirstTime(false)
  //   }else{
  //     // console.log("use effect to replace url to current video on index change")
  //     window.history.replaceState(null, "", `../rt/${details.share_string}?v=${videos?.[currentVideoIndex]?.share_string}`)
  //   }
  // }, [currentVideoIndex]);

  const setRtUrl = () => {
    // console.log("Came in set rt utl")
    window.history.replaceState(null, "", `../rt/${details.share_string}`)
  }

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <></>);

  const showGetAppToSubscribeDialog = () =>
    handleShowModalAppDownload(() => (
      <>
        Get the app to subscribe to <strong>{group.group_name}</strong>{" "}
        Loop.
      </>
    ));

  const [muted, setMuted] = useState(true);
  const onClick = () => {
    setMuted(old => !old);
  }

  const tags_string =
    group && group.tags !== null &&
      group.tags !== undefined &&
      group.tags.replace(/\s+/g, "") !== ""
      ? ` #${group.tags.split(",").join(" #")}`
      : "";
  const ld_description = `${group && group.group_description !== null &&
    group.group_description !== undefined &&
    group.group_description.replace(/\s+/g, "") !== ""
    ? group.group_description + " | "
    : ""
    }Web3 related loop discussions available on Genuin${tags_string}`;
  const title_name = group?.group_name;
  const share_url = `${process.env.hostname}${asPath.slice(1)}`;
  const ORG_SCHEMA = JSON.stringify({
    "@context": "http://schema.org",
    "@type": "VideoObject",
    id: share_url,
    url: share_url,
    name: title_name,
    isPartOf: `${process.env.hostname}#website`,
    image: `${videos?.[currentVideoIndex]?.thumbnail_url}/#primaryimage`,
    thumbnailUrl: videos?.[currentVideoIndex]?.thumbnail_url,
    contentUrl: videos?.[currentVideoIndex]?.video_url,
    embedUrl: videos?.[currentVideoIndex]?.video_url,
    author: {
      "@type": "Person",
      name: "@" + details?.owner?.nickname,
      url: `${process.env.hostname}p/${details?.owner?.nickname}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Genuin",
      url: process.env.hostname,
    },
    description: ld_description,
    inLanguage: "en-US",
    uploadDate: details.created_at,
    dateCreated: details.created_at,
    dateModified: details.updated_at,
    datePublished: details.created_at,
    potentialAction: [
      {
        "@type": "WatchAction",
        target: share_url,
        image: videos?.[currentVideoIndex]?.thumbnail_url,
      },
    ],
  });
  return (<>
    <SEO
      title={title_name}
      openGraphTitle={group?.group_name}
      videoUrl={videos?.[currentVideoIndex]?.video_url}
      description={ld_description}
      openGraphDescription={group?.group_description}
      videoPreviewImage={details?.preview_image}
    />
    {(!Boolean(group?.group_id) || isError) ? (
      <Error />
    ) : isLoadingFake
      ?
      <GenuinLoader/>
      : (
        <Layout>

          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }}
          />
          {!router.query.v && (
            <TopNav showGetAppModal={showGetAppToViewDialog} isContiner isBlue />
          )}
          <Flex
            className='section-content h-100'
            direction='column'
            position={mobile ? "fixed" : "initial"}
          >
            <Container className='container-false d-none d-md-block'></Container>
            {!router.query.v && (
              <Container
                style={{
                  height: mobile ? "100%" : "calc(100% - 70px)",
                }}
                className={mobile ? "mobile-rt" : ""}
              >
                <Flex
                  flexDir={{
                    base: "column",
                    sm: "row",
                  }}
                  maxH={mobile ? "calc(100vh - 70px)" : "calc(100vh - 140px)"}
                  h='full'
                  gap={{ base: 4, sm: "calc(100% / 12)" }}
                  mt={{ base: 16, md: 0 }}
                  justifyContent='space-between'
                >
                  {mobile && <Divider opacity={0.2} w='120%' ml={-3} />}

                  {/* profile info */}
                  <Flex
                    color='#111111'
                    flexDir='column'
                    w={{ base: "100%", sm: "calc(100% / 12 * 3)" }}
                  >
                    <Flex justifyContent={"space-between"}>
                      <Avatar
                        name={group.group_name}
                        src={group.dp}
                        size='xl'
                        background='#A4E6DA'
                        mb={3}
                        mt="24px"
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
                      {group.group_name}
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
                        minW="90px"
                        onClick={showGetAppToSubscribeDialog}
                      >
                        <Text color='white'>Subscribe</Text>
                      </Button>
                      {mobile ? (
                        <MobileShareButton
                          url={currentUrl}
                          description='Hello, visit this roundtable!'
                          title='Genuin on web'
                        />
                      ) : (
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
                      )}
                    </Flex>
                  </Flex>

                  {/* videos and profiles */}
                  <Flex
                    overflowY='auto'
                    overflowX="hidden"
                    direction='column'
                    gap={4}
                    pb={{ base: 0, sm: 8 }}
                    w='full'
                    h='full'
                    position='relative'
                  >
                    <Flex position='relative'>
                      <Videos
                        mobile={mobile}
                        videos={videos}
                        onOpen={onOpen}
                        setCurrentVideoIndex={setCurrentVideoIndex}
                        setWatchRoundtable={setWatchRoundtable}
                        chatId={details.share_string}
                        end_of_videos={end_of_videos}
                        loadMoreVideos={loadMoreVideos}
                        noMoreVideos={noMoreVideos}
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
                    {mobile && (
                      <Box p='0.3px' w='full' bgColor='black' opacity={0.1} />
                    )}

                    <Participants members={users.members} mobile={mobile} />
                  </Flex>
                </Flex>
              </Container>
            )}

            <Modal
              isOpen={isOpen}
              onClose={onClose}
              scrollBehavior='inside'
            >
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
                    video_id_to_use={videos?.[currentVideoIndex]?.share_string}
                    description={group?.group_description}
                    videoUrl={videos?.[currentVideoIndex]?.video_url_m3u8 ?? videos?.[currentVideoIndex]?.video_url}
                    videoThumbnail={videos?.[currentVideoIndex]?.thumbnail_url}
                    userName={videos?.[currentVideoIndex]?.owner?.nickname}
                    userId={videos?.[currentVideoIndex]?.owner?.nickname}
                    userProfileImage={
                      videos?.[currentVideoIndex]?.owner?.profile_image
                    }
                    onClickOutsideOfVideo={() => {
                      if (router?.query?.v && !(window.location.href.split("/")[3] === "p")) {
                        window.location.href = details.share_string;
                        // window.location.href = `${process.env.hostname}rt/${details.share_string}?v=${videos?.[currentVideoIndex]?.share_string}`
                      }
                      else if (window.location.href.split("/")[3] === "p") {
                        window.location.href = window.location.href;
                      }
                      else {
                        onClose();
                        setWatchRoundtable(false);
                        setRtUrl();
                      }
                    }}
                    roundTableMode
                    roundTableName={group?.group_name}
                    showGetAppModal={handleShowModalAppDownload}
                    getNextVideo={getNextVideo}
                    getPrevVideo={getPrevVideo}
                    watchRoundTable={watchRoundTable}
                    setWatchRoundtable={setWatchRoundtable}
                    autoJumpToNextVideo={watchRoundTable}
                    autoplay={watchRoundTable}
                    onClose={onClose}
                    roundTableId={details.share_string}
                    direction={direction}
                      setDirection={setDirection}
                      muted={muted}
                      onClick={onClick}
                  >
                    <AppActions
                      showGetAppModal={handleShowModalAppDownload}
                      roundTable
                      roundTableName={group?.group_name}
                      roundTableId={details.share_string}
                      link={videos?.[currentVideoIndex]?.link}
                      videoUrl={`${process.env.hostname}rt/${details.share_string}?v=${videos?.[currentVideoIndex]?.share_string}`}
                      videoDescription={group?.group_description}
                      videoTitle='Genuin'
                      watchRoundTable={watchRoundTable}
                    />
                  </Player>
                </ModalBody>
              </ModalContent>
            </Modal>
          </Flex>
          <GetAppModal
            show={showModalAppDownload}
            onClose={handleCloseAppDownload}
            TextNode={getAppComponentRef.current}
          />
          {/* <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} /> */}
        </Layout>
      )}
  </>)


};

const Videos = ({
  videos,
  onOpen,
  setCurrentVideoIndex,
  mobile,
  setWatchRoundtable,
  chatId,
  loadMoreVideos = () => { },
  noMoreVideos
}) => {
  const mainRef = useRef(null)


  const { scrollXProgress } = useScroll({
    container: mainRef
  })

  useMotionValueEvent(scrollXProgress, "change", (latest) => {
    if (latest > .99 && !noMoreVideos) {
      loadMoreVideos();
    }
  })

  return (
    <Box overflowX='auto' whiteSpace='nowrap' pl={0} ref={mainRef}>
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
        <>
          {videos.map((video, index) => (
            <Box
              cursor='pointer'
              transition='transform .2s'
              key={video.thumbnail_url}
              h={{ base: 120, sm: 240 }}
              w={{ base: 67, sm: 135 }}
              display='inline-block'
              mr={index === videos.length - 1 ? 0 : 4}
              position='relative'
              zIndex={index === videos.length - 1 || index === 0 ? 11 : 9}
              bg='black'
              id={`video-${index}`}
            >
              {!mobile && (
                <Box
                  h='full'
                  bgImage={video.thumbnail_url ?? icPreviewPlaceholder.src}
                  bgSize='contain'
                  bgRepeat='no-repeat'
                  bgPosition='center'
                  onClick={() => {
                    onOpen();
                    window.history.replaceState(null, "", `../rt/${chatId}?v=${video.share_string}`)
                    setWatchRoundtable(true);
                    setCurrentVideoIndex(index);
                  }}
                  maxH='full'
                  id={`video-${index}${index}`}
                />
              )}
              {mobile && (
                // this needs to point to the same page but with &video_id=${v} at te end
                <Link href={`${chatId}?v=${video.share_string}`}>
                  <Box
                    h='full'
                    bgImage={video.thumbnail_url ?? icPreviewPlaceholder.src}
                    bgSize='contain'
                    bgRepeat='no-repeat'
                    bgPosition='center'
                    maxH='full'
                    id={`video-${index}${index}`}
                  />
                </Link>
              )}

              <Box
                position='absolute'
                gap={3}
                top={1.5}
                left={2}
                color='white'
                fontSize='15px'
                fontWeight='bold'
              >
                {video.meta_data.duration}s
              </Box>
            </Box>
          ))}
        </>
      }
    </Box>
  );
};

const Participants = ({ members, mobile }) => {
  return (
    <Flex direction='column'>
      <Text
        fontSize={{ base: 17, sm: 20 }}
        fontWeight='bold'
        color='#111111'
        mb={5}
      >
        Co-Hosts
      </Text>
      {mobile && (
        <Flex direction='column' gap={6}>
          {members
            // .concat(members)
            // .concat(members)
            .map((user, index) => (
              <Link
                key={user.nickname}
                href={`/p/${user.nickname}`}
                _hover={{
                  textDecoration: "none",
                }}
                className={`user_${index}`}
              >
                <HStack
                  cursor='pointer'
                  transition='transform .2s'
                  _hover={{
                    transform: "scale(0.97)",
                  }}
                  key={user.nickname}
                  color='#111111'
                  justifyContent='space-between'
                >
                  <Avatar
                    name={user.nickname}
                    src={user.profile_image ? (isValidHttpUrl(user.profile_image)
                      ? user.profile_image
                      : `https://media.qa.begenuin.com/backend_assets/lottie/${user.profile_image}.png`) : "https://media.qa.begenuin.com/backend_assets/lottie/snowman.png"
                    }
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
                  <Link href={`/p/${user.nickname}`}>
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

        <div
          className="user-layout"
        >
          {members.map((user, index) => (
            <Link
              href={`/p/${user.nickname}`}
              key={user.nickname}
              transition='transform .2s'
              _hover={{
                textDecoration: "none",
                transform: "scale(0.97)",
                opacity: ".8 !important"
              }}
              className={`user-item user_${index}`}
            >
              <VStack
                cursor='pointer'
                
                key={user.nickname}
                border='1px solid #949494'
                borderRadius={10}
                maxW={210}
                h={240}
                color='#111111'
                textAlign='center'
                pt={6}
                pb={6}
                pl={3}
                pr={3}
              >
                <Avatar
                  name={user.nickname}
                  src={user.profile_image ? (isValidHttpUrl(user.profile_image)
                    ? user.profile_image
                    : `https://media.qa.begenuin.com/backend_assets/lottie/${user.profile_image}.png`) : "https://media.qa.begenuin.com/backend_assets/lottie/snowman.png"
                  }
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
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                  }}
                  line-clamp='2'
                  maxW="100%"
                >
                  {user.bio}
                </Text>
              </VStack>
            </Link>
          ))}

        </div>
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
    try {
      const videos = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/paginate_videos?chat_id=${share_string}`
      );
      const users = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/users?chat_id=${share_string}`
      );
      const details = await axios.get(
        `${process.env.apiurl}/api/v3/public/rt/details?chat_id=${share_string}`
      );
      var returnProps = {
        rt_videos: videos?.data?.data?.chats,
        users: users?.data?.data,
        details: details?.data?.data,
        end_of_videos: videos?.data?.data?.end_of_videos || false,
        rt: share_string
      }
      returnProps.rt_videos.reverse();
      return returnProps;
    } catch (error) {
      return {};
    }
  } else {
    return Promise.resolve({});
  }
};

export default RoundTable;
