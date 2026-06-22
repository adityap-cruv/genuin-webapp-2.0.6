import { cn } from "@genuin/ui/lib/utils";
import { useMemo, type ComponentProps } from "react";

import { useBaseContext, VideoTypes } from "@genuin/components/context";
import { ControlLayer, FeedPlayer } from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type PostPlayerProps = ComponentProps<"div"> & {
  editClipVideo?: (url: string) => void;
  editCoverImage?: (url: string) => void;
  post: PostDetailsType;
  showClipVideoBtn?: boolean;
  showEditCoverBtn?: boolean;
};

export function PostPlayer({
  post,
  editClipVideo,
  editCoverImage,
  className,
  showClipVideoBtn = true,
  showEditCoverBtn = true,
  ...restProps
}: PostPlayerProps) {
  const { isInIframe } = useBaseContext();
  const videoType = post.video?.videoType ?? VideoTypes.Content;
  return (
    <div className={cn("gencl:relative gencl:group gencl:overflow-clip", className)} {...restProps}>
      <PlayerProvider
        isActive={true}
        videoId={post.video?.id ?? ""}
        videoUrl={post.video?.source ?? ""}
        onPlayerIterationEnd={() => null}
        videoDescription={post.video?.descritptionText}
        videoType={videoType}>
        <GestureProvider isInIframe={isInIframe}>
          <FeedPlayer
            src={post.video?.source}
            videoId={post.video?.id || ""}
            poster={post.video?.thumbnail ?? ""}
            className="gencl:bg-secondary-200 gencl:w-full"
            style={{ height: "inherit" }}
            adsPlatform={post.video?.adsPlatform}
            playsInline
            videoDescription={post.video?.descritptionText}
            videoType={videoType}
            sponsorshipInfo={post.sponsored}
          />
          <ControlLayer
            isActive={true}
            postDetails={post}
            enableExpand={false}
            expandViewDetails={false}
            clipVideo={showClipVideoBtn}
            editCover={showEditCoverBtn}
            editClipVideo={editClipVideo}
            editCoverImage={editCoverImage}
          />
        </GestureProvider>
      </PlayerProvider>
    </div>
  );
}
