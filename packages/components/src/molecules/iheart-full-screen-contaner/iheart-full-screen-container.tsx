import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { ReactNode } from "react";
import { useWindowSize } from "usehooks-ts";

// height of iheart's top bar
const IHEART_TOP_BAR = 48;

// height of iheart's mini player
const IHEART_MINI_PLAYER_HEIGHT = 88;

export function IheartFullscreenContainer({
  children,
}: {
  children: ReactNode;
}) {
  const { isDesktop } = useDeviceDetectMediaQuery();
  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();
  const { height } = useWindowSize();
  const isIheart = brandLayoutType === "iheart";

  if (!isIheart) return children;

  return (
    <div
      style={{
        height: isDesktop
          ? height - IHEART_MINI_PLAYER_HEIGHT
          : height - IHEART_TOP_BAR,
        width: "100%",
        top: isDesktop ? 0 : IHEART_TOP_BAR,
        position: !isDesktop ? "fixed" : "unset",
      }}
    >
      {children}
    </div>
  );
}
