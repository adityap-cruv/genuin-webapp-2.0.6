import React, { useState, useRef, useEffect } from 'react'
import { Player } from '../player/player_swipe'
import { AppActions } from './app_actions'
import { GetAppModal } from './get_app_modal'
import { Flex } from '@chakra-ui/react'

const Videos = ({
  videos,
  loadMoreVideos,
  revenue_enabled,
  user,
  setCurrentVideoIndex = () => { },
  company_id,
  tag_id,
  domain,
  publisher_name,
  handleWheel = () => {
  },
  disableWatch
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const [muted, setMuted] = useState(true)
  const [indexTo, setIndexTo] = useState(videos.length > 2 ? 3 : videos.length)

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
    const client_ip = ''
    const location_lat = ''
    const location_lng = ''
    const minimum_duration = 1
    const maximum_duration = 120
    const device_width = 720
    const device_height = 1280
    const new_m3u8_url = `https://nxs.infy.tv/ssai/master.m3u8?live=0&avod=1&c=${company_id}&min_ad_duration=6&max_ad_duration=300&pod_duration=3005&ad_breaks=-1,-1&pdomain=${domain}&pname=${publisher_name}&u=${url}&t=${tag_id}&dnt=0&width=${device_width}&height=${device_height}&minimum_duration=${minimum_duration}&maximum_duration=${maximum_duration}&placement_id=cnn001${client_ip}${location_lat}${location_lng}`; return new_m3u8_url
  }

  const showGetAppToViewDialog = () => {
    // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  }

  const handleClick = () => {
    setMuted((old) => !old)
  }

  useEffect(() => {
    window.addEventListener('wheel', handleWheel)
    return () => {
      return window.removeEventListener('wheel', handleWheel)
    }
  })

  return (<>

    <Flex
      className='section-content h-100 swipe-container hide-scrollbar'
      direction='initial'
      wrap='wrap'
      w='100%'
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
                video_id_to_use={videos[id]?.video?.share_string}
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
