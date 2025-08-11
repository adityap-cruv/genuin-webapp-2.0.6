import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { Controls } from "./controls/controls";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { type FC } from "react";
import { Avatar, ReadMore } from "@genuin/ui/components";
import { Image } from "@genuin/ui/components/image";
import { PlayIcon } from "@genuin/ui/icons";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Stats } from "../../stats";
import { EmbedControls } from "./controls/embed";

export const Embed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  ...restProps
}) => {
  const config = useEmbedConfigs();

  // default embedType is 1
  if (postDetails.video.cardLayoutId === 1) {
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

  // embedtype 1 for ted
  if (postDetails.video.cardLayoutId === 3) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:flex-col gencl:justify-between gencl:h-full",
          className
        )}
        {...restProps}
      >
        {isActive ? (
          <Controls
            className="gencl:justify-end"
            variant="embed"
            spacing="liberal"
          />
        ) : (
          <div />
        )}
        <div />
        <div className="gencl:p-3 gencl:space-y-2 gencl:bg-gradient-to-t gencl:from-black/80 gencl:to-transparent">
          <ReadMore
            text={postDetails.video.description}
            textClassName="gencl:text-white! gencl:text-body-2-medium gencl:font-normal gencl:pointer-events-none"
            viewLessText=""
            viewMoreText=""
            maxLines={3}
          />
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            <Avatar
              size="xs"
              imageUrl={postDetails.community.profileImage ?? ""}
              isAvatar={false}
              alt={postDetails.community.name ?? ""}
            />
            <p className="gencl:text-white! gencl:text-body-1-bold gencl:line-clamp-1">
              {postDetails.community.name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // embedtype 2 for iheart
  if (postDetails.video.cardLayoutId === 2) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:flex-col gencl:justify-between",
          className
        )}
        {...restProps}
      >
        {postDetails.video.attributes ? (
          <div className="gencl:p-3 gencl:text-white! gencl:flex gencl:gap-2">
            {postDetails.video.attributes?.image_url && (
              <Image
                aspectRatio="square"
                src={postDetails.video.attributes?.image_url ?? ""}
                alt={postDetails.video.slug ?? ""}
                className="gencl:size-12 gencl:rounded-lg gencl:object-cover"
              />
            )}
            <div>
              <p className="gencl:text-body-2-semi-bold gencl:line-clamp-1">
                {postDetails.owner?.name ?? postDetails.owner?.userName}
              </p>
              <p className="gencl:text-body-2-normal gencl:line-clamp-2">
                {postDetails.video.attributes?.title ?? postDetails?.owner?.bio}
              </p>
            </div>
          </div>
        ) : (
          <div />
        )}
        <div className="gencl:p-3 gencl:space-y-2 gencl:bg-gradient-to-t gencl:from-black/80 gencl:to-transparent">
          <div>
            <p className="gencl:text-white gencl:text-body-2-semi-bold gencl:font-normal">
              {getMonthYear(
                postDetails.video.attributes?.timestamp ??
                  postDetails.video.createdAt ??
                  0
              )}{" "}
              • {getFormattedDuration(String(postDetails.video.duration ?? ""))}
            </p>
            <ReadMore
              text={postDetails.video.description}
              textClassName="gencl:text-white! gencl:text-body-2-medium gencl:font-normal"
              shouldAnimate
              maxLines={2}
            />
          </div>
          <div
            className={cn(
              "gencl:overflow-hidden gencl:transition-all gencl:ease-in-out gencl:duration-300",
              isActive
                ? "gencl:max-h-12 gencl:mt-2 gencl:opacity-100"
                : "gencl:max-h-0 gencl:mt-0 gencl:opacity-0"
            )}
          >
            <EmbedControls
              onClick={(e) => e.stopPropagation()}
              className={cn("gencl:gap-2 gencl:z-20")}
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  }

  // fallback for unknown embedType
  return null;
};
