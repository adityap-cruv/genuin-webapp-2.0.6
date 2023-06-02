import React, { useState, useRef, useEffect } from 'react'
import { Player } from '../player/player_swipe'
import { AppActions } from '../basic/app_actions'
import { GetAppModal } from '../basic/get_app_modal'

import { Flex } from '@chakra-ui/react'

const Videos = ({
  rtData,
  loadMoreVideos,
  setCurrentVideoIndex = () => { },
  handleWheel = () => { }
}) => {
  const videos = rtData.rtVideos
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const [muted, setMuted] = useState(true)
  const [indexTo, setIndexTo] = useState(videos.length > 2 ? 3 : videos.length)
  const deepLinkParamsRef = useRef({
    pathName: null,
    hostName: null,
    metaDescription: null,
    metaTitle: null,
    metaPreviewImage: null
  })
  const addMoreVideos = (index) => {
    setIndexTo(old => (old - 2 === index) ? old + 1 : old)
    if (indexTo === videos.length) {
      loadMoreVideos()
    }
  }

  useEffect(() => {
    if (indexTo === 0 && videos.length !== 0) {
      setIndexTo(videos.length > 2 ? 3 : videos.length)
    }
  }, [videos])

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

  const showGetAppToViewDialog = () => {
    // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  }

  const handleClick = () => {
    setMuted((old) => !old)
  }

  useEffect(() => {
    deepLinkParamsRef.current.hostName = window.location.hostname
    deepLinkParamsRef.current.pathName = window.location.pathname
    window.addEventListener('wheel', handleWheel)
    return () => {
      return window.removeEventListener('wheel', handleWheel)
    }
  }, [])
  deepLinkParamsRef.current.metaDescription = `${rtData?.rtData?.group.group_description && rtData?.rtData?.group.group_description + '| '}• Join ${rtData?.rtData?.group_name} to talk about it`
  deepLinkParamsRef.current.metaPreviewImage = rtData?.rtData?.preview_image
  deepLinkParamsRef.current.metaTitle = rtData?.rtData?.group?.group_name
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
                uniqueKey={videos[id].conversation_id}
                key={videos && (videos[0] && videos[0].conversation_id)}
                currentVideoIndex={id}
                videoThumbnail={ videos[id].thumbnail_url_s}
                description={rtData?.rtData?.group?.group_description}
                videoUrl={videos[id].video_url_m3u8 ?? videos[id].video_url }
                userName={videos[id].owner.nickname }
                userId={videos[id].owner.nickname}
                userProfileImage={videos[id].owner.profile_image_s}
                rtProfileImage={rtData?.rtData?.group?.dp_s}
                showGetAppModal={handleShowModalAppDownload}
                onEnded={showGetAppToViewDialog}
                getNextVideo={getNextVideo}
                getPrevVideo={getPrevVideo}
                videos={videos}
                autoplay={id === 0}
                video_id_to_use={videos[id]?.share_string}
                roundTableMode={true}
                roundTableName={rtData?.rtData?.group?.group_name}
                roundTableId={rtData?.rtData?.share_string}
                shareUrl={`${process.env.hostname}/rt/${rtData?.rtData?.share_string}?v=${videos[id]?.share_string}`}
                verticalNavigation
                muted={muted}
                loadMoreVideos={addMoreVideos}
                onClick={handleClick}
                setCurrentVideoIndex={setCurrentVideoIndex}
                disableWatch
                loop={true}
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  userName={videos[id].owner.nickname}
                  link={videos[id]?.link}
                  videoUrl={`${process.env.hostname}rt/${rtData?.rtData?.share_string}?v=${videos[id]?.share_string}`}
                  videoDescription={
                    rtData?.rtData?.description
                  }
                  videoTitle='Genuin'
                  roundTable={true}
                  roundTableName={rtData?.rtData?.group?.group_name}
                  roundTableId={rtData?.rtData?.share_string}
                  deepLinkParams={deepLinkParamsRef.current}
                  sourceId={videos[id]?.share_string}
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
