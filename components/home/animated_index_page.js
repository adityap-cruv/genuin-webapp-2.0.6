import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useBreakpointValue } from '@chakra-ui/react'
import Videos from './feed_videos'
import { HomePageVideo } from './homepage_video'
import downloadQR from '../../assets/images/app_download_qr.svg'
import trayArrow from '../../assets/images/tray_arrow.svg'
import backgroundVector from '../../assets/images/genuin_background_logo.png'
import { Footer } from '../basic/footer'

const AnimatedIndexPage = ({
  rtData,
  loadMoreVideos
}) => {
  const videos = rtData.rtVideos
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const mainRef = useRef(null)
  const [latest, setLatest] = useState(0)

  const dynamicWidth = useBreakpointValue({ xl: false, base: true })
  const [{ width, height }, setWH] = useState({ width: 0, height: 0 })

  const scrollToReel = () => {
    mainRef.current.scroll({ top: window.innerHeight, behavior: 'smooth' })
  }

  const resizeHandler = (event) => {
    setWH({ width: window.innerWidth, height: window.innerHeight })
  }

  const handleWheel = (event) => {
    if (event.deltaY < 0 && latest > 0.9899999 && (currentVideoIndex === 0)) {
      mainRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' })
    }
  }
  useEffect(() => {
    setWH({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    container: mainRef
  })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setLatest(latest.toPrecision(6))
  })
  return (<>
    <div
      style={{
        height: '100%',
        overflowY: 'scroll'
      }}
      ref={mainRef}
      className="hide-scrollbar"
    >
      <div
        className="h-100 w-100"
        style={{
          position: 'absolute',
          zIndex: -99,
          backgroundColor: 'black',
          display: 'flex',
          justifyContent: 'center'
        }}>
        <img src={backgroundVector.src} style={{
          opacity: 0.2,
          height: '110%',
          top: '10%',
          position: 'absolute',
          display: latest > 0.985555 ? 'none' : 'block'
        }} />
      </div>
      <div
        className="h-100 w-100"
        style={{
          backgroundImage: `url(${videos.length !== 0 ? videos[currentVideoIndex].video_thumbnail_s : ''})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: latest > 0.985555 ? 1 : 0.7,
          filter: 'blur(100px) brightness(50%)',
          backgroundColor: videos.length === 0 ? 'transparent' : 'black',
          position: 'absolute',
          zIndex: -98
        }}>
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          left: (width - (9 * height / 16)) / 2,
          width: 9 * height / 16,
          height: '100%',
          right: (width - (9 * height / 16)) / 2,
          zIndex: latest > 0.9899999 ? 1031 : -1,
          opacity: latest > 0.9899999 ? 1 : 0
        }}>
        <Videos
          loadMoreVideos={loadMoreVideos}
          rtData={rtData}
          setCurrentVideoIndex={setCurrentVideoIndex}
          handleWheel={handleWheel}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          height: '70%',
          width: dynamicWidth ? '100%' : '70%',
          top: '15%',
          left: dynamicWidth ? '0' : '15%',
          paddingRight: dynamicWidth ? '40px' : '0px',
          zIndex: 1,
          display: 'flex',
          justifyItems: 'center',
          flexFlow: 'row',
          opacity: latest < 0.989999 ? 1 : 0
        }}>
        <motion.div style={{
          translateX: latest < 0.5 ? `calc(50% * ${latest * 2})` : '50%',
          position: 'inherit',
          scale: latest > 0.58 ? latest * 1.775555 : 1,
          height: '100%',
          width: '50%',
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center'
        }}>
          <HomePageVideo
            width={height * (1 / 3)}
            opacityFrame={latest > 0.58 ? (1.5 - latest) : 1}
            videoUrl={videos.length !== 0 ? videos[0].video_url_m3u8 ?? videos[0].video_url : null}
            videoThumbnail={videos.length !== 0 ? videos[0].video_thumbnail_s : ''}
            feedLoading={videos.length === 0}
          />
        </motion.div>

        <motion.div style={{
          opacity: latest < 0.5 ? 1 - (latest * 2) : 0,
          zIndex: -1,
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'end'
        }}>
          <div
            style={{
              width: '50%',
              height: '60%'
            }}>
            <div
              style={{
                width: '100%',
                height: '75%',
                display: 'flex',
                alignItems: 'start',
                flexDirection: 'column',
                color: 'white',
                textAlign: 'start',
                justifyContent: 'center'
              }}>
              <h1
                style={{
                  fontSize: '2.2rem',
                  lineHeight: '3rem',
                  fontWeight: 900
                }}>
                        FIND YOUR PEOPLE.<br />
                        FIND WHAT YOU LOVE.
              </h1>
              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  lineHeight: '1.8rem'
                }}>
                        Genuin gives you a place to keep up with <br />
                        friends and the issues you care about.
              </h2>
            </div>
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'start',
                paddingTop: '20px'
              }}>
              <div
                style={{
                  width: height * (1 / 6)
                }}>
                <img
                  src={downloadQR.src}>
                </img>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {!(latest > 0.985555)
        ? videos.length !== 0
          ? <div
            style={{
              position: 'absolute',
              bottom: '13%',
              left: '50%',
              zIndex: 12,
              display: 'flex'
            }}>
            <motion.div
              style={{
                opacity: latest < 0.58 ? 0.4 - latest : 0
              }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.2 }}
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
          </div>
          : <></>
        : <></>}
      {latest < 0.95555 && <div
        style={{
          zIndex: 12,
          display: 'flex',
          position: 'absolute',
          width: '100%',
          bottom: 0,
          justifyContent: 'space-around'
        }}>
        <Footer/>
      </div>}
      <div
        style={{
          height: 'calc(100% * 2)',
          position: 'relative',
          zIndex: 9
        }}>
      </div>

    </div>
  </>)
}

export default AnimatedIndexPage
