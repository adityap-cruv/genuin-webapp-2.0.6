import { cn } from "@genuin/ui/lib/utils";
import { EmbedTile } from "../embed-tile";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedManagerContext } from "./context";
import { useDebounceCallback } from "usehooks-ts";
import { useEmbedContext } from "@genuin/components/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type EmbedItemProps = Omit<
  ComponentProps<typeof EmbedTile>,
  "onPlayerIterationEnd" | "isActive"
> & {
  index: number;
};

export function EmbedItem({
  index,
  postDetails,
  ...restProps
}: EmbedItemProps) {
  const { updateActiveIndex, goToNextVideo, activeIndex } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();
  const { embedEventBus, updateSelectedSection } = useEmbedContext();
  const [embedIsActive, setEmbedIsActive] = useState(
    embedEventBus.getContext().activePlayerType === "embed"
  );
  const isSectioned = embedEventBus.getContext().isSectioned;

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "embed") {
        setEmbedIsActive(true);
      } else {
        setEmbedIsActive(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, []);

  const debouncedSetActiveIndex = useDebounceCallback(() => {
    updateActiveIndex(index);
  }, 700);

  const handleMouseLeave = useCallback(() => {
    debouncedSetActiveIndex.cancel();
  }, [debouncedSetActiveIndex]);

  // Handle automatic progression when video ends
  const handlePlayerIterationEnd = useCallback(() => {
    // Use intelligent auto-scroll for placement view when enabled
    const useAutoScroll =
      config.view.isPlacementView && config.video.autoScrollToNextSlide;
    goToNextVideo(useAutoScroll);
  }, [goToNextVideo, config]);

  return (
    <EmbedTile
      className={cn("gencl:cursor-pointer")}
      postDetails={postDetails}
      isActive={activeIndex === index && embedIsActive}
      onPlayerIterationEnd={handlePlayerIterationEnd}
      onMouseEnter={debouncedSetActiveIndex}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isSectioned) {
          updateSelectedSection(postDetails.section);
        }
        updateActiveIndex(index);
      }}
      index={index}
      {...restProps}
    />
  );
}
