import React, { useState, useRef, useEffect } from 'react'
import { Player } from '../player/player_swipe'
import { AppActions } from './app_actions'
import { GetAppModal } from './get_app_modal'
import { Flex } from '@chakra-ui/react'
import { isChromium, isDesktop, isIOS, isMacOs, isMobile, isTablet, isWindows } from 'react-device-detect'

const Videos = ({
  videos,
  loadMoreVideos,
  revenue_enabled,
  user,
  setCurrentVideoIndex = () => { },
  infy_params,
  handleWheel = () => { },
  disableWatch = false,
  contextReel = false
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const [muted, setMuted] = useState(true)
  const [indexTo, setIndexTo] = useState(videos.length > 2 ? 3 : videos.length)
  const [{ width, height }, setWH] = useState({ width: 0, height: 0 })
  const [deviceUA, setDeviceUA] = useState('')
  const [deviceOS, setDeviceOS] = useState('')
  const [deviceType, setDeviceType] = useState(0)
  const contentDemoRef = useRef(null)

  const addMoreVideos = (index) => {
    setIndexTo(old => (old - 2 === index) ? old + 1 : old)
    if (indexTo === videos.length) {
      loadMoreVideos()
    }
  }

  const getNextVideo = () => {
    // var idx = currentVideoIndex
    // if(currentVideoIndex+1<videos.length){
    //   idx = currentVideoIndex+1
    //   setCurrentVideoIndex(idx);
    // }
  }

  const getPrevVideo = () => {
    // var idx = 0
    // if(currentVideoIndex-1>=0){
    //   idx = currentVideoIndex-1
    //   setCurrentVideoIndex(idx);
    // }
  }

  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message
    setShowModalAppDownload(true)
  }

  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null
    setShowModalAppDownload(false)
  }

  const getInfyUrl = (url) => {
    const obj = {
      u: url,
      t: infy_params.t,
      c: infy_params.c,
      ad_breaks: infy_params.ad_breaks,
      domain_sp: 'begenuin.com',
      name_sp: 'Genuin',
      // site_page: infy_params.site_page,
      site_id: 'begenuin.com',
      domain_s: 'begenuin.com',
      name_s: 'Genuin',
      site_keywords: infy_params.site_keywords,
      site_publisher_cat: infy_params.site_publisher_cat,
      device_geo_zip: infy_params.device_geo_zip,
      device_ip: infy_params.device_ip,
      device_h: height,
      device_w: width,
      device_ua: deviceUA,
      device_geo_city: infy_params.device_geo_city,
      device_ifa: infy_params.device_ifa,
      device_os: deviceOS,
      device_model: infy_params.device_model,
      device_devicetype: deviceType,
      device_geo_country: infy_params.device_geo_country
      // pname: infy_params.pname,
      // pdomain: infy_params.pdomain
    }
    let infy_url = 'https://nxs.infy.tv/ssai/master.m3u8?live=0&avod=1&dnt=0&min_ad_duration=6&max_ad_duration=300'
    Object.keys(obj).forEach((key) => {
      if (obj[key]) {
        infy_url += `&${key}=${obj[key]}`
      }
    })
    return infy_url
  }

  const showGetAppToViewDialog = () => {
    // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  }

  const handleClick = () => {
    setMuted((old) => !old)
  }
  const setOS = () => {
    if (isMacOs) {
      setDeviceOS('macOS')
    } else if (isWindows) {
      setDeviceOS('windows')
    } else if (isIOS) {
      setDeviceOS('ios')
    } else if (isChromium) {
      setDeviceOS('chromium')
    } else {
      setDeviceOS('linux')
    }
  }

  const setType = () => {
    if (isDesktop) {
      setDeviceType(2)
    } else if (isMobile) {
      setDeviceType(1)
    } else if (isTablet) {
      setDeviceType(5)
    } else {
      setDeviceType(2)
    }
  }

  useEffect(() => {
    setWH({ width: window.innerWidth, height: window.innerHeight })
    setDeviceUA(encodeURIComponent(navigator.userAgent))
    setOS()
    setType()
    window.addEventListener('wheel', handleWheel)
    return () => {
      return window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const scrollToNextVideo = () => {
    contentDemoRef.current.scrollBy(0, height / 2 + 50)
  }

  return (<>

    <Flex
      id='temp'
      className='section-content h-100 swipe-container hide-scrollbar'
      direction='initial'
      wrap='wrap'
      w='100%'
      ref={contentDemoRef}
    >
      {videos.length === 0
        ? <h1>Nothing to show here</h1>
        : (<>
          {videos.slice(0, indexTo).map((video, id) => (
            <>
              <Player
                key={videos[id].video_type === 'rt' ? videos[id].video.conversation_id : videos[id].video.video_id}
                currentVideoIndex={id}
                videoThumbnail={
                  videos[id].video_type === 'rt' ? videos[id].video.thumbnail_url_s : videos[id]?.video?.video_thumbnail_s
                }
                description={videos[id]?.video?.description}
                link={videos[id]?.video?.link}
                videoUrl={videos[id] && videos[id].video && videos[id].video.video_url_m3u8
                  ? (revenue_enabled
                    ? getInfyUrl(videos[id].video.video_url_m3u8)
                    : videos[id].video.video_url_m3u8)
                  : (videos[id] && videos[id].video && videos[id].video.video_url
                    ? videos[id] && videos[id].video && videos[id].video.video_url
                    : null)}
                userName={videos[id] && videos[id].video_type === 'rt' ? videos[id].video.owner.nickname : (user && user.nickname ? user.nickname : null)}
                userId={videos[id] && videos[id].video_type === 'rt' ? videos[id].video.owner.nickname : (user && user.nickname ? user.nickname : null)}
                userProfileImage={videos[id] && videos[id].video_type === 'rt' ? videos[id].video.owner.profile_image_s : (user && user.profile_image_s ? user.profile_image_s : null)}
                rtProfileImage={videos[id]?.video?.group_dp}
                showGetAppModal={handleShowModalAppDownload}
                onEnded={showGetAppToViewDialog}
                getNextVideo={getNextVideo}
                getPrevVideo={getPrevVideo}
                videos={videos}
                autoplay={id === 0}
                v={videos[id]?.video?.share_string}
                roundTableMode={videos[id]?.video_type === 'rt'}
                roundTableName={videos[id]?.video?.group_name}
                roundTableId={videos[id]?.share_string}
                shareUrl={videos[id]?.video?.share_url}
                verticalNavigation
                muted={muted}
                loadMoreVideos={addMoreVideos}
                onClick={handleClick}
                setCurrentVideoIndex={setCurrentVideoIndex}
                disableWatch={disableWatch}
                contextReel={contextReel}
                scrollToNextVideo={scrollToNextVideo}
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  userName={videos[id] && videos[id].video_type === 'rt' ? videos[id].video.owner.nickname : (user && user.nickname ? user.nickname : null)}
                  link={videos[id]?.video?.link}
                  videoUrl={videos[id]?.video?.share_url}
                  videoDescription={
                    videos[id]?.video?.description
                  }
                  videoTitle='Genuin'
                  roundTable={videos[id]?.video_type === 'rt'}
                  roundTableName={videos[id]?.video?.group_name}
                  roundTableId={videos[id]?.share_string}
                />
              </Player>
            </>

          ))}
        </>)
      }

      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
    </Flex>
  </>)
}

export default Videos
