import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Player } from "../components/player/player_swipe";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/getAppModal";
import {
  AppActions
} from "../components/appActions";
import { Error } from "../components/error";
import {
  Flex,
  useBreakpointValue
} from "@chakra-ui/react";

const Profile = ({
  user = {},
  all_videos = []
}) => {
  const {
    user_id,
    nickname,
    profile_image,
  } = user;

  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
        if (video_type === "rt"){
            return res.concat(
                video.chats.map((chat) => ({
                  video_type: "rt",
                  share_string: video.share_string,
                  video: {
                    ...chat,
                    video_thumbnail: chat.thumbnail_url,
                    description: video.group.group_description,
                    group_name: video.group.group_name,
                    group_dp: video.group.dp,
                    chat_id: video.chat_id,
                  },
                }))
            )
        }else{
          return res.concat(({video_type:video_type, video: video}))
        }
    }, []);
  }

  const preparedFeedVideos = prepareFeedVideos(all_videos)
  const [videos, setVideos] = useState(preparedFeedVideos);

  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null;
    setShowModalAppDownload(false);
  };
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message;
    setShowModalAppDownload(true);
  };

  const mobile = useBreakpointValue({ base: true, md: false });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const getNextVideo = () => {
    // var idx = currentVideoIndex
    // if(currentVideoIndex+1<videos.length){
    //   idx = currentVideoIndex+1
    //   setCurrentVideoIndex(idx);
    // }
  };
  const getPrevVideo = () => {
    // var idx = 0
    // if(currentVideoIndex-1>=0){
    //   idx = currentVideoIndex-1
    //   setCurrentVideoIndex(idx);
    // }
  };

  const showGetAppToViewDialog = () => {
    // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  }

  const getInfyUrl = (url) => {
    var client_ip = ``;
    var location_lat = ``;
    var location_lng = ``;
    var minimum_duration = 1;
    var maximum_duration = 120;
    var device_width = 720;
    var device_height = 1280;
    var new_m3u8_url = `https://nxs.infy.tv/ssai/master.m3u8?live=0&avod=1&c=1048&min_ad_duration=6&max_ad_duration=300&pod_duration=3005&ad_breaks=-1,-1&pdomain=cnn.com&pname=CNN&u=${url}&t=2071&dnt=0&width=${device_width}&height=${device_height}&minimum_duration=${minimum_duration}&maximum_duration=${maximum_duration}&placement_id=cnn001${client_ip}${location_lat}${location_lng}`;
    // console.log('new_m3u8_url', new_m3u8_url);
    return new_m3u8_url;
  }

  return !Boolean(user_id) ? (
    // <Error />
    <>
    Loading. . .
    </>
  ) : (
    <Layout>
      <Flex
        className='section-content h-100 swipe-container'
        direction='initial'
        wrap='wrap'
        w='full'
        // position={mobile ? "fixed" : "initial"}
      >
        {videos.length > 0 ? (
          <>
            {videos.map((video, id) => (
              <Player
                currentVideoIndex={id}
                videoThumbnail={
                  videos[id]?.video?.video_thumbnail
                }
                description={videos[id]?.video?.description}
                link={videos[id]?.video?.link}
                videoUrl={videos[id] && videos[id]['video'] && videos[id]['video']['video_url_m3u8']?getInfyUrl(videos[id]['video']['video_url_m3u8']) : (videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']?videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']: null) }
                userName={nickname}
                userId={nickname}
                userProfileImage={profile_image}
                rtProfileImage={videos[id]?.video?.group_dp}
                showGetAppModal={handleShowModalAppDownload}
                onEnded={showGetAppToViewDialog}
                getNextVideo={getNextVideo}
                getPrevVideo={getPrevVideo}
                videos={videos}
                autoplay
                video_id_to_use={videos[id]?.video?.share_string}
                roundTableMode={videos[id]?.video_type === "rt"}
                roundTableName={videos[id]?.video?.group_name}
                roundTableId={videos[id]?.share_string}
                shareUrl={videos[id]?.video?.share_url}
                verticalNavigation
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  userName={nickname}
                  link={videos[id]?.video?.link}
                  videoUrl={videos[id]?.video?.share_url}
                  videoDescription={
                    videos[id]?.video?.description
                  }
                  videoTitle='Genuin'
                  roundTable={videos[id]?.video_type === "rt"}
                  roundTableName={videos[id]?.video?.group_name}
                  roundTableId={videos[id]?.share_string}
                />
              </Player>
            ))}
            </>
          ) : (
            <>
              <h1>Nothing to show here</h1>
            </>
          )}
      </Flex>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
    </Layout>
  );
};


Profile.getInitialProps = async ({ query: { share_string } }) => {
    if(share_string == undefined || share_string == null || share_string == ""){
        share_string = "dingcrypto";
    }
    if (
        share_string !== undefined &&
        share_string !== null &&
        share_string !== ""
    ) {
        try {
          const all_videos = await axios.get(
              `https://api.begenuin.com/api/v3/public/profile_videos?user_id=${share_string}&video_types[]=public_video`
          );
          const user = await axios.get(
              `https://api.begenuin.com/api/v3/public/user/details?nickname=${share_string}`
          );

          return {
              user: user?.data?.data,
              all_videos: all_videos?.data?.data?.videos
          };
        } catch (error) {
          return {};
        }
    } else {
        return Promise.resolve({});
    }
};
export default Profile;
