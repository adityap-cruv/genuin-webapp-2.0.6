import mobileFrame from "../images/mobile_frame.png"
import { DynamicPlayer } from "./player/dynamic_player"

export const HomePageVideo = ({
   videoUrl,
   opacityFrame
}) => {
   return (<>
      <div
         style={{
            width: "300px",
            position: "absolute"
         }}>
         <DynamicPlayer
            isPlaying={true}
            muted={true}
            onClick={() => {
               console.log("onclicke")
            }}
            url={videoUrl}
            uniqueKey="feed_index_player"
         />
      </div>
         <img
            style={{
               position: "absolute",
               opacity: opacityFrame
            }}
            width="310px"
            src={mobileFrame.src}>
      </img>
   </>)
}