import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'

import mobileFrame from '../../assets/images/mobile_frame.png'
import { DynamicPlayer } from '../player/dynamic_player'
import { GenuinLoader } from '../basic/genuin_loader'

export const HomePageVideo = ({
  videoUrl,
  opacityFrame,
  videoThumbnail,
  width = 300,
  feedLoading
}) => {
  const [displayThumbnail, setDisplayThumbnail] = useState(true)
  return (<>
    <div
      style={{
        position: 'relative',
        height: '100%',
        width
      }}
    >
      <div style={{
        position: 'absolute',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}>
        {feedLoading && <GenuinLoader />}
      </div>
      <div
        className="index-player-border"
        style={{
          position: 'absolute'
        }}
      >
        {!feedLoading && <DynamicPlayer
          muted={true}
          url={videoUrl}
          uniqueKey="feed_index_player"
          onReady={() => {
            setDisplayThumbnail(false)
          }}
          autoPlay={true}
        />}

        {displayThumbnail && <Box
          backgroundImage={`url(${videoThumbnail})`}
          backgroundColor={videoThumbnail ? 'transparent' : 'lightgrey'}
          backgroundRepeat='no-repeat'
          backgroundSize='cover'
          backgroundPosition='center'
          width='100%'
          h='100%'
          filter='blur(10px)'
        />}
      </div>
      <img
        style={{
          position: 'absolute',
          opacity: opacityFrame
        }}
        src={mobileFrame.src}>
      </img>
    </div>
  </>)
}
