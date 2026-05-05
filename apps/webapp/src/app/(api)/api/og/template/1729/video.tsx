import type { VideoItem } from "../../types";
import { PlayIcon } from "../components";

export function video({ videoData }: { videoData: VideoItem }) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}>
      <img src={videoData.video_thumbnail} width={194} height={344} style={{ objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "50%",
          width: "48px",
          height: "48px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <PlayIcon width={24} height={24} />
      </div>
    </div>
  );
}
