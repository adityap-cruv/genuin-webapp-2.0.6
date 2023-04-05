import { useState, useEffect } from "react";
import axios from "axios";
import { useBreakpointValue } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";


import { HomeNav } from "../components/index/home_nav";
import { AnimatedIndexPage } from "../components/index/animated_index_page";
import { MobileIndexPage } from "../components/index/mobile_index_page";
import { SEO } from "../components/basic/seo";
import { GenuinLoader } from "../components/basic/genuin_loader";
import loadCustomRoutes from "next/dist/lib/load-custom-routes";

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";

const Home = () => {
  const mobile = useBreakpointValue({ base: true, md: false });
  const [videos, setVideos] = useState([]);
  const [isLoadingFake, setIsLoadingFake] = useState(true);

  setTimeout(() => {
    setIsLoadingFake(false)
  }, 100)

  const setPageSession = (session) => {
    localStorage.setItem("page_session", session);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deviceId = localStorage.getItem("device_id")
        var oldPageSession = localStorage.getItem("page_session")
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem("device_id", deviceId);
        }
        const feed_data = await axios.get(
          `${process.env.apiurl}/api/v3/public/home?device_id=${deviceId}&old_page_session=${oldPageSession}`
        );
        const feeds = feed_data?.data?.data?.feeds;
        setPageSession(feed_data?.data?.data?.page_session);
        if (feeds.length > 0) {
          setVideos(videos.concat(feeds))
        }
      } catch (e) {
        console.log("error : ", e)
      }
    }
    fetchData();
  }, [])

  const loadMoreVideos = async () => {
    try {
      const index = videos.length - 1;
      const lastVideoIsRT = videos[index]['feed_type'] === 'rt';
      const lastVideoId = lastVideoIsRT ? videos[index]['feed']['chats'][0]['conversation_id'] : videos[index]['feed']['video_id'];
      const lastVideoParentId = lastVideoIsRT ? videos[index]['feed']['chat_id'] : undefined;
      const more_data = await axios.get(
        `${process.env.apiurl}/api/v3/public/home?device_id=${localStorage.getItem("device_id")}&last_video_id=${lastVideoId}&last_video_parent_id=${lastVideoParentId}&last_video_type=${videos[index]['feed_type']}&page_session=${localStorage.getItem("page_session")}`
      )
      const feeds = more_data?.data?.data?.feeds;
      if (feeds.length > 0) {
        setVideos(videos.concat(feeds));
      }
      
      setPageSession(more_data?.data?.data?.page_session)
    } catch (e) {
      console.log('error : ', e)
    }
  }
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
      <HomeNav variant="light" isContiner />
      {isLoadingFake
        ?
        <>
          <div
            className="bg-gradient-blue h-100 w-100"
            style={{
              position: "absolute",
              zIndex: -99
            }}>
            <GenuinLoader />
          </div>
        </>
        : <>
          {!mobile && <AnimatedIndexPage
            feeds={videos}
            loadMoreVideos={loadMoreVideos}
          />
          }
          {mobile &&
            <MobileIndexPage
              feeds={videos}
              loadMoreVideos={loadMoreVideos}
            />}
        </>
      }
    </>
  );
};

// Home.getInitialProps = async ({ req}) => {
//   const uuid = "2bc36a7a-6ef8-40e0-8549-0b1ecd99000e";
//   console.log("get item  :", uuid)

//     try {
//       const feed_data = await axios.get(
//         `${process.env.apiurl}/api/v3/public/home?device_id=${uuid}`
//       );

//       const feed = feed_data?.data?.data?.feeds;
//       console.log("details : ", feed_data?.data?.data?.feeds)
//       return {
//         // feed: feed,
//       };
//     } catch (error) {
//       console.log("return error")
//       return {};
//     }  
// }
export default Home;
