import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { IHeartCaughtUpOverlay } from "./iheart";

export default function WatchBoundaryOverlay({
  cardLayoutId,
  videoLayoutId,
}: {
  videoLayoutId: number | undefined;
  cardLayoutId: number | undefined;
}) {
  const layoutType = getBrandType(cardLayoutId, videoLayoutId);

  switch (layoutType) {
    case "iheart": {
      return <IHeartCaughtUpOverlay />;
    }
    default:
      return null;
  }
}
