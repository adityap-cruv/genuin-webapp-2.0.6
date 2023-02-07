import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Player } from "../components/player/player_swipe";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/getAppModal";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { TopNav } from "../components/topNavSwipe";

import {
  AppActions
} from "../components/appActions";
import { Error } from "../components/error";
import {
  Flex,
  useBreakpointValue,
  Spinner
} from "@chakra-ui/react";

const Profile = ({
  user = {},
  all_videos = [],
  is_prop_loaded = false
}) => {
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

  const preparedFeedVideos = prepareFeedVideos(all_videos)
  const [videos, setVideos] = useState(preparedFeedVideos);
  const [muted, setMuted] = useState(true);
  const [show_unmute_text, setShowUnmuteText] = useState(true);

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

  useEffect(function () {
    setTimeout(() => {
      setShowUnmuteText(false);
    }, 5000);
  }, [])

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

  return !Boolean(is_prop_loaded) ? (
    // <Error />
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh'
          }}>
          <Spinner
            thickness='4px'
            speed='1s'
            emptyColor='gray.200'
            color='blue.500'
            size='lg' />
        </div>
      </>
  ) : (
    <>
      <Layout>
        <TopNav showGetAppModal={handleShowModalAppDownload} variant='light' />
        {muted ?
          <div className="volume-control">
            <Button
              variant='primary'
              onClick={() => { setMuted(prev => !prev); setShowUnmuteText(false); }}
              style={{
                height: 45,
                padding: "8px",
                fontSize: 17,
                fontWeight: "bold",
                pointerEvents: "all",
                borderRadius: '8px'
              }}
            >
              <FontAwesomeIcon icon={faVolumeMute} />
              {show_unmute_text ? <p>Tap to unmute</p> : ""}
            </Button>
          </div>
          : ""}
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
                  videoUrl={videos[id] && videos[id]['video'] && videos[id]['video']['video_url_m3u8'] ? getInfyUrl(videos[id]['video']['video_url_m3u8']) : (videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl'] ? videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl'] : null)}
                  userName={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['nickname'] : (user && user.nickname ? user.nickname: null)}
                  userId={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['nickname'] : (user && user.nickname ? user.nickname : null)}
                  userProfileImage={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['profile_image'] : (user && user.profile_image ? user.profile_image : null)}
                  rtProfileImage={videos[id]?.video?.group_dp}
                  showGetAppModal={handleShowModalAppDownload}
                  onEnded={showGetAppToViewDialog}
                  getNextVideo={getNextVideo}
                  getPrevVideo={getPrevVideo}
                  videos={videos}
                  autoplay={id === 0 ? true : false}
                  video_id_to_use={videos[id]?.video?.share_string}
                  roundTableMode={videos[id]?.video_type === "rt"}
                  roundTableName={videos[id]?.video?.group_name}
                  roundTableId={videos[id]?.share_string}
                  shareUrl={videos[id]?.video?.share_url}
                  verticalNavigation
                  muted={muted}
                >
                  <AppActions
                    showGetAppModal={handleShowModalAppDownload}
                    userName={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['nickname'] : (user && user.nickname ? user.nickname : null)}
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
    </>
  );
};


Profile.getInitialProps = async ({ query: { nickname, rt } }) => {
  if (
    nickname !== undefined &&
    nickname !== null &&
    nickname !== ""
  ) {
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
        is_prop_loaded: true
      };
    } catch (error) {
      return {};
    }
  } else if (
    rt !== undefined &&
    rt !== null &&
    rt !== ""
  ) {
    const videos = await axios.get(
      `${process.env.apiurl}/api/v3/public/rt/videos?chat_id=${rt}`
    );
    const rt_details = await axios.get(
      `${process.env.apiurl}/api/v3/public/rt/details?chat_id=${rt}`
    );
    var rt_videos = [];
    if (rt_details !== undefined && rt_details !== null &&
      rt_details.data !== undefined && rt_details.data !== null &&
      rt_details.data.data !== undefined && rt_details.data.data !== null &&
      videos !== undefined && videos !== null &&
      videos.data !== undefined && videos.data !== null &&
      videos.data.data !== undefined && videos.data.data !== null &&
      videos.data.data.length > 0) {
      videos.data.data.forEach(function (v) {
        var videoObj = {
          "video_type": "rt",
          "share_string": rt_details.data.data.share_string,
          "video": {
            "owner": v.owner,
            "thumbnail_url": v.thumbnail_url,
            "thumbnail_url_s": v.thumbnail_url_s,
            "thumbnail_url_l": v.thumbnail_url_l,
            "video_url": v.video_url,
            "video_url_m3u8": v.video_url_m3u8,
            "link": v.link,
            "meta_data": v.meta_data,
            "conversation_id": v.conversation_id,
            "conversation_at": v.conversation_at,
            "no_of_views": v.no_of_views,
            "no_of_comments": v.no_of_comments,
            "video_thumbnail": v.video_thumbnail,
            "share_url": `${process.env.hostname}rt/${rt_details.data.data.share_string}?v=${v.share_string}`,
            "share_string": v.share_string,
            "rt_share_string": v.share_string,
            "description": rt_details.data.data.group.group_description,
            "group_name": rt_details.data.data.group.group_name,
            "group_dp": rt_details.data.data.group.dp,
            "chat_id": rt_details.data.data.chat_id
          }
        };
        rt_videos.push(videoObj);
      })
    }
    console.log('rt_videos', rt_videos);
    return {
      all_videos: rt_videos,
      is_prop_loaded: true
    }
  } else {
    return Promise.resolve({});
  }
};
export default Profile;