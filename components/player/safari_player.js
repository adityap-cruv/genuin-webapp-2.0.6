import { useEffect } from "react";

export const SafariPlayer = ({ 
   uniqueKey,
   videoUrl,
   playing,
   height,
   width,
   className,
   muted,
   onClick,
   onReady,
   onPlaying
}) => {

   useEffect(() => {
      var player = document.getElementById(uniqueKey);
      player.addEventListener('canplay', onReady);

      player.addEventListener("playing", onPlaying)

      return () => {
         player.removeEventListener('canplay', onReady);
         player.removeEventListener("playing", onPlaying);
      }
   }, [])

   useEffect(() => {
      var player = document.getElementById(uniqueKey);
      if (playing) {
         player.play();
      } else {
         player.pause();
      }
   }, [playing])

   return (
      <div
         className={className}
         height={height}
         width={width}
         onClick={onClick}
      >
         <video
            id={uniqueKey}
            playsInline
            muted={muted}
            loop
            src={videoUrl}
            type="application/x-mpegURL"
            height={height}
            width={width}
         />
      </div>
      
      );
}