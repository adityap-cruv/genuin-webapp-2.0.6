import { type ComponentProps } from "react";
import {
  ControlLayer,
  FeedPlayer,
} from "@genuin/components/molecules/feed-player";
import { cn } from "@genuin/ui/lib/utils";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

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
  return (
    <div
      className={cn(
        "gencl:relative gencl:group gencl:overflow-clip",
        className
      )}
      {...restProps}
    >
      <PlayerProvider
        isActive={true}
        videoId={post.video.id}
        onPlayerIterationEnd={() => null}
      >
        <GestureProvider>
          <FeedPlayer
            src={post.video.source}
            videoId={post.video.id}
            poster={post.video.thumbnail ?? ""}
            // className="gencl:bg-secondary-200 gencl:object-cover gencl:aspect-reel"
            playsInline
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
