import { useState, useRef, useEffect } from "react";
import { GetAppModal } from "./getAppModal";
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useBreakpointValue } from "@chakra-ui/react";
import { Nav } from "react-bootstrap";

import Videos from "./videos";
import { HomePageVideo } from "./homepage_video";
import downloadQR from "../assets/images/app_download_qr.svg"

export const AnimatedIndexPage = ({
   videos,
   user
}) => {
   const [showModalAppDownload, setShowModalAppDownload] = useState(false);
   const handleCloseAppDownload = () => setShowModalAppDownload(false);

   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

   const mainRef = useRef(null);
   const [latest, setLatest] = useState(0)

   const dynamicWidth = useBreakpointValue({ xl: false, base: true })
   const [{ width, height }, setWH] = useState(0)

   const resizeHandler = (event) => {
      setWH({ width: window.innerWidth, height: window.innerHeight })
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
            className="bg-gradient-blue h-100 w-100"
            style={{
               position: "absolute",
               zIndex: -99
            }}>
         </div>
         <div
            className="h-100 w-100"
            style={{
               backgroundImage: `url(${videos[currentVideoIndex].video.video_thumbnail_s})`,
               backgroundRepeat: "no-repeat",
               backgroundSize: "cover",
               backgroundPosition: "center",
               filter: 'blur(100px) brightness(50%)',
               backgroundColor: 'black',
               position: "absolute",
               zIndex: -98,
            }}>
            </div>
            <div
               className="h-100 w-100"
               style={{
                  opacity: latest > .58 ? (-(.58 - latest)) * 3 : 0,
                  backgroundImage: `url(${videos[currentVideoIndex].video.video_thumbnail_s})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: 'blur(60px) brightness(60%)',
                  backgroundColor: 'black',
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
               zIndex: latest > .9899999 ? 10 : -1,
               opacity: latest > .9899999 ? 1 : 0
            }}>
            <Videos
               user={user}
               loadMoreVideos={() => {
                  console.log("loadmore...")
               }}
               videos={videos}
               setCurrentVideoIndex={setCurrentVideoIndex}
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
               translateX: latest < .5 ? `calc(50% * ${latest * 2})` : `calc(50%)`,
               position: "inherit",
               scale: latest > .58 ? latest * 1.775555 : 1,
               height: "100%",
               width: "50%",
               display: "flex",
               justifyContent: "space-evenly",
               alignItems: "center"
            }}>
               <HomePageVideo
                  opacityFrame={latest > .58 ? (1.5 - latest) : 1}
                  videoUrl={videos[currentVideoIndex].video.video_url_m3u8 ?? videos[currentVideoIndex].video.video_url}
                  videoThumbnail={videos[currentVideoIndex].video.video_thumbnail_s}
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
            }}
               className="section-content">
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
                        alignItems: "center"
                     }}>
                     <h1>
                        Igniting curiosity,
                        <br />unlocking potential,
                        <br />shaping culture. Genuinly.
                     </h1>
                  </div>
                  <div
                     style={{
                        height: "100%",
                        width: "30%",
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "center",
                        paddingTop: "20px",
                        zIndex: 2000
                     }}>
                     <img
                        src={downloadQR.src}>
                     </img>
                  </div>
               </div>
            </motion.div>
         </div>
         <div
            style={{
               opacity: latest > .911111 ? 0 : 1,
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
                        © 2022 Genuin Inc.
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
         </div>

         <div
            style={{
               height: "calc(100% * 2)",
               position: "relative",
               zIndex: 9,
            }}>
         </div>
         <GetAppModal
            show={showModalAppDownload}
            onClose={handleCloseAppDownload}
         />
      </div>
   </>);
}