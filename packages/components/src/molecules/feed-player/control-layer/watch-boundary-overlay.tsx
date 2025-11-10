import { IHeartCaughtUpOverlay } from "./iheart";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export default function WatchBoundaryOverlay({
  variant,
}: {
  variant: "overlay" | "complete";
}) {
  const {
    view: { brandLayoutType: layoutType },
  } = useEmbedConfigs();

  switch (layoutType) {
    case "iheart": {
      return <IHeartCaughtUpOverlay variant={variant} />;
    }
    default:
      return null;
  }
}
