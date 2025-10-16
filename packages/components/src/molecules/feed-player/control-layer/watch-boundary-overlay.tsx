import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { IHeartCaughtUpOverlay } from "./iheart";
import { useCallback } from "react";
import { getBaseUrlWithoutClip } from "@genuin/components/lib/utils";

export default function WatchBoundaryOverlay({
  cardLayoutId,
  videoLayoutId,
}: {
  videoLayoutId: number | undefined;
  cardLayoutId: number | undefined;
}) {
  const layoutType = getBrandType(cardLayoutId, videoLayoutId);

  const handleGoToEpisode = useCallback(() => {
    if (layoutType !== "iheart") return;
    const redirectUrl = getBaseUrlWithoutClip(window.location.href);
    window.location.replace(redirectUrl);
  }, [layoutType]);

  switch (layoutType) {
    case "iheart": {
      return <IHeartCaughtUpOverlay onGoToEpisodes={handleGoToEpisode} />;
    }
    default:
      return null;
  }
}
