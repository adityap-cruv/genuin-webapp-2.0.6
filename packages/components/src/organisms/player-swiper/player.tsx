import { cn } from "@genuin/ui/utils";
import { useBaseContext } from "src/context/base";
import { ControlLayer, FeedPlayer } from "src/molecules/feed-player";
import { PlayerProvider } from "src/molecules/feed-player/context";
import type { PostDetailsType } from "src/react-query/api/feed/schema";
import { useFeedContext } from "src/templates/feed/context";
import { useSwiper, useSwiperSlide } from "swiper/react";
import { useWindowSize } from "usehooks-ts";

type PlayerProps = {
  post: PostDetailsType;
};

export function Player({ post }: PlayerProps) {
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
        <ControlLayer postDetails={post} />
      </div>
    </PlayerProvider>
  );
}
