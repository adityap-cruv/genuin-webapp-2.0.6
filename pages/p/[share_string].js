import React, { useState, useRef, useMemo, useEffect } from 'react'
import axios from 'axios'
import { isValidHttpUrl, Player } from '../../components/player/player'
import { Layout } from '../../components/layout/layout'
import { TopNav } from '../../components/navbar/top_nav'
import { GetAppModal } from '../../components/basic/get_app_modal'
import {
  AppActions,
  MobileShareButton,
  ShareButton
} from '../../components/basic/app_actions'
import { Error } from '../../components/basic/error'
import { SEO } from '../../components/basic/seo'
import { Container } from 'react-bootstrap'
import views from '../../assets/images/views.svg'
import comments from '../../assets/images/comments.svg'
import directMessage from '../../assets/images/direct_message.svg'
import roundtable from '../../assets/images/video-more-options/ic-roundtable.svg'
import InfiniteScroll from 'react-infinite-scroll-component'
import icPreviewPlaceholder from '../../assets/images/video-more-options/ic_preview_placeholder.png'
import { isMobile } from 'react-device-detect'

import {
  Box,
  Image,
  Button,
  Flex,
  Avatar,
  Divider,
  useDisclosure,
  useBreakpointValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Text
} from '@chakra-ui/react'
import { GenuinLoader } from '../../components/basic/genuin_loader'
import dynamic from 'next/dynamic'
import { FontStyle } from '../../constants/font_style'
import { BasicColors } from '../../constants/colors'
// testing
const DownloadAppPopup = dynamic(() => import('../../components/download_app_popup'))

