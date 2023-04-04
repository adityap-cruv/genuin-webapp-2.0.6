import { useEffect, useRef, useState } from "react";
import { GetAppModal } from "../basic/get_app_modal";
import { Button } from "react-bootstrap";

import Videos from "../basic/videos";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { HomePageVideo } from "./homepage_video";
import trayArrow from "../../assets/images/tray_arrow.svg";

export const MobileIndexPage = ({
   videos,
   user,
}) => {
   const [showModalAppDownload, setShowModalAppDownload] = useState(false);
   const handleCloseAppDownload = () => setShowModalAppDownload(false);
   const mainRef = useRef(null);
   const [latest, setLatest] = useState(0);
   const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
   const [reelShown, setReelShown] = useState(false);

   const { scrollYProgress } = useScroll({
      container: mainRef
   })

   const [touchStartPointY, setTouchStartPointY] = useState(0)
   const [touchEndPointY, setTouchEndPointY] = useState(0)
   const [innerHeight, setInnerHeight] = useState(0);

   const scrollToReel = () => {
      mainRef.current.scroll({ top: window.innerHeight, behavior: "smooth" });
   }

   const handleWheel = (event) => {
      if (event.deltaY < 0 && reelShown && currentVideoIndex === 0) {
         mainRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" })
      }
   }

   const handleTouchStart = (event) => {
      setTouchStartPointY(event.changedTouches[0].clientY);
   }

   const handleTouchEnd = (event) => {
      setTouchEndPointY(event.changedTouches[0].clientY);
      if ((touchEndPointY > touchStartPointY) && currentVideoIndex === 0) {
         mainRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" })
      }
   }

   const handleResize = (event) => {
      setInnerHeight(window.innerHeight)
   }

   useEffect(() => {
      setInnerHeight(window.innerHeight);
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("resize", handleResize);

      return () => {
         window.removeEventListener("touchstart", handleTouchStart);
         window.removeEventListener("touchend", handleTouchEnd)
         window.addEventListener("resize", handleResize)
      }
   })

   useMotionValueEvent(scrollYProgress, "change", (latest) => {
      setLatest(latest.toPrecision(6));
      if (latest > 0.98444) {
         setReelShown(true);
      } else {
         setReelShown(false);
      }
   })

   return (<>
      <div
         ref={mainRef}
         style={{
            height: "100%",
            overflowY: "auto",
         }}
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
               //todo: update currentVideoIndex
               backgroundImage: `url(${videos[0].video.video_thumbnail_s})`,
               backgroundRepeat: "no-repeat",
               backgroundSize: "cover",
               backgroundPosition: "center",
               filter: 'blur(100px) brightness(50%)',
               backgroundColor: 'black',
               position: "absolute",
               zIndex: -98,
            }}>
         </div>

         <motion.div
            style={{
               height: "50%",
               width: "100%",
               top: "60%",
               display: "flex",
               position: "absolute",
               alignItems: "start",
               opacity: latest < .5 ? 1.5 - (latest * 2) : 0
            }}>
            <div
               style={{
                  height: "50%",
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  paddingTop: "10px",
               }}>
               <div style={{
                  display: "flex",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 900,
                  textAlign: "center",
               }}>
                  <h1 style={{ color: "white" }}>FIND YOUR PEOPLE.<br /> FIND WHAT YOU LOVE.</h1>
               </div>
               <div style={{
                  display: "flex",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "15px",
                  textAlign: "center",
                  paddingRight: "10px",
                  paddingLeft: "10px",
                  paddingTop: "10px"
               }}>
                  <h2 style={{ color: "white" }}>Genuin gives you a place to keep up with your friends and the issues you care about.</h2>
               </div>
               <div
                  style={{
                     paddingTop: "10px",
                     display: "flex",
                     justifyContent: "center",
                     zIndex: 13
                  }}>
                  <Button
                     variant='primary'
                     onClick={() => {
                        console.log(" add get app button.")
                     }}
                     style={{
                        fontSize: 15,
                        padding: "0.275rem 2rem",
                        borderRadius: "0.5rem",
                     }}
                  >
                     Get App
                  </Button>
               </div>
               <div
                  style={{
                     display: "flex",
                     width: "100%",
                     justifyContent: "center",
                     paddingTop: "25px",
                     zIndex: 13
                  }}>
                  <motion.div
                     initial={{ scale: .9 }}
                     animate={{ scale: 1.1 }}
                     transition={{ duration: 1, repeat: Infinity, type: "tween", ease: "easeIn", repeatType: "mirror" }}
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
            </div>
         </motion.div>

         <div
            style={{
               position: "absolute",
               height: "50%",
               width: "100%",
               display: "flex",
               justifyContent: "center",

            }}>
            <motion.div
               style={{
                  height: "fit-content",
                  position: "relative",
                  top: "80px",
                  scale: (latest > .58) ? (latest - .09) * 2 : 1,
                  translateY: (latest < .58) ? `calc(100px * ${latest} * 2)` : `calc(100px * ${1 - latest} * 2)`
               }}>
               <HomePageVideo
                  opacityFrame={latest > .58 ? 1 - latest : 1}
                  videoUrl={videos[0].video.video_url_m3u8 ?? videos[0].video.video_url}
                  videoThumbnail={videos[0].video.video_thumbnail_s}
                  width={innerHeight * (2 / 9)}
               />
            </motion.div>
         </div>
         <div
            style={{
               position: "absolute",
               display: "flex",
               flexDirection: "row",
               left: 0,
               width: "100%",
               height: "100%",
               right: 0,
               zIndex: latest > 0.984444 ? 13 : -1,
               opacity: latest > 0.98444 ? 1 : 0
            }}>
            <Videos
               user={user}
               loadMoreVideos={() => {
                  console.log("loadmore...")
               }}
               videos={videos}
               setCurrentVideoIndex={setCurrentVideoIndex}
               handleWheel={handleWheel}
            />
         </div>
         <div
            style={{
               height: "200%",
               position: "relative",
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