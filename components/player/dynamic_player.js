import { isSafari } from "react-device-detect";
import ReactPlayer from "react-player/lazy";


export const DynamicPlayer = ({
   currentVideoIndex,
   videos,
   isPlaying,
   url,
   muted,
   onClick,
   onProgress,
   onDuration,
   onEnded,
   onReady
}) => {
   return (<>
      {!isSafari && <ReactPlayer
         key={videos[currentVideoIndex]['video_type'] === 'rt' ? videos[currentVideoIndex]['video']['conversation_id'] : videos[currentVideoIndex]['video']['video_id']}
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
         onEnded={onEnded}
         progressInterval={200}
         onReady={onReady}
         loop
      />}

      {isSafari && <SafariPlayer
         uniqueKey={'safari-player-' + currentVideoIndex}
         playing={isPlaying}
         videoUrl={url}
         height="100%"
         width="100%"
         className="video-wrapper"
         muted={muted}
         onClick={onClick}
         currentVideoIndex={currentVideoIndex}
         onReady={(_, __) => {
            setDisplayThumbnail(false);
         }}
      />}
   </>)
}