const Profile = ({
  shareString,
  user
}) => {
  const {
    user_id,
    preview_image,
    nickname,
    bio,
    name,
    share_url,
    views,
    replies,
    profile_image
  } = user

  const { hashtags } = user

  const tab1Ref = useRef(null)
  const tab2Ref = useRef(null)
  const tab3Ref = useRef(null)
  const scrollToTop1 = () => tab1Ref.current.scrollIntoView(false)
  const scrollToTop2 = () => tab2Ref.current.scrollIntoView(false)
  const scrollToTop3 = () => tab3Ref.current.scrollIntoView(false)

  const prepareRTVideos = (videos = []) => {
    return videos.reduce((res, { video: { chats, group, chat_id, shareString } }) => {
      return res.concat(
        chats.map((chat) => ({
          video_type: 'rt',
          share_string: shareString,
          video: {
            ...chat,
            video_thumbnail: chat.thumbnail_url,
            description: group.group_description,
            group_name: group.group_name,
            group_dp: group.dp,
            chat_id
          }
        }))
      )
    }, [])
  }

  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
      if (video_type === 'rt') {
        return res.concat(
          video.chats.map((chat) => ({
            video_type: 'rt',
            share_string: video.share_string,
            video: {
              ...chat,
              video_thumbnail: chat.thumbnail_url,
              description: video.group.group_description,
              group_name: video.group.group_name,
              group_dp: video.group.dp,
              chat_id: video.chat_id,
              conversation_id: video.chats[0].conversation_id
            }
          }))
        )
      }
      return res.concat(({ video_type, video }))
    }, [])
  }

  const [publicVideos, setPublicVideos] = useState([])

  const [rtVideos, setRTVideos] = useState([])

  const [videos, setVideos] = useState([])

  const [isLoadingPublic, setIsLoadingPublic] = useState(false)
  const [isLoadingRT, setIsLoadingRT] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)

  const [noMoreVideos, setNoMoreVideos] = useState(false)
  const [noMoreVideosPublic, setNoMoreVideosPublic] = useState(false)
  const [noMoreVideosRT, setNoMoreVideosRT] = useState(false)
  const [noVideos, setNoVideos] = useState(false)

  // Todo improve this logic..it is temporary
  const [muted, setMuted] = useState(true)
  const onClick = () => {
    setMuted(old => !old)
  }

  const loadVideosAll = async () => {
    setIsLoadingAll(true)
    try {
      const allVideosData = await axios.get(
        `${process.env.apiurl}/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=rt&video_types[]=public_video`
      )
      const videos = allVideosData?.data?.data?.videos
      setNoMoreVideos(allVideosData?.data?.data?.end_of_videos)
      if (videos.length > 0) {
        setVideos(prepareFeedVideos(videos))
        setNoVideos(false)
      } else {
        setNoVideos(true)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error :', e)
    }
    setIsLoadingAll(false)
  }

  useEffect(() => {
    loadVideosAll()
  }, [])

  const loadVideosPublic = async () => {
    if (!isLoadingPublic) {
      setIsLoadingPublic(true)
      const res = await axios.get(
        `${process.env.apiurl
        }/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=public_video`
      )

      const newVideos = res?.data?.data?.videos || []
      res?.data?.data?.end_of_videos ? setNoMoreVideosPublic(true) : setNoMoreVideosPublic(false)
      if (newVideos.length !== 0) {
        setPublicVideos(newVideos)
        setNoVideos(false)
      } else {
        setNoVideos(true)
      }
      setIsLoadingPublic(false)
    }
  }

  const loadVideosRT = async () => {
    if (!isLoadingRT) {
      setIsLoadingRT(true)
      const res = await axios.get(
        `${process.env.apiurl
        }/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=rt`
      )

      const newVideos = res?.data?.data?.videos || []
      res?.data?.data?.end_of_videos ? setNoMoreVideosRT(true) : setNoMoreVideosRT(false)
      if (newVideos.length !== 0) {
        const preparedNewVideos = prepareRTVideos(newVideos)
        setRTVideos(preparedNewVideos)
        setNoVideos(false)
      } else {
        setNoVideos(true)
      }
      setIsLoadingRT(false)
    }
  }

  const getMoreVideosPublic = async () => {
    const res = await axios.get(
      `${process.env.apiurl
      }/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=public_video&last_video_type=public_video&last_video_id=${publicVideos[publicVideos.length - 1]?.video?.video_id
      }`
    )
    const newVideos = res?.data?.data?.videos || []
    res?.data?.data?.end_of_videos ? setNoMoreVideosPublic(true) : setNoMoreVideosPublic(false)
    if (newVideos.length !== 0) {
      setPublicVideos(publicVideos.concat(newVideos))
    }
  }

  const getMoreVideosRT = async () => {
    const res = await axios.get(
      `${process.env.apiurl
      }/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=rt&last_video_type=rt&last_video_id=${rtVideos[rtVideos.length - 1]?.video?.conversation_id
      }`
    )

    const newVideos = res?.data?.data?.videos || []
    res?.data?.data?.end_of_videos ? setNoMoreVideosRT(true) : setNoMoreVideosRT(false)

    if (newVideos.length !== 0) {
      const preparedNewVideos = prepareRTVideos(newVideos)

      setRTVideos(rtVideos.concat(preparedNewVideos))
    }
  }

  const getMoreVideos = async () => {
    const videoObj = videos[videos.length - 1]
    const type = videoObj?.video_type
    let id = ''
    if (type === 'rt') {
      id = videoObj?.video?.conversation_id
    } else {
      id = videoObj?.video?.video_id
    }
    const res = await axios.get(
      `${process.env.apiurl
      }/api/v3/public/profile_videos?user_id=${shareString}&video_types[]=public_video&video_types[]=rt&last_video_type=${type}&last_video_id=${id}`
    )
    const newVideos = res?.data?.data?.videos || []
    res?.data?.data?.end_of_videos ? setNoMoreVideos(true) : setNoMoreVideos(false)
    if (newVideos.length !== 0) {
      const preparedFeedVideos = prepareFeedVideos(newVideos)
      setVideos(videos.concat(preparedFeedVideos))
    }
  }

  const profilePic = useMemo(() => {
    if (profile_image) {
      return isValidHttpUrl(profile_image)
        ? profile_image
        : `https://media.qa.begenuin.com/backend_assets/lottie/${profile_image}.png`
    }
    return 'https://media.qa.begenuin.com/backend_assets/lottie/snowman.png'
  }, [profile_image])

  // const [showModalWelcome, setShowModalWelcome] = useState(true);
  // const handleCloseWelcome = () => setShowModalWelcome(false);
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null
    setShowModalAppDownload(false)
  }
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message
    setShowModalAppDownload(true)
  }

  const [showDownloadAppPopup, setShowDownloadAppPopup] = useState(false)
  const handleShowDownloadAppPopup = () => setShowDownloadAppPopup(true)

  const handleCloseDownloadAppPopup = () => setShowDownloadAppPopup(false)

  const {
    isOpen: isOpenPublic,
    onOpen: onOpenPublic,
    onClose: onClosePublic
  } = useDisclosure()
  const {
    isOpen: isOpenRT,
    onOpen: onOpenRT,
    onClose: onCloseRT
  } = useDisclosure()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const mobile = useBreakpointValue({ base: true, md: false })

  //! This is just faking user
  // TODO: find better way to detect mobile early....
  const [isLoadingFake, setIsLoadingFake] = useState(true)
  setTimeout(() => {
    setIsLoadingFake(false)
  }, 100)

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [currentVideoIndexPublic, setCurrentVideoIndexPublic] = useState(0)
  const [currentVideoIndexRT, setCurrentVideoIndexRT] = useState(0)

  const getNextVideo = () => {
    let idx = currentVideoIndex
    if (currentVideoIndex + 1 < videos.length) {
      idx = currentVideoIndex + 1
      changeUrl('all', idx)
      setCurrentVideoIndex(idx)
    }
  }
  const getPrevVideo = () => {
    let idx = 0
    if (currentVideoIndex - 1 >= 0) {
      idx = currentVideoIndex - 1
      changeUrl('all', idx)
      setCurrentVideoIndex(idx)
    }
  }

  const getNextVideoPublic = () => {
    let idx = currentVideoIndexPublic
    if (currentVideoIndexPublic + 1 < publicVideos.length) {
      idx = currentVideoIndexPublic + 1
      changeUrl('public', idx)
      setCurrentVideoIndexPublic(idx)
    }
  }
  const getPrevVideoPublic = () => {
    let idx = 0
    if (currentVideoIndexPublic - 1 >= 0) {
      idx = currentVideoIndexPublic - 1
      changeUrl('public', idx)
      setCurrentVideoIndexPublic(idx)
    }
  }

  const getNextVideoRT = () => {
    let idx = currentVideoIndexRT
    if (currentVideoIndexRT + 1 < rtVideos.length) {
      idx = currentVideoIndexRT + 1
      changeUrl('rt', idx)
      setCurrentVideoIndexRT(idx)
    }
  }
  const getPrevVideoRT = () => {
    let idx = 0
    if (currentVideoIndexRT - 1 >= 0) {
      idx = currentVideoIndexRT - 1
      changeUrl('rt', idx)
      setCurrentVideoIndexRT(idx)
    }
  }

  const changeUrl = (type, idx, replace = true, share_url = null) => {
    if (replace) {
      let videoObj = {}
      if (type === 'all') {
        videoObj = videos[idx]
      } else if (type === 'rt') {
        videoObj = rtVideos[idx]
      } else if (type === 'public') {
        videoObj = publicVideos[idx]
      }
      const shareUrl = videoObj && Object.keys(videoObj).length !== 0 ? videoObj.video?.share_url : ''
      const video_type = videoObj && Object.keys(videoObj).length !== 0 ? videoObj?.video_type : ''
      if (shareUrl) {
        window.history.replaceState(null, '', `..${video_type === 'rt' ? '/rt' : ''}/${shareUrl.split('/').pop()}`)
      }
    } else {
      if (share_url) {
        window.history.pushState(null, '', `..${type === 'rt' ? '/rt' : ''}/${share_url.split('/').pop()}`)
      }
    }
  }

  const setProfileUrl = () => {
    // console.log("Setting profile url")
    window.history.replaceState(null, '', `../p/${nickname}`)
  }

  const [tabIndex, setTabIndex] = useState(0)

  const showGetAppToViewDialog = (e) => {
    if (!showDownloadAppPopup) {
      handleShowModalAppDownload(() => <>Get the app to view this video.</>)
    }
  }

  const showGetAppToSendMessage = () =>
    handleShowModalAppDownload(() => (
      <Text fontWeight={600} lineHeight={8} fontSize={20}>
        Get the Genuin app to send a video message to{' '}
        <strong>@{nickname}</strong>
      </Text>
    ))

  const abbreviateNumber = (value) => {
    let newValue = value
    if (value >= 1000) {
      const suffixes = ['', 'k', 'm', 'b', 't']
      const suffixNum = Math.floor(('' + value).length / 3)
      let shortValue = ''
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum !== 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(precision)
        )
        const dotLessShortValue = (shortValue + '').replace(
          /[^a-zA-Z 0-9]+/g,
          ''
        )
        if (dotLessShortValue.length <= 2) {
          break
        }
      }
      if (shortValue % 1 !== 0) shortValue = shortValue.toFixed(1)
      newValue = shortValue + suffixes[suffixNum]
    }
    return newValue
  }

  const abbreviatedViewsCount = abbreviateNumber(views)
  const abbreviatedVideosCount = abbreviateNumber(user.videos)
  const abbreviatedRepliesCount = abbreviateNumber(replies)

  const titleNameSEO = `${Boolean(name) && name.replace(/\s+/g, '') !== '' ? `${name.trim()} (@${nickname})` : `@${nickname}`} - Genuin • Genuin Videos`
  const viewsValue = abbreviateNumber(views) !== 0 ? ' ' + abbreviateNumber(views) + ' Views.' : ''
  const videosValue = user.videos !== 0 ? ' ' + user.videos + ' Videos.' : ''
  const repliesValue = replies !== 0 ? ' ' + replies + ' Replies.' : ''
  const bioValue = bio ? ' ' + bio.replace(/\n+/g, '\n').replace(/\s+\n+\s+|\s+\n+|\n+\s+|\n+/g, ' ') : ''
  const tagsValue = hashtags && hashtags !== [] && hashtags.length > 0 ? ' ' + hashtags.map((tag) => '#' + tag).join(' ') : ''
  const pipeValue = viewsValue || videosValue || repliesValue || bioValue || tagsValue ? ' |' : ''
  const ldDescription = `${Boolean(name) && name.replace(/\s+/g, '') !== '' ? `${name.trim()} (@${nickname})` : `@${nickname}`} on Genuin${pipeValue}${bioValue}.${viewsValue}${videosValue}${repliesValue}${tagsValue}`

  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'ProfilePage',
    id: `${share_url}`,
    url: `${share_url}`,
    name: `${titleNameSEO}`,
    isPartOf: `${process.env.hostname}#website`,
    primaryImageOfPage: `${profile_image}/#primaryimage`,
    image: `${profile_image}/#primaryimage`,
    thumbnailUrl: `${profile_image}`,
    description: `${ldDescription}`,
    inLanguage: 'en-US',
    actionStatus: 'ActiveActionStatus',
    potentialAction: [
      {
        '@type': 'ReadAction',
        actionStatus: 'ActiveActionStatus',
        target: `${share_url}`,
        image: `${profile_image}`
      },
      {
        '@type': 'WatchAction',
        target: `${share_url}`,
        image: `${profile_image}`
      }
    ]
  })

  const [currentUrl, setCurrentUrl] = useState('')
  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', (event) => {
      // console.log("Here it came",window.location.href)
      // console.log("tabIndex",tabIndex)
      const ls = window.location.href.split('/')
      if (ls && (ls.length === 4 || ls[3] === 'rt')) {
        if (tabIndex === 0) {
          onOpen()
        } else if (tabIndex === 1) {
          onOpenRT()
        } else if (tabIndex === 2) {
          onOpenPublic()
        }
        // }
      }
    })
  }, [])
  return (<>
    <SEO
      openGraphType='profile'
      title={titleNameSEO}
      openGraphTitle={`${name || `@${nickname}`
      } is on Genuin. Connect confidently.`}
      description={ldDescription}
      openGraphDescription={`${name || `@${nickname}`}, ${user.videos
      } Videos, ${abbreviateNumber(views)} Views, ${replies} Replies`}
      urlToCopy={share_url}
      videoPreviewImage={preview_image}
      videoUrl={videos[currentVideoIndex]?.video?.video_url}
    />
    {
      !user_id
        ? (
          <Error />
        ) : isLoadingFake
          ? <GenuinLoader />
          : (<Layout>
            <script
              type='application/ld+json'
              dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }}
            />
            {!(isOpen || isOpenRT || isOpenPublic) && <div style={{ height: '100%' }}>
              <TopNav showGetAppModal={handleShowDownloadAppPopup} isContiner isBlue backgroundColor='white'/>
              <div
                id="scrollableDiv"
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                <Flex
                  className='section-content h-100'
                  direction='column'
                  w='full'
                >
                  <Container className='container-false d-none d-md-block'></Container>
                  <Container
                    style={{
                      height: mobile ? '100%' : 'calc(100% - 70px)'
                    }}
                  >
                    <Flex
                      flexDir={{
                        base: 'column',
                        md: 'row'
                      }}
                      maxH={mobile ? 'calc(100vh - 70px)' : 'calc(100vh - 140px)'}
                      h='full'
                      gap={{ base: 0, md: 'calc(100% / 12)' }}
                      mt={{ base: 16, md: 0 }}
                      justifyContent='space-between'
                    >
                      {mobile && (
                        <Divider
                          opacity={0.2}
                          w='200%'
                          ml={-28}
                          mb={{ base: 4, md: 0 }}
                        />
                      )}
                      <Flex
                        color='#111111'
                        flexDir='column'
                        w={{ base: '100%', md: 'calc(100% / 12 * 2.5)', lg: 'calc(100% / 7 * 1.2)', xl: 'calc(100% / 8)' }}
                        position={mobile ? '' : 'fixed'}
                      >
                        <Flex justifyContent={'space-between'}>
                          <Avatar
                            name={nickname}
                            src={profilePic}
                            size='xl'
                            background='#A4E6DA'
                            mb={2}
                            mt="24px"
                          />
                          {mobile && (
                            <Flex
                              textAlign='center'
                              alignItems='center'
                              justifyContent={'space-between'}
                              w='full'
                              mx={6}
                            >
                              <Flex flexGrow={1} flexDir='column'>
                                <Box
                                  fontWeight='bold'
                                  fontSize={FontStyle.bigTitle.fontSize}
                                  lineHeight={FontStyle.bigTitle.lineHeight}
                                >{abbreviatedViewsCount}</Box>
                                <Box
                                  fontWeight={600}
                                  fontSize={FontStyle.smallSubtitle.fontSize}
                                  lineHeight={FontStyle.smallSubtitle.lineHeight}
                                  color={BasicColors.secondaryColor}>
                                  Views
                                </Box>
                              </Flex>
                              <Flex flexGrow={1} flexDir='column'>
                                <Box
                                  fontWeight='bold'
                                  fontSize={FontStyle.bigTitle.fontSize}
                                  lineHeight={FontStyle.bigTitle.lineHeight}>
                                  {abbreviatedVideosCount}
                                </Box>
                                <Box
                                  fontWeight={600}
                                  fontSize={FontStyle.smallSubtitle.fontSize}
                                  lineHeight={FontStyle.smallSubtitle.lineHeight}
                                  color={BasicColors.secondaryColor}>
                                  Videos
                                </Box>
                              </Flex>
                              <Flex flexGrow={1} flexDir='column'>
                                <Box
                                  fontWeight='bold'
                                  fontSize={FontStyle.bigTitle.fontSize}
                                  lineHeight={FontStyle.bigTitle.lineHeight}>
                                  {abbreviatedRepliesCount}
                                </Box>
                                <Box
                                  fontWeight={600}
                                  fontSize={FontStyle.smallSubtitle.fontSize}
                                  lineHeight={FontStyle.smallSubtitle.lineHeight}
                                  color={BasicColors.secondaryColor}>
                                  Replies
                                </Box>
                              </Flex>
                            </Flex>
                          )}
                        </Flex>
                        <Box
                          fontWeight='700'
                          fontSize={FontStyle.bigTitle.fontSize}
                          lineStyle={FontStyle.bigTitle.lineHeight}>
                          @{nickname}
                        </Box>
                        <Box
                          fontWeight='600'
                          fontSize={FontStyle.title.fontSize}
                          lineHeight={FontStyle.title.lineHeight}>
                          {bio}
                        </Box>
                        {!mobile && (
                          <Flex
                            justifyContent={{
                              base: 'space-around',
                              md: 'space-between'
                            }}
                            textAlign='center'
                            my={4}
                          >
                            <Flex flexGrow={1} flexDir='column'>
                              <Box
                                fontWeight='bold'
                                fontSize={FontStyle.bigTitle.fontSize}
                                lineHeight={FontStyle.bigTitle.lineHeight}
                              >
                                {abbreviatedViewsCount}
                              </Box>
                              <Box
                                fontWeight={600}
                                fontSize={FontStyle.smallSubtitle.fontSize}
                                lineHeight={FontStyle.smallSubtitle.lineHeight}
                                color={BasicColors.secondaryColor}>
                                Views
                              </Box>
                            </Flex>
                            <Flex flexGrow={1} flexDir='column'>
                              <Box
                                fontWeight='bold'
                                fontSize={FontStyle.bigTitle.fontSize}
                                lineHeight={FontStyle.bigTitle.lineHeight}
                              >
                                {abbreviatedVideosCount}
                              </Box>
                              <Box
                                fontWeight={600}
                                fontSize={FontStyle.smallSubtitle.fontSize}
                                lineHeight={FontStyle.smallSubtitle.lineHeight}
                                color={BasicColors.secondaryColor}>
                                Videos
                              </Box>
                            </Flex>
                            <Flex flexGrow={1} flexDir='column'>
                              <Box
                                fontWeight='bold'
                                fontSize={FontStyle.bigTitle.fontSize}
                                lineHeight={FontStyle.bigTitle.lineHeight}
                              >
                                {abbreviatedRepliesCount}
                              </Box>
                              <Box
                                fontWeight={600}
                                fontSize={FontStyle.smallSubtitle.fontSize}
                                lineHeight={FontStyle.smallSubtitle.lineHeight}
                                color={BasicColors.secondaryColor}>
                                Replies
                              </Box>
                            </Flex>
                          </Flex>
                        )}
                        <Flex gap={4} mt={2} mb={{ base: 4, md: 0 }}>
                          <Button
                            color={BasicColors.primaryColor}
                            bgColor='transparent'
                            border='1px solid'
                            h={8}
                            px={5}
                            onClick={showGetAppToSendMessage}
                            id="profile_message"
                          >
                            <Image
                              src={directMessage.src}
                              size={8}
                              pr={3}
                              alt='Share'
                              title='Share Profile'
                            />
                            <Text
                              fontSize={FontStyle.subtitle.fontSize}
                              lineHeight={FontStyle.subtitle.lineHeight}
                              fontWeight='bold'
                            >Message</Text>
                          </Button>
                          {isMobile ? (
                            <MobileShareButton
                              url={currentUrl}
                              description='Hello, visit this profile!'
                              title='Genuin on web'
                            />
                          ) : (
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
                              className="profile_share"
                            />
                          )}
                        </Flex>
                      </Flex>

                      <Tabs
                        onChange={(index) => {
                          setTabIndex(index)
                          scrollToTop1()
                          scrollToTop2()
                          scrollToTop3()
                        }}
                        colorScheme='black'
                        display={{ base: 'contents', md: 'block' }}
                        width={mobile ? 'calc(100% + 24px)' : 'full'}
                        ml={!mobile ? 'calc((100% / 12 * 2) + 100px)' : '0'}
                      >
                        <Divider opacity={0.1} />
                        <TabList
                          borderBottom={0}
                          mb='2px'
                          w={mobile ? 'calc(100% + 24px)' : 'full'}
                          ml={mobile ? '-12px' : 0}
                          backgroundColor="white"
                          top="57px"
                          zIndex={2}
                          position="sticky"
                          className='position-sticky'
                        >
                          <Tab flexGrow={1} className="all_icon" onClick={loadVideosAll}>
                            <AllIcon
                              boxSize={8}
                              color={tabIndex === 0 ? '#111111' : BasicColors.secondaryColor}
                            />
                          </Tab>
                          <Tab flexGrow={1} onClick={loadVideosPublic} className="public_icon">
                            <PublicIcon
                              boxSize={8}
                              color={tabIndex === 1 ? '#111111' : BasicColors.secondaryColor}
                            />
                          </Tab>
                          <Tab flexGrow={1} onClick={loadVideosRT} className="roundtable_icon">
                            <RoundtableIcon
                              boxSize={8}
                              color={tabIndex === 2 ? '#111111' : BasicColors.secondaryColor}
                            />
                          </Tab>
                        </TabList>

                        <TabPanels
                          // maxH='full'
                          height='100%'
                          ml={mobile ? '-12px' : 0}
                          mr={mobile ? '-12px' : 0}
                          style={{
                            // width: mobile ? "auto" : "calc(100% + 24px)",
                            width: 'auto'
                          }}
                        >
                          <TabPanel p={0} pt='1px' h='full'>
                            <Box ref={tab1Ref} />
                            <Videos
                              mobile={mobile}
                              videos={videos}
                              onOpen={onOpen}
                              setCurrentVideoIndex={setCurrentVideoIndex}
                              getMoreVideos={getMoreVideos}
                              noMoreVideos={noMoreVideos}
                              changeUrl={changeUrl}
                              noVideos={noVideos}
                              isLoading={isLoadingAll}
                            />
                          </TabPanel>
                          <TabPanel p={0} pt='1px' h='full'>
                            <Box ref={tab2Ref} />
                            <Videos
                              mobile={mobile}
                              videos={publicVideos}
                              onOpen={onOpenPublic}
                              setCurrentVideoIndex={setCurrentVideoIndexPublic}
                              getMoreVideos={getMoreVideosPublic}
                              noMoreVideos={noMoreVideosPublic}
                              changeUrl={changeUrl}
                              isLoading={isLoadingPublic}
                              noVideos={noVideos}
                            />
                          </TabPanel>
                          <TabPanel p={0} pt='1px' h='full'>
                            <Box ref={tab3Ref} />
                            <Videos
                              mobile={mobile}
                              videos={rtVideos}
                              onOpen={onOpenRT}
                              setCurrentVideoIndex={setCurrentVideoIndexRT}
                              getMoreVideos={getMoreVideosRT}
                              noMoreVideos={noMoreVideosRT}
                              changeUrl={changeUrl}
                              isLoading={isLoadingRT}
                              noVideos={noVideos}
                            />
                          </TabPanel>

                        </TabPanels>
                      </Tabs>
                    </Flex>
                  </Container>
                </Flex>
              </div>
            </div>}

            {isOpen && <Player
              currentVideoIndex={currentVideoIndex}
              videoThumbnail={
                videos[currentVideoIndex]?.video?.video_thumbnail_s
              }
              description={videos[currentVideoIndex]?.video?.description}
              link={videos[currentVideoIndex]?.video?.link}
              videoUrl={videos[currentVideoIndex]?.video?.video_url_m3u8 ?? videos[currentVideoIndex]?.video?.video_url}
              userName={nickname}
              userId={nickname}
              onClickOutsideOfVideo={() => { setProfileUrl(); onClose() }}
              userProfileImage={profile_image}
              rtProfileImage={videos[currentVideoIndex]?.video?.group_dp}
              showGetAppModal={handleShowDownloadAppPopup}
              onEnded={showGetAppToViewDialog}
              getNextVideo={getNextVideo}
              getPrevVideo={getPrevVideo}
              videos={videos}
              autoplay
              video_id_to_use={videos[currentVideoIndex]?.video?.share_string}
              roundTableMode={videos[currentVideoIndex]?.video_type === 'rt'}
              roundTableName={videos[currentVideoIndex]?.video?.group_name}
              roundTableId={videos[currentVideoIndex]?.share_string}
              shareUrl={videos[currentVideoIndex]?.video?.share_url}
              verticalNavigation
              onClick={onClick}
              muted={muted}
            >
              <AppActions
                showGetAppModal={handleShowModalAppDownload}
                userName={nickname}
                link={videos[currentVideoIndex]?.video?.link}
                videoUrl={videos[currentVideoIndex]?.video?.share_url}
                videoDescription={
                  videos[currentVideoIndex]?.video?.description
                }
                videoTitle='Genuin'
                roundTable={videos[currentVideoIndex]?.video_type === 'rt'}
                roundTableName={videos[currentVideoIndex]?.video?.group_name}
                roundTableId={videos[currentVideoIndex]?.share_string}
              />
            </Player>}

            {isOpenRT && <Player
              currentVideoIndex={currentVideoIndexRT}
              videoThumbnail={
                rtVideos[currentVideoIndexRT]?.video?.video_thumbnail_s
              }
              description={rtVideos[currentVideoIndexRT]?.video?.description}
              link={rtVideos[currentVideoIndexRT]?.video?.link}
              videoUrl={rtVideos[currentVideoIndexRT]?.video?.video_url_m3u8 ?? rtVideos[currentVideoIndexRT]?.video?.video_url}
              userName={nickname}
              userId={nickname}
              onClickOutsideOfVideo={() => { setProfileUrl(); onCloseRT() }}
              userProfileImage={profile_image}
              rtProfileImage={rtVideos[currentVideoIndexRT]?.video?.group_dp}
              showGetAppModal={handleShowDownloadAppPopup}
              onEnded={showGetAppToViewDialog}
              getNextVideo={getNextVideoRT}
              getPrevVideo={getPrevVideoRT}
              videos={rtVideos}
              autoplay
              video_id_to_use={rtVideos[currentVideoIndexRT]?.video?.share_string}
              roundTableMode
              roundTableName={rtVideos[currentVideoIndexRT]?.video?.group_name}
              roundTableId={rtVideos[currentVideoIndexRT]?.share_string}
              shareUrl={rtVideos[currentVideoIndexRT]?.video?.share_url}
              verticalNavigation
              onClick={onClick}
              muted={muted}
            >
              <AppActions
                showGetAppModal={handleShowModalAppDownload}
                userName={nickname}
                link={rtVideos[currentVideoIndexRT]?.video?.link}
                videoUrl={rtVideos[currentVideoIndexRT]?.video?.share_url}
                videoDescription={
                  rtVideos[currentVideoIndexRT]?.video?.description
                }
                videoTitle='Genuin'
                roundTable={rtVideos[currentVideoIndexRT]?.video_type === 'rt'}
                roundTableName={rtVideos[currentVideoIndexRT]?.video?.group_name}
                roundTableId={rtVideos[currentVideoIndexRT]?.share_string}
              />
            </Player>}

            {isOpenPublic && <Player
              currentVideoIndex={currentVideoIndexPublic}
              videoThumbnail={
                publicVideos[currentVideoIndexPublic]?.video?.video_thumbnail_s
              }
              description={
                publicVideos[currentVideoIndexPublic]?.video?.description
              }
              link={publicVideos[currentVideoIndexPublic]?.video?.link}
              videoUrl={
                publicVideos[currentVideoIndexPublic]?.video?.video_url_m3u8 ?? publicVideos[currentVideoIndexPublic]?.video?.video_url
              }
              userName={nickname}
              userId={nickname}
              onClickOutsideOfVideo={() => { setProfileUrl(); onClosePublic() }}
              userProfileImage={profile_image}
              showGetAppModal={handleShowDownloadAppPopup}
              onEnded={showGetAppToViewDialog}
              getNextVideo={getNextVideoPublic}
              getPrevVideo={getPrevVideoPublic}
              videos={publicVideos}
              autoplay
              video_id_to_use={publicVideos[currentVideoIndexPublic]?.video?.share_string}
              shareUrl={publicVideos[currentVideoIndexPublic]?.video.share_url}
              verticalNavigation
              onClick={onClick}
              muted={muted}
            >
              <AppActions
                showGetAppModal={handleShowModalAppDownload}
                userName={nickname}
                link={publicVideos[currentVideoIndexPublic]?.video?.link}
                videoUrl={publicVideos[currentVideoIndexPublic]?.video?.share_url}
                videoDescription={
                  publicVideos[currentVideoIndexPublic]?.video?.description
                }
                videoTitle='Genuin'
              />
            </Player>}
            <GetAppModal
              show={showModalAppDownload}
              onClose={handleCloseAppDownload}
              TextNode={getAppComponentRef.current}
            />
            <DownloadAppPopup
              show={showDownloadAppPopup}
              onClose={handleCloseDownloadAppPopup}
            />
            {/* <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} /> */}
          </Layout>
          )
    }
  </>)
}

