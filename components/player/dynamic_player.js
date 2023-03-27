import { isSafari } from "react-device-detect";
import ReactPlayer from "react-player/lazy";
import {SafariPlayer} from "./safari_player.js"


export const DynamicPlayer = ({
   isPlaying,
   url,
   muted,
   onClick,
   onProgress,
   onDuration,
   onEnded,
   onReady,
   uniqueKey,
   loop = true
}) => {
   console.log("on ended... ", onEnded)
   return (<>
      {!isSafari && <ReactPlayer
         key={uniqueKey}
         playing={isPlaying}
         url={url}
         muted={muted}
         controls={false}
         playsinline={true}
         config={{
            forceHLS: false,
            forceVideo: true,
         }}
         onClick={onClick}
         className="video-wrapper"
         width="auto"
         height="100%"
         onProgress={onProgress}
         onDuration={onDuration}
         onEnded={() => { onEnded() }}
         progressInterval={200}
         onReady={onReady}
         loop={loop}
      />}

      {isSafari && <SafariPlayer
         uniqueKey={uniqueKey}
         playing={isPlaying}
         videoUrl={url}
         height="100%"
         width="100%"
         className="video-wrapper"
         muted={muted}
         onClick={onClick}
         onReady={onReady}
      />}
   </>)
}