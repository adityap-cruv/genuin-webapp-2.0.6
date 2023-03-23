import { Carousel } from "react-bootstrap";

import { useState, useRef, useEffect } from "react";
import { GetAppModal } from "../components/getAppModal";
import { SEO } from "../components/seo";
import axios from "axios";
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { HomePageVideo } from "../components/homepage_video";

import { HomeNav } from "../components/homeNav";
import Videos from "../components/videos";
import { useBreakpointValue } from "@chakra-ui/react";
import { useDebounce } from "use-debounce";

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

  const dynamicWidth = useBreakpointValue({xl: false, base: true})
  const [width, setWidth] = useState(0)
  const [horizontalMargin, setHorizontalMargin] = useState(0)
  
  const resizeHandler = (event) => {
    setWidth((9 * window.innerHeight / 16));
    setHorizontalMargin((window.innerWidth - width) / 2)
  }
  useEffect(() => {
    setWidth((9 * window.innerHeight / 16));
    setHorizontalMargin((window.innerWidth - width) / 2)
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    }
  },[])

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
      <div
        style={{
          height: "100%",
          overflowY: "scroll"
        }}
        ref={mainRef}
        className="hide-scrollbar"
      >
        <HomeNav variant='light' isContiner />
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
            opacity: latest > .58 ? (-(.58 - latest)) * 3 : 0,
            backgroundImage: `url(${videos[0].video.video_thumbnail_s})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: 'blur(60px) brightness(60%)',
            backgroundColor: 'black',
            position: "absolute",
            zIndex: -98
          }}>
        </div>
        {latest > .9899999 && <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            left: horizontalMargin,
            width: width,
            height: "100%",
            right: horizontalMargin,
            zIndex: 10
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
            width: dynamicWidth ? "100%" :"70%",
            top: "15%",
            left: dynamicWidth ? "0" : "15%",
            paddingRight: dynamicWidth ? "40px" : "0px",
            zIndex: 1,
            display: "flex",
            justifyItems: "center",
            flexFlow: 'row'
        }}>
          <motion.div style={{
            translateX: latest < .5 ? `calc(50% * ${latest * 2})` : `calc(50%)`,
            position: "inherit",
            scale: latest > .58 ? latest * 1.7 : 1,
            height: "100%",
            width: "50%",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center"
          }}>
            <HomePageVideo
              opacityFrame={latest > .58 ? (1.5 - latest) : 1}
              videoUrl={videos[0].video.video_url_m3u8}
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
    </>
  );
};

Home.getInitialProps = async () => {
  const nickname = "himanshu";
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