const Videos = ({
  videos = [],
  onOpen,
  setCurrentVideoIndex,
  getMoreVideos,
  noMoreVideos,
  changeUrl,
  isLoading,
  noVideos
}) => {
  return (
    <>
      {isLoading && <GenuinLoader />}
      {(noVideos) &&
        <div
          style={{
            height: '100%',
            width: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            display: 'flex'
          }}><p
            style={{
              color: BasicColors.secondaryColor,
              fontWeight: '700',
              fontSize: FontStyle.bigTitle.fontSize,
              lineHeight: FontStyle.bigTitle.lineHeight
            }}>No videos yet</p></div>}
      {(!isLoading && !noVideos) &&
        <Box h='full'>
          {Boolean(videos.length) && (
            <InfiniteScroll
              dataLength={videos.length}
              next={getMoreVideos}
              hasMore={!noMoreVideos}
              scrollThreshold={0.75}
              scrollableTarget='scrollableDiv'
              loader={<GenuinLoader height="20vh" />}
            >
              <div
                className="grid-layout"
              >
                {videos.map(({ video, video_type }, index) => (
                  <Flex
                    className={`grid-item video_${index}`}
                    cursor='pointer'
                    transition='transform .2s'
                    _hover={{
                      transform: 'scale(0.97)'
                    }}
                    position='relative'
                    key={video_type === 'rt' ? video.conversation_id : video.video_id}
                    bgColor='black'
                    alignItems='center'
                  >
                    {(
                      <Image
                        src={
                          video_type === 'rt'
                            ? (video.thumbnail_url ?? icPreviewPlaceholder.src)
                            : (video.video_thumbnail ?? icPreviewPlaceholder.src)
                        }
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null // prevents looping
                          currentTarget.src = icPreviewPlaceholder.src
                          if (video_type === 'rt') {
                            video.thumbnail_url = icPreviewPlaceholder.src
                          } else {
                            video.video_thumbnail = icPreviewPlaceholder.src
                          }
                        }}
                        height='full'
                        objectFit='cover'
                        width='full'
                        onClick={() => {
                          // window.location.href = video.share_url;
                          setCurrentVideoIndex(index)
                          onOpen()
                          changeUrl(video_type, index, false, video?.share_url)
                        }}
                      />
                    )}
                    {video_type === 'rt' && (
                      <Flex
                        position='absolute'
                        w='full'
                        h='full'
                        top={0}
                        direction='column'
                        justifyContent='space-between'
                        onClick={() => {
                          setCurrentVideoIndex(index)
                          onOpen()
                          changeUrl(video_type, index, false, video?.share_url)
                        }}
                      >
                        <Flex
                          justifyContent='space-between'
                          top={3}
                          w='full'
                          color='white'
                          fontSize={FontStyle.subtitle.fontSize}
                          fontWeight='bold'
                          p={3}
                        >
                          <Flex>
                            <Image src={views.src} mr={1} mt='3px' h={5} />
                            {video.no_of_views}
                          </Flex>
                          <Flex>
                            <Image src={roundtable.src} h={5} />
                          </Flex>
                        </Flex>
                        <Flex p={3}>
                          <Text
                            fontSize={FontStyle.subtitle.fontSize}
                            fontWeight='bold'
                            color='white'
                            overflow='hidden'
                            text-overflow='ellipsis'
                            display='-webkit-box'
                            css={{
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {video.group_name}
                          </Text>
                        </Flex>
                      </Flex>
                    )}
                    {video_type === 'public_video' && (
                      <Flex
                        position='absolute'
                        gap={3}
                        bottom={3}
                        left={2}
                        color='white'
                        fontSize={FontStyle.subtitle.fontSize}
                        fontWeight='bold'
                      >
                        <Flex>
                          <Image mr={2} src={comments.src} />
                          {video.no_of_conversation}
                        </Flex>
                        <Flex>
                          <Image src={views.src} mr={1} />
                          {video.no_of_views}
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </Box>}</>

  )
}

const RoundtableIcon = (props) => (
  <Icon viewBox='0 0 27 28' {...props}>
    <path
      d='M22.7334 9.73315C22.3334 9.73315 22.0667 9.73316 21.6667 9.8665C20.8667 8.13316 19.4 6.79984 17.8 5.99984C17.9334 5.73317 17.9334 5.33319 17.9334 4.93319C17.9334 2.53319 16.0667 0.666504 13.6667 0.666504C11.2667 0.666504 9.40002 2.53319 9.40002 4.93319C9.40002 5.33319 9.40003 5.59984 9.53337 5.99984C7.80003 6.79984 6.46671 8.2665 5.66671 9.8665C5.40004 9.73316 5.00004 9.73315 4.60004 9.73315C2.20004 9.73315 0.333374 11.5998 0.333374 13.9998C0.333374 16.3998 2.20004 18.2665 4.60004 18.2665C5.00004 18.2665 5.26671 18.2665 5.66671 18.1332C6.46671 19.8665 7.93337 21.1998 9.53337 21.9998C9.40003 22.2665 9.40002 22.6665 9.40002 23.0665C9.40002 25.4665 11.2667 27.3332 13.6667 27.3332C16.0667 27.3332 17.9334 25.4665 17.9334 23.0665C17.9334 22.6665 17.9334 22.3998 17.8 21.9998C19.5334 21.1998 20.8667 19.7332 21.6667 18.1332C21.9334 18.2665 22.3334 18.2665 22.7334 18.2665C25.1334 18.2665 27 16.3998 27 13.9998C27 11.5998 25.1334 9.73315 22.7334 9.73315ZM13.6667 2.79985C14.8667 2.79985 15.8 3.73319 15.8 4.93319C15.8 6.13319 14.8667 7.06649 13.6667 7.06649C12.4667 7.06649 11.5334 6.13319 11.5334 4.93319C11.5334 3.73319 12.4667 2.79985 13.6667 2.79985ZM2.4667 13.9998C2.4667 12.7998 3.40004 11.8665 4.60004 11.8665C5.80004 11.8665 6.73336 12.7998 6.73336 13.9998C6.73336 15.1998 5.80004 16.1332 4.60004 16.1332C3.40004 16.1332 2.4667 15.1998 2.4667 13.9998ZM13.6667 25.1998C12.4667 25.1998 11.5334 24.2665 11.5334 23.0665C11.5334 21.8665 12.4667 20.9332 13.6667 20.9332C14.8667 20.9332 15.8 21.8665 15.8 23.0665C15.8 24.2665 14.8667 25.1998 13.6667 25.1998ZM16.7334 20.1332C15.9334 19.3332 14.8667 18.7998 13.6667 18.7998C12.4667 18.7998 11.4 19.3332 10.6 20.1332C9.2667 19.4665 8.20003 18.3998 7.53337 17.0665C8.33337 16.2665 8.8667 15.1998 8.8667 13.9998C8.8667 12.7998 8.33337 11.7332 7.53337 10.9332C8.20003 9.59985 9.2667 8.53316 10.6 7.8665C11.4 8.6665 12.4667 9.19983 13.6667 9.19983C14.8667 9.19983 15.9334 8.6665 16.7334 7.8665C18.0667 8.53316 19.1334 9.59985 19.8 10.9332C19 11.7332 18.4667 12.7998 18.4667 13.9998C18.4667 15.1998 19 16.2665 19.8 17.0665C19.1334 18.3998 18.0667 19.4665 16.7334 20.1332ZM22.7334 16.1332C21.5334 16.1332 20.6 15.1998 20.6 13.9998C20.6 12.7998 21.5334 11.8665 22.7334 11.8665C23.9334 11.8665 24.8667 12.7998 24.8667 13.9998C24.8667 15.1998 23.9334 16.1332 22.7334 16.1332Z'
      fill={props.color}
    />
  </Icon>
)

const PublicIcon = (props) => (
  <Icon viewBox='0 0 27 28' {...props}>
    <path
      d='M13.258 0.666504C5.87573 0.666504 0 6.65761 0 14.1849C0 20.176 3.91714 25.399 9.19021 27.0888C11.7514 27.8569 14.4633 26.7816 15.6686 24.3237C15.9699 23.5556 16.2712 22.6339 16.2712 21.8658V21.5585C16.2712 21.2513 15.9699 21.0977 15.8192 21.2513C15.0659 21.5585 14.162 21.7122 13.258 21.7122C9.34089 21.5586 6.02637 18.3326 6.17703 14.1849C6.17703 10.1908 9.49156 6.81123 13.4087 6.81123C17.4765 6.81123 20.6403 10.1908 20.6403 14.1849V21.7122C20.6403 23.2484 20.339 24.6309 19.7363 26.0135C23.8041 23.7092 26.6667 19.2543 26.6667 14.1849C26.516 6.81123 20.6403 0.666504 13.258 0.666504Z'
      fill={props.color}
    />
  </Icon>
)
const AllIcon = (props) => (
  <Icon viewBox='0 0 22 24' {...props} className="allIcon">
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M2.90916 1.36364C2.90916 0.610516 2.29864 0 1.54552 0C0.792401 0 0.181885 0.610516 0.181885 1.36364V8.99997C0.181885 9.75309 0.792401 10.3636 1.54552 10.3636C2.29864 10.3636 2.90916 9.75309 2.90916 8.99997V1.36364ZM2.90916 15C2.90916 14.2468 2.29864 13.6364 1.54552 13.6364C0.792401 13.6364 0.181885 14.2468 0.181885 15V22.6364C0.181885 23.3895 0.792401 24 1.54552 24C2.29864 24 2.90916 23.3895 2.90916 22.6364V15ZM11.091 0C11.8441 0 12.4546 0.610516 12.4546 1.36364V9C12.4546 9.75312 11.8441 10.3636 11.091 10.3636C10.3378 10.3636 9.72734 9.75312 9.72734 9V1.36364C9.72734 0.610516 10.3378 0 11.091 0ZM22.0001 1.36364C22.0001 0.610516 21.3896 0 20.6364 0C19.8833 0 19.2728 0.610516 19.2728 1.36364V9C19.2728 9.75312 19.8833 10.3636 20.6364 10.3636C21.3896 10.3636 22.0001 9.75312 22.0001 9V1.36364ZM11.091 13.6364C11.8441 13.6364 12.4546 14.2468 12.4546 15V22.6364C12.4546 23.3895 11.8441 24 11.091 24C10.3378 24 9.72734 23.3895 9.72734 22.6364V15C9.72734 14.2468 10.3378 13.6364 11.091 13.6364ZM22.0001 15C22.0001 14.2468 21.3896 13.6364 20.6364 13.6364C19.8833 13.6364 19.2728 14.2468 19.2728 15V22.6364C19.2728 23.3895 19.8833 24 20.6364 24C21.3896 24 22.0001 23.3895 22.0001 22.6364V15Z'
      fill={props.color}
    />
  </Icon>
)

Profile.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    try {
      const user = await axios.get(
        `${process.env.apiurl}/api/v3/public/user/details?nickname=${share_string}`
      )

      return {
        shareString: share_string,
        user: user?.data?.data
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error :', e)
      return {
        shareString: share_string,
        user: {}
      }
    }
  } else {
    return Promise.resolve({})
  }
}

export default Profile
