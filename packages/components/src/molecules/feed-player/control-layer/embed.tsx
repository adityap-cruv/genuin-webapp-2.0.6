import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { Controls } from "./controls/controls";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { type FC } from "react";

import { ReadMore } from "@genuin/components/molecules/read-more";
import { PlayIcon, PriceTagIcon } from "@genuin/ui/icons";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Stats } from "../../stats";
import { EmbedControls } from "./controls/embed";
import { IHeartControlLayer } from "./iheart";
import { Avatar } from "@genuin/ui/components/avatar";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";

export const Embed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  onReactionStateChange,
  layoutType,
  ...restProps
}) => {
  const config = useEmbedConfigs();
  const { containerHeight } = useEmbedDimensions();

  const brandLayoutType = !config.responsive.canShowEngagement
    ? "responsiveness"
    : config.view.brandLayoutType;

  switch (brandLayoutType) {
    case "iheart":
      return (
        <IHeartControlLayer
          postDetails={postDetails}
          className={className}
          isActive={isActive}
          onReactionStateChange={onReactionStateChange}
          {...restProps}
        />
      );

    case "ted":
      return (
        <div className={cn(className)} {...restProps}>
          {isActive && (
            <div
              className="gencl:absolute gencl:top-0 gencl:right-0 gencl:py-2 gencl:px-3"
              onClick={(e) => e.stopPropagation()}
            >
              <EmbedControls className={cn("gencl:gap-3")} size="xs" />
            </div>
          )}

          <div className="gencl:px-3 gencl:py-4 gencl:absolute gencl:space-y-2 gencl:bottom-0 gencl:bg-gradient-to-t gencl:from-black/80 gencl:to-transparent">
            <ReadMore
              text={postDetails.video.description}
              position="overlay"
              viewLessText=""
              viewMoreText=""
              maxChars={500}
              shouldAnimate
              className="gencl:overflow-y-auto gencl:text-body-2-normal! gencl:[&_span]:leading-[125%]! gencl:tracking-[-0.042px]!"
              expandedHeight={`${containerHeight * 0.35}px`}
              maxLines={containerHeight < 375 ? 1 : 2}
            />
            <div
              className="gencl:flex gencl:items-center gencl:gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar
                size="xs"
                imageUrl={postDetails.community.profileImage ?? ""}
                isAvatar={false}
                alt={postDetails.community.name ?? ""}
              />
              <p className="gencl:text-white! gencl:text-body-1-bold gencl:line-clamp-1 gencl:tracking-[-0.21px]! gencl:leading-[130%]!">
                {postDetails.community.name}
              </p>
            </div>
          </div>
        </div>
      );

    case "grubhub":
      return (
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:justify-between",
            className
          )}
          {...restProps}
        >
          {postDetails.video.attributes?.offer_text && (
            <div className="gencl:absolute gencl:top-2 gencl:left-2 gencl:px-2 gencl:py-0.5 gencl:rounded-sm gencl:w-fit gencl:flex gencl:items-center gencl:gap-1 gencl:bg-[#AFE6CC]">
              <PriceTagIcon size="sm" theme="green" />
              <span className="gencl:text-body-2-medium gencl:m-0 gencl:p-0 gencl:text-[#0D8668]">
                {postDetails.video.attributes?.offer_text}
              </span>
            </div>
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

    case "walmart":
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
            <p className="gencl:text-body-1-semi-bold gencl:text-white gencl:line-clamp-1">
              {postDetails.section?.title}
            </p>
          </div>
        </div>
      );

    case "responsiveness":
      return (
        <div
          className={cn("gencl:h-full gencl:w-full", className)}
          {...restProps}
        >
          {isActive && (
            <EmbedControls
              onClick={(e) => e.stopPropagation()}
              className="gencl:justify-end gencl:p-1"
            />
          )}
        </div>
      );

    case "default":
    default:
      return (
        <div
          className={cn(
            "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between",
            className
          )}
          {...restProps}
        >
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
            {config.community.showViewCount && !isActive && (
              <Stats
                className="gencl:gap-1!"
                valueClassName="gencl:text-white!"
                stats={{
                  Views: {
                    value: 0,
                    icon: <PlayIcon theme="dark" size="md" />,
                  },
                }}
              />
            )}
          </div>

          {isActive && (
            <>
              <Controls
                variant="embed"
                ownerInfo={{ userName: postDetails.owner.userName }}
                showUserName={config.community.showUserName}
              />
            </>
          )}
        </div>
      );
  }
};
