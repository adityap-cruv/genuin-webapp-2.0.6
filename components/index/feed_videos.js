import { Player } from "../player/player_swipe";
import { AppActions } from "../basic/app_actions";
import { useState, useRef, useEffect } from "react";
import { GetAppModal } from "../basic/get_app_modal";

import { Flex } from "@chakra-ui/react";


const Videos = ({
   feeds,
   loadMoreVideos,
   setCurrentVideoIndex = () => { },
   handleWheel = () => { }
}) => {
   const [showModalAppDownload, setShowModalAppDownload] = useState(false);
   const getAppComponentRef = useRef(() => null);
   const [muted, setMuted] = useState(true);
   const [indexTo, setIndexTo] = useState(feeds.length > 2 ? 3 : feeds.length);
   
   const addMoreVideos = (index) => {
      setIndexTo(old => (old - 2 == index) ? old + 1 : old)
      if (indexTo === feeds.length) {
         loadMoreVideos();
      }
   }

   useEffect(() => {
      if (indexTo === 0 && feeds.length !== 0) {
         setIndexTo(feeds.length > 2 ? 3 : feeds.length)
      }
   }, [feeds])


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

   const showGetAppToViewDialog = () => {
      // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
   }

   const handleClick = () => {
      setMuted((old) => !old);
   }
   
   useEffect(() => {
      window.addEventListener("wheel", handleWheel)
      return () => {
         return window.removeEventListener("wheel", handleWheel)
      }
   })
   return (<>

      <Flex
         className='section-content h-100 swipe-container hide-scrollbar'
         direction='initial'
         wrap='wrap'
         w='100%'
      >
         {feeds.length === 0
            ? <h1>Nothing to show here</h1>
            :(<>
               {feeds.slice(0, indexTo).map((video, id) => (
                  <>
                     <Player
                        key={feeds[id]['feed_type'] === 'rt' ? feeds[id]['feed']['chats'][0]['conversation_id'] : feeds[id]['feed']['video_id']}
                        uniqueKey={feeds[id]['feed_type'] === 'rt' ? feeds[id]['feed']['chats'][0]['conversation_id'] : feeds[id]['feed']['video_id']}
                        currentVideoIndex={id}
                        videoThumbnail={
                           feeds[id]['feed_type'] == 'rt' ? feeds[id].feed.chats[0].thumbnail_url_s : feeds[id]?.feed?.video_thumbnail_s
                        }
                        description={feeds[id]['feed_type'] === 'rt' ? feeds[id]['feed']['group']['group_description'] : feeds[id]['feed']['description']}
                        link={feeds[id]?.video?.link}
                        videoUrl={feeds[id]['feed_type'] === 'rt' ?
                           feeds[id]['feed']['chats'][0]['video_url_m3u8'] ?? feeds[id]['feed']['chats'][0]['video_url']
                           : feeds[id]['feed']['video_url_m3u8'] ?? feeds[id]['feed']['video_url']}
                        userName={feeds[id]['feed_type'] == 'rt' ? feeds[id]['feed']['chats'][0]['owner']['nickname'] : feeds[id]['feed']['recorded_by']['name']}
                        userId={feeds[id]['feed_type'] == 'rt' ? feeds[id]['feed']['chats'][0]['owner']['nickname'] : feeds[id]['feed']['recorded_by']['nickname']}
                        userProfileImage={feeds[id]['feed_type'] == 'rt' ? feeds[id]['feed']['chats'][0]['owner']['profile_image_s'] : feeds[id]['feed']['recorded_by']['profile_image_s']}
                        rtProfileImage={feeds[id]?.feed?.group?.dp_s ?? null}
                        showGetAppModal={handleShowModalAppDownload}
                        onEnded={showGetAppToViewDialog}
                        getNextVideo={getNextVideo}
                        getPrevVideo={getPrevVideo}
                        videos={feeds}
                        autoplay={id === 0 ? true : false}
                        video_id_to_use={feeds[id]?.video?.share_string}
                        roundTableMode={feeds[id]?.feed_type === "rt"}
                        roundTableName={feeds[id]?.feed?.group?.group_name ?? null}
                        roundTableId={feeds[id]?.share_string ?? null}
                        shareUrl={feeds[id]?.feed?.share_url}
                        verticalNavigation
                        muted={muted}
                        loadMoreVideos={addMoreVideos}
                        onClick={handleClick}
                        setCurrentVideoIndex={setCurrentVideoIndex}
                     >
                        <AppActions
                           showGetAppModal={handleShowModalAppDownload}
                           userName={feeds[id] && feeds[id]['feed_type'] == 'rt'
                              ? feeds[id]['feed']['chats'][0]['owner']['nickname']
                              : feeds[id]['feed']['recorded_by']['nickname'] }
                           link={feeds[id]?.video?.link}
                           videoUrl={feeds[id]?.video?.share_url}
                           videoDescription={
                              feeds[id]?.feed?.description
                           }
                           videoTitle='Genuin'
                           roundTable={feeds[id]?.feed_type === "rt"}
                           roundTableName={(feeds.length != 0 && feeds[id]['feed_type'] === 'rt') ? feeds[id]['feed']['group']['group_name'] : ""}
                           roundTableId={feeds[id]?.share_string}
                        />
                     </Player>
                     
                  </>
                
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