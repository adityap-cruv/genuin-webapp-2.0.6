import { IHeartCaughtUpOverlay } from "./iheart";
import { useCallback } from "react";
import { getBaseUrlWithouthighlights } from "@genuin/components/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export default function WatchBoundaryOverlay({
  variant,
}: {
  variant: "overlay" | "complete";
}) {
  const {
    view: { brandLayoutType: layoutType },
  } = useEmbedConfigs();

  const handleGoToEpisode = useCallback(() => {
    if (layoutType !== "iheart") return;
    const redirectUrl = getBaseUrlWithouthighlights(window.location.href);
    window.location.replace(redirectUrl);
  }, [layoutType]);

  switch (layoutType) {
    case "iheart": {
      return (
        <IHeartCaughtUpOverlay
          onGoToEpisodes={handleGoToEpisode}
          variant={variant}
        />
      );
    }
    default:
      return null;
  }
}
