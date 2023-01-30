import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Player } from "../components/player";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/getAppModal";
import {
  AppActions
} from "../components/appActions";
import { WelcomeModal } from "../components/welcomeModal";
import { Error } from "../components/error";
import { Waypoint } from 'react-waypoint';
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

  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  let handleEnterViewport = function() {
      setIsPlaying(true);
  }
  let handleExitViewport = function() {
      setIsPlaying(false);
  }


  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <Flex
        className='section-content h-100 swipe-container'
        direction='column'
        w='full'
        position={mobile ? "fixed" : "initial"}
      >
        {videos.length > 0 ? (
          <>
            {videos.map((video, id) => (
            <Waypoint 
              onEnter={handleEnterViewport}
              onLeave={handleExitViewport}
            >
              <Player
                currentVideoIndex={id}
                videoThumbnail={
                  videos[id]?.video?.video_thumbnail
                }
                description={videos[id]?.video?.description}
                link={videos[id]?.video?.link}
                videoUrl={videos[id]?.video?.video_url_m3u8 ?? videos[id]?.video?.videoUrl}
                userName={nickname}
                userId={nickname}
                // onClickOutsideOfVideo={() => {setProfileUrl(); onClose();}}
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
            </Waypoint>
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
      <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
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
