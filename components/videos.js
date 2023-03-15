import { Player } from "./player/player_swipe";
import { AppActions } from "./appActions";
import { useState, useRef } from "react";
import { GetAppModal } from "./getAppModal";
import { Flex } from "@chakra-ui/react";


const Videos = ({
   videos,
   loadMoreVideos,
   revenue_enabled,
   user
}) => {

   const [showModalAppDownload, setShowModalAppDownload] = useState(false);
   const getAppComponentRef = useRef(() => null);
   const [muted, setMuted] = useState(true);


   const getNextVideo = () => {
      // var idx = currentVideoIndex
      // if(currentVideoIndex+1<videos.length){
      //   idx = currentVideoIndex+1
      //   setCurrentVideoIndex(idx);
      // }
   }

   const getPrevVideo = () => {
      // var idx = 0
      // if(currentVideoIndex-1>=0){
      //   idx = currentVideoIndex-1
      //   setCurrentVideoIndex(idx);
      // }
   };

   const handleShowModalAppDownload = (message = () => null) => {
      getAppComponentRef.current = message;
      setShowModalAppDownload(true);
   };

   const handleCloseAppDownload = () => {
      getAppComponentRef.current = () => null;
      setShowModalAppDownload(false);
   };

   const getInfyUrl = (url) => {
      var client_ip = ``;
      var location_lat = ``;
      var location_lng = ``;
      var minimum_duration = 1;
      var maximum_duration = 120;
      var device_width = 720;
      var device_height = 1280;
      var new_m3u8_url = `https://nxs.infy.tv/ssai/master.m3u8?live=0&avod=1&c=1048&min_ad_duration=6&max_ad_duration=300&pod_duration=3005&ad_breaks=-1,-1&pdomain=cnn.com&pname=CNN&u=${url}&t=2071&dnt=0&width=${device_width}&height=${device_height}&minimum_duration=${minimum_duration}&maximum_duration=${maximum_duration}&placement_id=cnn001${client_ip}${location_lat}${location_lng}`;
      return new_m3u8_url;
   }

   const showGetAppToViewDialog = () => {
      // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
   }

   const handleClick = () => {
      setMuted((old) => !old);
   }

   return (<>
      <Flex
         className='section-content h-100 swipe-container hide-scrollbar'
         direction='initial'
         wrap='wrap'
         w='full'
      >
         {videos.length === 0
            ? <h1>Nothing to show here</h1>
            :(<>
               {videos.map((video, id) => (
                  <Player
                     key={videos[id]['video_type'] === 'rt' ? videos[id]['video']['conversation_id'] : videos[id]['video']['video_id']}
                     currentVideoIndex={id}
                     videoThumbnail={
                        videos[id]['video_type'] == 'rt' ? videos[id].video.thumbnail_url_s : videos[id]?.video?.video_thumbnail_s
                     }
                     description={videos[id]?.video?.description}
                     link={videos[id]?.video?.link}
                     videoUrl={videos[id] && videos[id]['video'] && videos[id]['video']['video_url_m3u8']
                        ? (revenue_enabled
                           ? getInfyUrl(videos[id]['video']['video_url_m3u8'])
                           : videos[id]['video']['video_url_m3u8'])
                        : (videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']
                           ? videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']
                           : null)}
                     userName={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['nickname'] : (user && user.nickname ? user.nickname : null)}
                     userId={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['nickname'] : (user && user.nickname ? user.nickname : null)}
                     userProfileImage={videos[id] && videos[id]['video_type'] == 'rt' ? videos[id]['video']['owner']['profile_image_s'] : (user && user.profile_image_s ? user.profile_image_s : null)}
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
                     loadMoreVideos={loadMoreVideos}
                     onClick={handleClick}
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
            </>)
         }
      
         
      <GetAppModal
         show={showModalAppDownload}
         onClose={handleCloseAppDownload}
         TextNode={getAppComponentRef.current}
         />
      </Flex>
   </>)
}

export default Videos;