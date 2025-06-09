import "swiper/css";
import { Button } from "@genuin/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SwiperSlide, useSwiper } from "swiper/react";
import { useBoolean } from "usehooks-ts";

import { Actions } from "@molecules/actions";
import type { PostDetailsType } from "@react-query/api/feed/schema";
import { useFeedContext } from "@templates/feed/context";

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
        {/* in case of expand view show navigation buttons. */}
        {showExpandView && <NavigationButton />}
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

function NavigationButton() {
  const swiper = useSwiper();
  return (
    <div className="gencl:z-50 gencl:text-white gencl:space-y-4 gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2">
      <Button
        theme="navigation"
        disabled={swiper.isBeginning}
        onClick={() => swiper.slidePrev()}
      >
        <ChevronUp className="gencl:stroke-white gencl:size-5" />
      </Button>
      <Button
        theme="navigation"
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
      >
        <ChevronDown className="gencl:stroke-white gencl:size-5" />
      </Button>
    </div>
  );
}
