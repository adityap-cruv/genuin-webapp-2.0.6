import { VideoPlayer } from "@genuin/ui/video-player";
import { PlayIcon } from "@genuin/ui/icons";
import { useRef, useState } from "react";
import { Button } from "@genuin/ui/button";
import { useInView } from "framer-motion";
/**
 * Video component that displays a video player with a custom play button overlay and thumbnail.
 * Handles play/pause state and resets when the video ends.
 *
 * @component
 * @example
 * ```tsx
 * <Video videoUrl="https://example.com/video.mp4" thumbnail="https://example.com/thumbnail.jpg" />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.videoUrl - URL of the video file to play
 * @param {string} props.thumbnail - URL of the thumbnail image to display before playback
 */
export const Video = ({
  videoUrl,
  thumbnail,
}: {
  videoUrl: string;
  thumbnail: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const togglePlaying = () => {
    setIsPlaying(!isPlaying);
  };
  const videoRef = useRef<HTMLVideoElement>(null);
  const elementIsInView = useInView(videoRef as React.RefObject<Element>, {
    amount: 0.5,
  });
  return (
    <div
      className="gencl:w-30 gencl:h-30 gencl:relative gencl:flex gencl:justify-center gencl:items-center"
      onClick={togglePlaying}
    >
      {!isPlaying && (
          <Button
            theme="text"
            className="gencl:absolute gencl:h-12 gencl:w-12 gencl:flex gencl:justify-center gencl:items-center gencl:bg-black/60 gencl:backdrop-blur-3xl gencl:rounded-full"
            tabIndex={-1}
            aria-label="Play video"
          >
            <PlayIcon className="gencl:h-6 gencl:w-5" variant="light" />
          </Button>
      )}
      <VideoPlayer
        onEnded={() => {
          setIsPlaying(false);
        }}
        className="gencl:w-full gencl:h-full gencl:rounded-2xl gencl:object-cover gencl:object-center"
        play={isPlaying && elementIsInView}
        src={videoUrl}
        poster={thumbnail}
        ref={videoRef}
      />
    </div>
  );
};
