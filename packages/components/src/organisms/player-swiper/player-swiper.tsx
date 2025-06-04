import "swiper/css";
import { SwiperSlide } from "swiper/react";
import { useBoolean } from "usehooks-ts";

import { Actions } from "src/molecules/actions";
import type { PostDetailsType } from "src/react-query/api/feed/schema";
import { useFeedContext } from "src/templates/feed/context";

import { Comments } from "../comments";

import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";


type PlayerListPropsType = {
  posts: PostDetailsType[];
  onActiveIndexChange?: (index: number) => void;
  startIndex?: number;
  className?: string;
  /**
   * Whether to show the expand view.
   */
  showExpandView?: boolean;
  /**
   * Function to toggle the expand view.
   */
  toggleExpandView?: () => void;
};

export function PlayerList({
  posts,
  startIndex = 0,
  onActiveIndexChange,
}: PlayerListPropsType) {
  const { value, toggle } = useBoolean();
  const { showExpandView, activeIndex } = useFeedContext();

  return (
    <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-6">
      <SwiperImplementation
        startIndex={startIndex}
        onActiveIndexChange={onActiveIndexChange}
      >
        {posts.map((post) => {
          return (
            <SwiperSlide key={post.video.id}>
              <div className="gencl:flex gencl:gap-2 gencl:h-full">
                <Player post={post} />
                <Actions
                  variant={showExpandView ? "dark" : "light"}
                  className="gencl:shrink-0 gencl:pb-4"
                  actionWrapper={{
                    COMMENT: (defaultNode) => (
                      <span onClick={toggle}>{defaultNode}</span>
                    ),
                  }}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </SwiperImplementation>
      {/* show this only if expand view is open  */}
      {value && showExpandView && posts[activeIndex] && (
        <div className="gencl:w-100 gencl:h-full gencl:py-6">
          <Comments
            videoId={posts[activeIndex].video.id}
            className="gencl:h-full"
          />
        </div>
      )}
    </div>
  );
}
