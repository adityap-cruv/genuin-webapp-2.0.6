import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { ReactNode, useEffect, useState } from "react";
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
    view: { brandLayoutType, websiteType },
  } = useEmbedConfigs();
  const { height } = useWindowSize();
  const isIheart = brandLayoutType === "iheart";

  const [containerDimensions, setContainerDimensions] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // useEffect(() => {
  //   if (!isDesktop || !isIheart) return;

  //   const updateDimensions = () => {
  //     const presetsDrawerContainer = document.getElementById(
  //       "presets-drawer-container"
  //     );
  //     if (presetsDrawerContainer) {
  //       const rect = presetsDrawerContainer.getBoundingClientRect();
  //       setContainerDimensions({
  //         x: rect.x,
  //         y: rect.y,
  //         width: rect.width,
  //         height: rect.height,
  //       });
  //     }
  //   };

  //   // Initial update
  //   updateDimensions();

  //   // Handle resize
  //   const resizeObserver = new ResizeObserver(updateDimensions);
  //   const presetsDrawerContainer = document.getElementById(
  //     "presets-drawer-container"
  //   );

  //   if (presetsDrawerContainer) {
  //     resizeObserver.observe(presetsDrawerContainer);
  //   }

  //   // Also handle window resize
  //   window.addEventListener("resize", updateDimensions);

  //   return () => {
  //     resizeObserver.disconnect();
  //     window.removeEventListener("resize", updateDimensions);
  //   };
  // }, [isDesktop, isIheart]);

  if (!isIheart) return children;

  return (
    <div
      style={{
        height: isDesktop
          ? websiteType === "legacy"
            ? "100vh"
            : containerDimensions.height || height - IHEART_MINI_PLAYER_HEIGHT
          : height - IHEART_TOP_BAR,
        width: isDesktop ? containerDimensions.width || "100%" : "100%",
        top: isDesktop ? containerDimensions.y || 0 : IHEART_TOP_BAR,
        left: isDesktop ? containerDimensions.x : undefined,
        position: "fixed",
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}
