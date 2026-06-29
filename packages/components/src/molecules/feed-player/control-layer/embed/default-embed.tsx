import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";
import { type FC, lazy, useRef } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { Stats } from "@genuin/components/molecules/stats";

import type { ControlLayerPropsType } from "../control-layer.types";
import { Controls } from "../controls/controls";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

export const DefaultEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  style,
  onClick,
  containerWidth,
}) => {
  const config = useEmbedConfigs();
  // A drag inside the sheet moves the indicator, so the browser's synthetic click
  // lands on the wrapper. This flag suppresses tile-expand on such drags.
  const pointerDownFromSheetRef = useRef(false);

  // Compact snap states get an 8 px bottom inset, panel/full are flush. Applied via
  // inline style because `!`-suffixed Tailwind classes don't reliably reach the SDK bundle.
  const { getContentTypeState } = useSheetState();
  const linkoutsState = getContentTypeState("linkouts");
  const isCompactSheetState =
    linkoutsState !== "panel-view" && linkoutsState !== "full-view" && linkoutsState !== "responsive";

  const { video, owner } = postDetails;
  if (!video || !owner) return null;

  // Drop the rest of the ControlLayerPropsType bag — none of it (postDetails,
  // onReactionStateChange, onCommentCountChange, containerWidth, adType, …)
  // is a valid DOM attribute, and spreading the whole bag onto the wrapper
  // `<div>` triggers React's "unknown prop" warnings. Only className, style and
  // onClick are DOM-safe and forwarded — onClick drives the tile→expand-view tap.
  return (
    <div
      className={cn("gencl:flex gencl:h-full gencl:flex-col gencl:justify-between", className)}
      style={style}
      onPointerDown={(e) => {
        // Only suppress expand for pointerdowns landing on the sheet itself; the
        // wrapper covers the full slide, so clicks on its empty area still expand.
        const t = e.target as Element | null;
        pointerDownFromSheetRef.current = !!t?.closest?.('[data-slot^="dynamic-sheet"]');
      }}
      onClick={(e) => {
        if (!onClick) return;
        if (pointerDownFromSheetRef.current) {
          pointerDownFromSheetRef.current = false;
          return;
        }
        const t = (e.nativeEvent.target ?? e.target) as Element | null;
        if (t?.closest?.('[data-slot^="dynamic-sheet"]')) return;
        onClick(e);
      }}>
      <div
        // V2: `inset-0` so DynamicLinkouts's `height: 100%` resolves to the slide;
        // the sheet pins to the bottom itself. V1: `bottom-0` content-sized, since the
        // legacy card has no inner sheet to position.
        //
        // `embed-carousel-no-swiping` (not `swiper-no-swiping`) blocks the outer
        // carousel Swiper without also blocking the nested linkout Swiper, which walks
        // ancestors for `swiper-no-swiping`.
        className={cn(
          // Vertical-only padding: the sheet already adds `mx-2` horizontally, so
          // wrapper `px-2` would double it to 16 px (Figma wants 8 px).
          "embed-carousel-no-swiping gencl:absolute gencl:w-full",
          config.isDesignSystemV2
            ? "gencl:inset-0 gencl:py-2 gencl:space-y-2"
            : "gencl:bottom-0 gencl:py-2 gencl:space-y-2"
        )}
        style={config.isDesignSystemV2 && isCompactSheetState ? { paddingBottom: 8 } : undefined}>
        {isActive && video.linkouts && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <Linkouts
              view="embed"
              {...(config.isDesignSystemV2 ? { variant: "dynamic" as const } : {})}
              layout="overlay"
              isActive={isActive}
              showImmediately
              linkouts={video.linkouts}
              linkoutId={video.linkoutId}
              videoDetails={video}
            />
          </SafeSuspense>
        )}
        {config.community.showViewCount && !isActive && (
          <Stats
            className="gencl:gap-1!"
            valueClassName="gencl:text-white!"
            stats={{
              Views: {
                value: video.viewCount,
                icon: <PlayIcon theme="dark" size="md" />,
              },
            }}
          />
        )}
      </div>

      {isActive && owner?.userName && (
        <>
          <Controls
            variant="embed"
            size={config.isDesignSystemV2 ? resolveControlSize(containerWidth!) : "sm"}
            ownerInfo={{ userName: owner.userName }}
            showUserName={config.community.showUserName}
          />
        </>
      )}
    </div>
  );
};
