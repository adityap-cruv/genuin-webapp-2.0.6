import mobileFrame from "../images/mobile_frame.png"
import { DynamicPlayer } from "./player/dynamic_player"

export const HomePageVideo = ({
   videoUrl
}) => {
   return (<>
         <img
            style={{
               position: "absolute",
            }}
            width="50%"
            height="80%"
            src={mobileFrame.src}>
      </img>
      <div
         style={{
            height: "96%"
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
   </>)
}