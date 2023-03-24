import { useState } from "react";
import { Box } from "@chakra-ui/react";

import mobileFrame from "../images/mobile_frame_3.png"
import { DynamicPlayer } from "./player/dynamic_player"

export const HomePageVideo = ({
   videoUrl,
   opacityFrame,
   videoThumbnail
}) => {

   const [displayThumbnail, setDisplayThumbnail] = useState(true);
   return (<>
      <div
         style={{
            position: "relative",
            width: "300px",
               height: "100%"
         }}
      >
         <div
            className="index-player-border"
            style={{
               position: "absolute"
            }}
         >
            <DynamicPlayer
               isPlaying={true}
               muted={true}
               onClick={() => { }}
               url={videoUrl}
               uniqueKey="feed_index_player"
               onReady={() => {
                  setDisplayThumbnail(false);
               }}
            />
            {displayThumbnail && <Box
               backgroundImage={`url(${videoThumbnail})`}
               backgroundColor={Boolean(videoThumbnail) ? "transparent" : "lightgray"}
               backgroundRepeat='no-repeat'
               backgroundSize='cover'
               backgroundPosition='center'
               width='100%'
               h='100%'
               filter='blur(10px)'
            />}
         </div>
         <img
            style={{
               position: "absolute",
               opacity: opacityFrame
            }}
            src={mobileFrame.src}>
         </img>
      </div>
     
   </>)
}