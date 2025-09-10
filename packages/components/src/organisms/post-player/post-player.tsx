import { type ComponentProps } from "react";
import {
  ControlLayer,
  FeedPlayer,
} from "@genuin/components/molecules/feed-player";
import { cn } from "@genuin/ui/lib/utils";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { PostData } from "../create-post/types";

type PostPlayerProps = ComponentProps<"div"> & {
  editClipVideo?: (url: string) => void;
  editCoverImage?: (url: string) => void;
  post: PostData;
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
  const { showExpandView, toggleExpandView } = useFeedContext();

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
        showExpandView={showExpandView}
        toggleExpandView={toggleExpandView}
        swipeNext={() => null}
      >
        <GestureProvider>
          <FeedPlayer
            postDetails={post}
            src={post.video.source}
            id={post.video.id}
            poster={post.video.thumbnail ?? ""}
            // className="gencl:bg-secondary-200 gencl:object-cover gencl:aspect-reel"
            playsInline
          />
          <ControlLayer
            isActive={true}
            postDetails={post}
            showExpand={false}
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
