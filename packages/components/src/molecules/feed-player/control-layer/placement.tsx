import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { type FC } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { EmbedControls } from "./controls/embed";
import { useEmbedContext } from "@genuin/components/context/embed/context";

export const Placement: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  ...restProps
}) => {
  const config = useEmbedConfigs();
  const { embedEventBus } = useEmbedContext();
  const isSectioned = embedEventBus.getContext().isSectioned;
  const showLayout = config.engagement.showEngagementOnRootElement;

  if (!showLayout) return;

  // Determine layout type based on placement IDs and sectioned state
  const getLayoutType = () => {
    if (
      postDetails.video.placement_card_section_layout_id === 1 &&
      isSectioned
    ) {
      return "walmart-sectioned";
    }
    if (postDetails.video.placement_card_layout_id === 1 && !isSectioned) {
      return "walmart-non-sectioned";
    }
    return "default";
  };

  const layoutType = getLayoutType();

  switch (layoutType) {
    case "walmart-sectioned":
      return (
        <div
          className={cn(
            "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between gencl:relative",
            className
          )}
          {...restProps}
        >
          {isActive ? (
            <EmbedControls
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "gencl:gap-2 gencl:z-20 gencl:absolute gencl:right-0 gencl:p-2"
              )}
              size="xs"
              section={postDetails.section}
            />
          ) : (
            <></>
          )}

          <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
            <p className="gencl:text-body-1-semi-bold gencl:text-white gencl:line-clamp-1">
              {postDetails.section?.title}
            </p>
          </div>
        </div>
      );

    case "walmart-non-sectioned":
      return (
        <div
          className={cn(
            "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between gencl:relative",
            className
          )}
          {...restProps}
        >
          {isActive ? (
            <EmbedControls
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "gencl:gap-2 gencl:z-20 gencl:absolute gencl:right-0 gencl:p-2"
              )}
              size="xs"
            />
          ) : (
            <></>
          )}

          <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
            {config.links.showLinkInside && isActive && (
              <Linkouts
                variant="embed"
                isActive={isActive}
                showImmediately
                linkouts={postDetails.video.linkouts}
                linkoutId={postDetails.video.linkoutId}
              />
            )}
          </div>
        </div>
      );

    case "default":
    default:
      return null;
  }
};
