import { useState, useEffect } from "react";
import NextHead from "next/head";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/getAppModal";
import { SEO } from "../components/seo";
import axios from "axios";
import { HomePage } from "./home_page";


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
  const scrollPosChanged = (event) => {
    const homePage = document.getElementById("temp")
    const limit = window.innerHeight * .2;
    // if (homePage.scrollTop > limit) {
    //   homePage.scrollTo({
    //     top: window.innerWidth + 70,
    //     behavior: "smooth"
    //   })
    // }
  }

  // useEffect(() => {
  //   const homePage = document.getElementById('temp')
  //   console.log('home page : ', homePage)
   
  //   homePage.addEventListener("scroll", scrollPosChanged)
  
  //   return homePage.removeEventListener("scroll", scrollPosChanged) 
  // }, [])

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
        height: "100%"
      }}>
        <HomeNav variant='light' isContiner />
        <div style={{
          height: "calc(100% * 2)",
          overflowY: "scroll"
        }}>
          <HomePage></HomePage>
          <div className="h-50"
            style={{
            zIndex: 0
          }}>
            <Videos
              videos={videos}
              loadMoreVideos={() => {
                console.log("load more videos..")
              }}
              user={user}
            />
          </div>
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
