import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { background, useBreakpointValue } from "@chakra-ui/react";
import { Nav } from "react-bootstrap";
import Videos from "../index/feed_videos";
import { HomePageVideo } from "./homepage_video";
import downloadQR from "../../assets/images/app_download_qr.svg"
import trayArrow from "../../assets/images/tray_arrow.svg";
import backgroundVector from "../../assets/images/genuin_background_logo.png"

export const AnimatedIndexPage = ({
   feeds,
   loadMoreVideos
}) => {
   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
   const [reelShown, setReelShown] = useState(false);

   const mainRef = useRef(null);
   const [latest, setLatest] = useState(0)

   const dynamicWidth = useBreakpointValue({ xl: false, base: true })
   const [{ width, height }, setWH] = useState(0)

   const scrollToReel = () => {
      mainRef.current.scroll({ top: window.innerHeight, behavior: "smooth" });
   }

   const resizeHandler = (event) => {
      setWH({ width: window.innerWidth, height: window.innerHeight })
   }

   const handleWheel = (event) => {
      if (event.deltaY < 0 && reelShown && (currentVideoIndex === 0)) {
         mainRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" })
      }
   }
   useEffect(() => {
      setWH({ width: window.innerWidth, height: window.innerHeight })
      window.addEventListener('resize', resizeHandler);
      return () => {
         window.removeEventListener('resize', resizeHandler);
      }
   }, [])

   const { scrollYProgress } = useScroll({
      container: mainRef
   });
   useMotionValueEvent(scrollYProgress, "change", (latest) => {
      setLatest(latest.toPrecision(6))
      if (latest > .9899995) {
         setReelShown(true)
      } else {
         setReelShown(false);
      }
   })
   return (<>
      <div
         style={{
            height: "100%",
            overflowY: "scroll"
         }}
         ref={mainRef}
         className="hide-scrollbar"
      >
         <div
            className="h-100 w-100"
            style={{
               position: "absolute",
               zIndex: -99,
               backgroundColor: "black",
               display: "flex",
               justifyContent: "center",
            }}>
            <img src={backgroundVector.src} style={{opacity: .2, top: "10vh", position: "absolute", display: latest > .985555 ? "none": "block" }}/>
         </div>
         <div
            className="h-100 w-100"
            style={{
               backgroundImage: `url(${feeds.length != 0 ?feeds[currentVideoIndex]['feed_type'] === 'rt'
                  ? feeds[currentVideoIndex]['feed']['chats'][0]['thumbnail_url_s']
                  : feeds[currentVideoIndex]['feed']['video_thumbnail_s'] : ""})`,
               backgroundRepeat: "no-repeat",
               backgroundSize: "cover",
               backgroundPosition: "center",
               opacity: reelShown ? 1 : 0.7,
               filter: 'blur(100px) brightness(50%)',
               backgroundColor: feeds.length == 0 ? 'transparent' :'black',
               position: "absolute",
               zIndex: -98,
            }}>
         </div>
         <div
            style={{
               position: "absolute",
               display: "flex",
               flexDirection: "row",
               left: (width - (9 * height / 16)) / 2,
               width: 9 * height / 16,
               height: "100%",
               right: (width - (9 * height / 16)) / 2,
               zIndex: latest > .9899999 ? 1031 : -1,
               opacity: latest > .9899999 ? 1 : 0
            }}>
            <Videos
               loadMoreVideos={loadMoreVideos}
               feeds={feeds}
               setCurrentVideoIndex={setCurrentVideoIndex}
               handleWheel={handleWheel}
            />
         </div>

         <div
            style={{
               position: "absolute",
               height: "70%",
               width: dynamicWidth ? "100%" : "70%",
               top: "15%",
               left: dynamicWidth ? "0" : "15%",
               paddingRight: dynamicWidth ? "40px" : "0px",
               zIndex: 1,
               display: "flex",
               justifyItems: "center",
               flexFlow: 'row',
               opacity: latest < .989999 ? 1 : 0
            }}>
            <motion.div style={{
               translateX: latest < .5 ? `calc(50% * ${latest * 2})` : "50%",
               position: "inherit",
               scale: latest > .58 ? latest * 1.775555 : 1,
               height: "100%",
               width: "50%",
               display: "flex",
               justifyContent: "space-evenly",
               alignItems: "center"
            }}>
               <HomePageVideo
                  width={height * (1 / 3)}
                  opacityFrame={latest > .58 ? (1.5 - latest) : 1}
                  videoUrl={feeds.length != 0 ? feeds[0]['feed_type'] === 'rt'
                     ? feeds[0]['feed']['chats'][0]['video_url_m3u8'] ?? feeds[0]['feed']['chats'][0]['video_url']
                     : feeds[0]['feed']['video_url_m3u8'] ?? feeds[0]['feed']['video_url'] : null}
                  videoThumbnail={feeds.length != 0 ? feeds[0]['feed_type'] === 'rt'
                     ? feeds[0]['feed']['chats'][0]['thumbnail_url_s']
                     : feeds[0]['feed']['video_thumbnail_s'] : ""}
                  feedLoading={feeds.length === 0}
               />
            </motion.div>

            <motion.div style={{
               opacity: latest < .5 ? 1 - (latest * 2) : 0,
               zIndex: -1,
               position: "relative",
               width: "100%",
               height: "100%",
               display: "flex",
               justifyContent: "end"
            }}>
               <div
                  style={{
                     width: "50%",
                     height: "60%",
                  }}>
                  <div
                     style={{
                        width: "100%",
                        height: "75%",
                        display: "flex",
                        alignItems: "start",
                        flexDirection: "column",
                        color: "white",
                        textAlign: "start",
                        justifyContent: "center"
                     }}>
                     <h1
                        style={{
                           fontSize: "2.2rem",
                           lineHeight: "3rem",
                           fontWeight: 900
                        }}>
                        FIND YOUR PEOPLE.<br />
                        FIND WHAT YOU LOVE.
                     </h1>
                     <h2
                        style={{
                           fontSize: "1.3rem",
                           fontWeight: 600,
                           lineHeight: "1.8rem"
                        }}>
                        Genuin gives you a place to keep up with <br />
                        friends and the issues you care about.
                     </h2>
                  </div>
                  <div
                     onClick={() => {
                        console.log("on click clicked ...");
                     }}
                     style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "start",
                        paddingTop: "20px",
                     }}>
                     <div
                        style={{
                           width: height * (1 / 6),
                        }}>
                        <img
                           src={downloadQR.src}>
                        </img>
                     </div>
                  </div>

               </div>
            </motion.div>
         </div>

         {!reelShown
            ? feeds.length != 0
               ? <div
                  style={{
                     position: "absolute",
                     bottom: "13%",
                     left: "50%",
                     zIndex: 12,
                     display: "flex"
                  }}>
                  <motion.div
                     style={{
                        opacity: .4
                     }}
                     initial={{ scale: 1 }}
                     animate={{ scale: 1.2 }}
                     transition={{
                        duration: .6,
                        repeat: Infinity,
                        type: "tween",
                        ease: "easeIn",
                        repeatType: "mirror"
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
         {latest < .95555 && <div
            style={{
               zIndex: 12,
               display: "flex",
               position: 'absolute',
               width: "100%",
               bottom: 0,
               justifyContent: "space-around"
            }}>
            <div
               className="container-footer container"
               style={{
                  position: "absolute",
                  bottom: 0,
                  display: "flex",
                  paddingBottom: "10px",
                  justifyContent: "space-between",
                  width: "100%"
               }}>
               <Nav as='ul'>
                  <Nav.Item as='li'>
                     <Nav.Link
                        style={{ opacity: 0.5 }}
                        href='/'
                        className='pr-0'
                     >
                        © 2023 Genuin Inc.
                     </Nav.Link>
                  </Nav.Item>
               </Nav>
               <Nav
                  className='justify-content-start justify-content-md-end'
                  as='ul'
               >
                  <Nav.Item as='li'>
                     <Nav.Link
                        style={{ opacity: 0.5 }}
                        target="_blank"
                        href={`/content_demo?value=rt_123f373977001407`}
                     >
                        Life at Genuin
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                     <Nav.Link
                        style={{
                           opacity: 0.5,
                           paddingLeft: "0px",
                           paddingRight: "0px",
                        }}
                        href={void 0}
                        eventKey='link-2'
                     >
                        |
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                     <Nav.Link style={{ opacity: 0.5 }} href='/terms'>
                        Terms of Service
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                     <Nav.Link
                        style={{
                           opacity: 0.5,
                           paddingLeft: "0px",
                           paddingRight: "0px",
                        }}
                        href={void 0}
                     >
                        |
                     </Nav.Link>
                  </Nav.Item>
                  <Nav.Item as='li'>
                     <Nav.Link style={{ opacity: 0.5 }} href='/privacy'>
                        Privacy Policy
                     </Nav.Link>
                  </Nav.Item>
               </Nav>
            </div>
         </div>}
         <div
            style={{
               height: "calc(100% * 2)",
               position: "relative",
               zIndex: 9,
            }}>
         </div>
         
      </div>
   </>);
}