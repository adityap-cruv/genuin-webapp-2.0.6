import { Carousel } from "react-bootstrap";
import { InstallApp } from "../components/installApp";

import { useState, useRef } from "react";
import NextHead from "next/head";
import { GetAppModal } from "../components/getAppModal";
import { SEO } from "../components/seo";
import axios from "axios";
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { HomePageVideo } from "../components/homepage_video";

import favicon from "../images/favicon.ico";
import { HomeNav } from "../components/homeNav";
import Videos from "../components/videos";

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";

const Home = ({
  user = {},
  all_videos = []
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const handleCloseAppDownload = () => setShowModalAppDownload(false);

  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
      if (video_type === "rt") {
        return res.concat(({ video_type: video_type, share_string: video.share_string, video: video }))
      }
      else {
        return res.concat(({ video_type: video_type, video: video }))
      }
    }, []);
  }

  const [videos, setVideos] = useState(prepareFeedVideos(all_videos));
  
  const [activeIndex, setActiveIndex] = useState(0);
  const mainRef = useRef(null);
  const [latest, setLatest] = useState(0)

  const { scrollYProgress } = useScroll({
    container: mainRef
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setLatest(latest.toPrecision(6))
  })

  return (
    <>
      <SEO
        title={title}
        openGraphTitle={title}
        description={description}
        openGraphDescription={description}
        urlToCopy={currentUrl}
        videoPreviewImage={metaImage}
        includeHead={false}
      />
      <NextHead>
        <link rel='shortcut icon' href={favicon.src} type='image/x-icon' />
      </NextHead>
      <div style={{
        height: "100%",
        overflowY: "scroll"
      }}
      ref={mainRef}>
        <HomeNav variant='light' isContiner />
        <div
          className="bg-gradient-blue h-100 w-100"
          style={{
            position: "absolute",
            zIndex: -99
        }}>
        </div>
        {latest > .9899999 && <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            left: "33.33%",
            width: "33.33%",
            height: "100%",
            zIndex: 100
          }}>
          <Videos
            user={user}
            loadMoreVideos={() => {
              console.log("loadmore...")
            }}
            videos={videos}
          />
        </div>}
        
        {latest < .989999 && <div
          style={{
            position: "absolute",
            height: "70%",
            width: "70%",
            top: "15%",
            left: "15%",
            zIndex: 1,
            display: "flex",
            justifyItems: "center",
            flexFlow: 'row'
        }}>
          <motion.div style={{
            translateX: latest < .5 ? `calc(50% * ${latest * 2})` : `calc(50%)`,
            position: "inherit",
            scale: latest > .5 ? latest * 1.7 : 1,
            opacity: latest > .5 ? (1 - latest) : 1,
            height: "100%",
            width: "50%",
            display: "flex",
            justifyContent: "space-evenly"
          }}>
            <HomePageVideo
              videoUrl={videos[3].video.video_url_m3u8}
            />
          </motion.div>

          <motion.div style={{
            opacity: latest < .5  ? 1 - (latest * 2) : 0,
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
                height: "100%",
              }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center"
              }}>
                <Carousel
                  controls={false}
                  interval={2000}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                  activeIndex={activeIndex}
                >
                  <Carousel.Item>
                    <h1>
                      Learn Web3 via
                      <br />
                      bite-sized content
                    </h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Connect people in the Web3 business</h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Showcase your Web3 knowledge</h1>
                  </Carousel.Item>
                  <Carousel.Item>
                    <h1>Initiate conversation about Web3</h1>
                  </Carousel.Item>
                </Carousel>
              </div>
              {/* <div
                style={{
                  height: "25%",
                  width: "100%",
                  display: "flex",
                  alignItems: "start"
                }}>
                <InstallApp />
              </div> */}
            </div>
          </motion.div>
        </div>}
        <div
          style={{
            height: "calc(100% * 5)",
            position: "relative",
            zIndex: 99,
        }}>
        </div>       
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
        />
      </div>
    </>
  );
};

Home.getInitialProps = async () => {
  const nickname = "srk";
  try {
    const all_videos = await axios.get(
      `${process.env.apiurl}/api/v3/public/profile_videos?user_id=${nickname}&video_types[]=public_video`
    );
    const user = await axios.get(
      `${process.env.apiurl}/api/v3/public/user/details?nickname=${nickname}`
    );
    return {
      user: user?.data?.data,
      all_videos: all_videos?.data?.data?.videos,
    };
  } catch (error) {
    console.log("return error")
    return {};
  }
}
export default Home;
