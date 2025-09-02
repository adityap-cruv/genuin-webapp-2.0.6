import { useEmbedContext } from "@genuin/components/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEmbedManagerContext } from "../context";
import { useEffect, useState, ComponentProps } from "react";
import { cn, getAspectRatio } from "@genuin/ui/lib/utils";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { EmbedItem } from "../embed-tile-item";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

export function GridView({
  videos,
  rows = 2,
  cols = 2,
  autoAdjust,
  aspectRatio,
  ...restProps
}: {
  videos: PostDetailsType[];
  rows?: number;
  cols?: number;
  autoAdjust?: boolean;
  aspectRatio?: string;
} & ComponentProps<"div">) {
  const { embedEventBus } = useEmbedContext();
  const { view } = useEmbedConfigs();
  const { updateActiveIndex } = useEmbedManagerContext();
  const [isHovering, setIsHovering] = useState(false);
  const { containerHeight, containerWidth } = useEmbedDimensions();
  const { width: widthRatio, height: heightRatio } =
    getAspectRatio(aspectRatio);

  useEffect(() => {
    if (videos.length === 0) return;
    if (isHovering) return;
    const interval = setInterval(() => {
      const context = embedEventBus.getContext();
      if (context.activePlayerType === "expand-view") return;
      const currentIndex = context.activeIndex || 0;
      const nextIndex = (currentIndex + 1) % videos.length;
      updateActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [videos.length, embedEventBus, updateActiveIndex, isHovering]);

  useEffect(() => {
    if (videos.length > 0) {
      const currentIndex = embedEventBus.getContext().activeIndex || 0;
      updateActiveIndex(currentIndex);
    }
  }, [videos.length, embedEventBus, updateActiveIndex]);

  return (
    <div
      style={{
        height: Math.max(containerHeight, 0),
        width: Math.max(containerWidth, 0),
      }}
      className="gencl:h-full gencl:w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...restProps}
    >
      <div
        className={cn(
          "gencl:w-full gencl:gap-2",
          view.enableAdaptiveVideo && "gencl:h-full"
        )}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {videos.map((videoData, index) => (
          <div
            key={index}
            className={cn(
              view.enableAdaptiveVideo ? "gencl:h-full gencl:w-full" : "",
              "gencl:relative gencl:overflow-hidden gencl:rounded-md",
              "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
              "gencl:cursor-pointer"
            )}
            style={
              view.enableAdaptiveVideo
                ? undefined
                : {
                    aspectRatio: `${widthRatio} / ${heightRatio}`,
                  }
            }
            onClick={() => {
              embedEventBus.emit(
                "activePlayerTypeChange",
                {},
                {
                  activePlayerType: "expand-view",
                  activeIndex: index,
                }
              );
            }}
          >
            <EmbedItem index={index} postDetails={videoData} />
          </div>
        ))}
      </div>
    </div>
  );
}
