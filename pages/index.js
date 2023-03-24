import { useState } from "react";
import axios from "axios";
import { useBreakpointValue } from "@chakra-ui/react";


import { HomeNav } from "../components/homeNav";
import { AnimatedIndexPage } from "../components/animated_index_page";
import { SimpleIndexPage } from "../components/simple_index_page";
import { SEO } from "../components/seo";

let title = "Genuin";
let metaImage = "https://media.begenuin.com/backend_assets/preview.png";
let description =
  "Genuin is a video-first professional networking platform that allows you to showcase your expertise and connect with other professionals and businesses. Whether you are searching for a job, seeking investment, hiring candidates, or any other networking, Genuin helps you stand out";
let currentUrl = "https://begenuin.com";

const Home = ({
  user = {},
  all_videos = []
}) => {
  const mobile = useBreakpointValue({ base: true, md: false });


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
      <HomeNav variant='light' isContiner />
      {!mobile && <AnimatedIndexPage
        videos={videos}
        user={user}
      />
      }
      {mobile &&
        <SimpleIndexPage
          videos={videos}
          user={user}
        />}
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
