import { cn } from "@genuin/ui/lib/utils";
import { EmbedTile } from "../embed-tile";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedManagerContext } from "./context";
import { useDebounceCallback } from "usehooks-ts";
import { useEmbedContext } from "@genuin/components/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

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

  return (
    <EmbedTile
      className={cn("gencl:cursor-pointer")}
      postDetails={postDetails}
      isActive={activeIndex === index && embedIsActive}
      onPlayerIterationEnd={goToNextVideo}
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
