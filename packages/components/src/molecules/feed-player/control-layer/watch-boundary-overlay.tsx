import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { IHeartCaughtUpOverlay } from "./embed/iheart";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export default function WatchBoundaryOverlay({
  variant,
  videoDetails,
  info,
}: {
  variant: "overlay" | "complete";
  videoDetails?: PostDetailsType["video"];
  info?: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
}) {
  const {
    view: { brandLayoutType: layoutType, websiteType },
  } = useEmbedConfigs();

  switch (layoutType) {
    case "iheart": {
      return (
        <IHeartCaughtUpOverlay
          videoDetails={videoDetails}
          info={info}
          variant={variant}
          websiteType={websiteType}
        />
      );
    }
    default:
      return null;
  }
}
