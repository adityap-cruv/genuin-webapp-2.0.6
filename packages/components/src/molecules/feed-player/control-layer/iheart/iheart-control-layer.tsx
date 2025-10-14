import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { type FC } from "react";
import { Image } from "@genuin/ui/components/image";
import {
  IHeartControls,
  IHeartListenLiveButton,
  IHeartEndOfContentOverlay,
} from "./index";
import { compressText } from "@genuin/components/lib/utils";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { ControlLayerPropsType } from "../control-layer.types";
import { useBaseContext } from "@genuin/components/context";
import { usePlayerContext } from "../../context";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { Link } from "@genuin/components/molecules/link";

export const IHeartControlLayer: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  onReactionStateChange,
  onClick,
  ...restProps
}) => {
  const { baseContextManager } = useBaseContext();
  const { play } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  const isWatched = baseContextManager.getVideoState(
    postDetails.video.id
  )?.isWatched;
  const isPodcast = embedDetails?.embedData?.brand_context?.some(
    (context) => context.type === "podcast"
  );

  return (
    <div
      className={cn("gencl:h-full gencl:relative", className)}
      onClick={(e) => {
        if (postDetails.video.isWatched || isWatched) {
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      {...restProps}
    >
      {/* Header Section */}
      <div className="gencl:absolute gencl:top-0 gencl:w-full gencl:flex gencl:justify-between gencl:items-center gencl:gap-2 gencl:text-white gencl:p-3 gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent">
        {postDetails.video.attributes?.image_url && (
          <Image
            aspectRatio="square"
            src={postDetails.video.attributes?.image_url ?? ""}
            alt={postDetails.video.attributes?.video_slug ?? ""}
            className="gencl:size-12 gencl:rounded-md gencl:object-cover"
          />
        )}
        <div className="gencl:w-full">
          {(postDetails.video.attributes?.station_title ||
            postDetails.video.attributes?.podcast_title) && (
            <p className="gencl:text-body-2-semi-bold gencl:line-clamp-1 gencl:tracking-[-0.35px]!">
              {isPodcast
                ? postDetails.video.attributes?.podcast_title
                : postDetails.video.attributes?.station_title}
            </p>
          )}
          {postDetails.video.attributes?.description && (
            <p className="gencl:text-body-2-normal gencl:line-clamp-2 gencl:tracking-[-0.35px]!">
              {postDetails.video.attributes?.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="gencl:absolute gencl:bottom-0 gencl:p-3 gencl:text-white gencl:w-full gencl:space-y-3 gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent">
        <div>
          <div className="gencl:text-body-2-normal gencl:line-clamp-2 gencl:tracking-[-0.35px]!">
            {getMonthYear(postDetails.video.createdAt ?? 0)}
            {postDetails.video.duration && " • "}
            {getFormattedDuration(
              String(postDetails.video.duration ?? "")
            )}{" "}
            <ReadMore
              text={postDetails.video.description ?? ""}
              position="overlay"
              shouldAnimate
              textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px]! gencl:text-white/70!"
              expandable={false}
              display="inline"
            />
          </div>
        </div>

        {/* Controls Section */}
        <div
          className={cn(
            "gencl:overflow-hidden gencl:transition-all gencl:ease-in-out gencl:duration-300 gencl:flex gencl:items-center gencl:justify-between"
          )}
        >
          <IHeartControls
            onClick={(e) => e.stopPropagation()}
            className={cn("gencl:z-20")}
            size="lg"
            variant="clip"
            contentId={postDetails.video.id}
            slug={postDetails.video.slug}
            isReacted={postDetails.video.isSparked ?? false}
            reactionCount={postDetails.video.sparkCount}
            onReactionStateChange={(isReacted) => {
              const videoId =
                postDetails.video.slug ===
                embedDetails?.embedData.startVideoSlug
                  ? postDetails.video.slug
                  : postDetails.video.id;
              onReactionStateChange?.(videoId, isReacted);
            }}
          />
          {/* TODO : iheart phase-2 implementation  */}
          {/* <IHeartListenLiveButton variant="filled" /> */}
        </div>
      </div>

      {(postDetails.video.isWatched || isWatched) && (
        <IHeartEndOfContentOverlay
          onGoToEpisodes={() => {
            // Handle go to episodes action
            console.log("Go to episodes clicked");
          }}
          onPlayAgain={() => {
            // Handle play again action
            play(true, 0);
            baseContextManager.setVideoWatched({
              videoId: postDetails.video.id,
              isWatched: false,
            });
          }}
        />
      )}
    </div>
  );
};
