import { cn } from "@genuin/ui/utils";
import { useBaseContext } from "@genuin/components/context/base";
import { ControlLayer, FeedPlayer } from "@molecules/feed-player";
import { PlayerProvider } from "@molecules/feed-player/context";
import type { PostDetailsType } from "@react-query/api/feed/schema";
import { useFeedContext } from "@templates/feed/context";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { useWindowSize } from "usehooks-ts";
import { ComponentProps } from "react";

type PlayerProps = {
  post: PostDetailsType;
  onCommunityJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<
    typeof ControlLayer
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<
    typeof ControlLayer
  >["onGroupSubscriptionChange"];
};

export function Player({
  post,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
}: PlayerProps) {
  const { showExpandView, toggleExpandView } = useFeedContext();
  const { height } = useWindowSize();
  const { feedVideoSizeBox } = useBaseContext();
  const { isActive } = useSwiperSlide();
  const swiper = useSwiper();

  return (
    <PlayerProvider
      isActive={isActive}
      videoId={post.video.id}
      showExpandView={showExpandView}
      toggleExpandView={toggleExpandView}
      swipeNext={() => {
        swiper.slideNext();
      }}
    >
      <div
        className={cn(
          "gencl:group gencl:relative gencl:h-full gencl:overflow-clip",
          {
            "gencl:rounded-xl": !showExpandView,
          }
        )}
      >
        <FeedPlayer
          postDetails={post}
          src={post.video.source}
          id={post.video.id}
          poster={post.video.thumbnail ?? ""}
          className={cn("gencl:bg-secondary-200 gencl:object-cover")}
          playsInline
          style={{
            width: showExpandView ? (height * 9) / 16 : feedVideoSizeBox.width,
          }}
        />
        <ControlLayer
          postDetails={post}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
        />
      </div>
    </PlayerProvider>
  );
}
