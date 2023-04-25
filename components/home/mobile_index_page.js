import React, { useEffect, useRef, useState } from 'react'
import { GetAppModal } from '../basic/get_app_modal'
import { Button } from 'react-bootstrap'

import Videos from './../home/feed_videos'
import { useMotionValueEvent, useScroll, motion } from 'framer-motion'
import { HomePageVideo } from './homepage_video'
import trayArrow from '../../assets/images/tray_arrow.svg'
import { datadogLogs } from '@datadog/browser-logs'

export const MobileIndexPage = ({
  rtData,
  loadMoreVideos
}) => {
  const videos = rtData.rtVideos
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const handleCloseAppDownload = () => setShowModalAppDownload(false)
  const mainRef = useRef(null)
  const [latest, setLatest] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1)

  const { scrollYProgress } = useScroll({
    container: mainRef
  })

  const [touchStartPointY, setTouchStartPointY] = useState(0)
  const [innerHeight, setInnerHeight] = useState(0)

  const scrollToReel = () => {
    mainRef.current.scroll({ top: (window.innerHeight + window.innerHeight / 2), behavior: 'smooth' })
  }

  const handleWheel = (event) => {
    if (event.deltaY < 0 && latest > 0.984444 && currentVideoIndex === 0) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }

  const handleTouchStart = (event) => {
    setTouchStartPointY(event.changedTouches[0].clientY)
  }

  const handleTouchEnd = (event) => {
    if ((event.changedTouches[0].clientY > touchStartPointY) && currentVideoIndex === 0) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setInnerHeight(window.innerHeight)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setLatest(latest > 0 ? latest.toPrecision(6) : 0)
  })

  return (<>
    <div
      ref={mainRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        overscrollBehavior: 'none'
      }}
      className="hide-scrollbar"
    >
      <div
        className=" bg-gradient-blue h-100 w-100"
        style={{
          position: 'absolute',
          zIndex: -99
        }}>
      </div>
      <div
        className="h-100 w-100"
        style={{
          // todo: update currentVideoIndex
          backgroundImage: `url(${videos.length !== 0 ? videos[0].video_thumbnail_s : ''})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(100px) brightness(50%)',
          backgroundColor: videos.length !== 0 ? 'black' : 'transparent',
          position: 'absolute',
          zIndex: -98
        }}>
      </div>

      <motion.div
        style={{
          height: '50%',
          width: '100%',
          top: '60%',
          display: 'flex',
          position: 'absolute',
          alignItems: 'start',
          opacity: latest < 0.5 ? 1.5 - (latest * 2) : 0
        }}>
        <div
          style={{
            height: '50%',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            paddingTop: '10px'
          }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <p style={{
              color: 'white',
              lineHeight: '32px',
              fontSize: '24px',
              fontWeight: 900,
              textAlign: 'center'
            }}>FIND YOUR PEOPLE.<br /> FIND WHAT YOU LOVE.</p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingRight: '10px',
            paddingLeft: '10px',
            paddingTop: '10px'
          }}>
            <p style={{
              color: 'white',
              lineHeight: '24px',
              fontSize: '15px',
              fontWeight: 600,
              textAlign: 'center'
            }}>Genuin gives you a place to keep up with your friends and the issues you care about.</p>
          </div>
          <div
            style={{
              paddingTop: '16px',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 13
            }}>
            <Button
              variant='primary'
              onClick={() => {
                window.open('https://install.begenuin.com/86sn/cgs')
                datadogLogs.logger.info('Get App')
              }}
              style={{
                fontSize: 15,
                lineHeight: '24px',
                padding: '8px 24px 8px 24px',
                borderRadius: '8px'
              }}
            >
              Get App
            </Button>
          </div>
          {!(videos.length === 0) && <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              paddingTop: '25px',
              zIndex: 13
            }}>
            <motion.div
              style={{
                opacity: 0.4
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                type: 'tween',
                ease: 'easeIn',
                repeatType: 'mirror'
              }}
            >
              <button
                onClick={scrollToReel}
              >
                <img
                  src={trayArrow.src}
                ></img>
              </button>
            </motion.div>

          </div>}
        </div>
      </motion.div>

      <div
        style={{
          position: 'absolute',
          height: '50%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'

        }}>
        <motion.div
          style={{
            height: '80%',
            position: 'relative',
            top: '80px',
            scale: (latest > 0.58) ? (latest - 0.18) * 2.7 : 1,
            translateY: (latest < 0.58) ? `calc(120px * ${latest} * 2)` : '50%'
          }}>
          <HomePageVideo
            opacityFrame={latest > 0.58 ? 1.5 - latest : 1}
            videoUrl={videos.length !== 0 ? videos[0].video_url_m3u8 ?? videos[0].video_url : ''}
            videoThumbnail={videos.length !== 0 ? videos[0].video_thumbnail_s : ''}
            width={innerHeight * (2 / 9)}
            feedLoading={videos.length === 0}
          />
        </motion.div>
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          left: 0,
          width: '100%',
          height: '100%',
          right: 0,
          zIndex: latest > 0.984444 ? 13 : -1,
          opacity: latest > 0.98444 ? 1 : 0
        }}>
        <Videos
          loadMoreVideos={loadMoreVideos}
          setCurrentVideoIndex={setCurrentVideoIndex}
          handleWheel={handleWheel}
          rtData={rtData}
        />
      </div>
      <div
        style={{
          height: '250%',
          position: 'relative',
          zIndex: 9
        }}>
      </div>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
      />
    </div>
  </>)
}
