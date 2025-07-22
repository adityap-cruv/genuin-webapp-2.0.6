"use client";
import { useState } from "react";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import { Button } from "@genuin/ui/components/button";
import { getTrendingCommunities } from "@genuin/components/react-query/api/community/trending";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { TrendingCommunitiesSkeleton } from "./skeleton";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CommunityInfoType = {
  community_id: string;
  handle: string;
  name: string;
  dp: string;
  dp_s: string;
  dp_m: string;
  dp_l: string;
  color_code: string;
  text_color_code: string;
  no_of_members: number;
  slug: string;
  banner: string;
  description: string;
};

export function TrendingCommunities() {
  const { isLoading, data, isError } = getTrendingCommunities();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile } = useDeviceDetectMediaQuery();

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  if (isLoading) {
    return <TrendingCommunitiesSkeleton />;
  }

  // TODO: Handle error state properly, e.g., show an error message
  // if (isError) {
  //   return <div>Error loading trending communities.</div>;
  // }

  // TODO: Handle empty state properly
  if (!data || data?.communities.length === 0) {
    return null;
  }

  return isMobile ? (
    <TrendingCommunitiesMobileView data={data} />
  ) : (
    <TrendingCommunitiesDesktopView
      data={data}
      isExpanded={isExpanded}
      handleToggle={handleToggle}
    />
  );
}

// Desktop view component
export function TrendingCommunitiesDesktopView({
  data,
  isExpanded,
  handleToggle,
}: {
  data: { communities: CommunityInfoType[] };
  isExpanded: boolean;
  handleToggle: () => void;
}) {
  const communitiesToDisplay = isExpanded
    ? data.communities
    : data.communities.slice(0, 3);

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-4">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch">
        <p className="gencl:text-headline-4-semi-bold">Trending Communities</p>
        {data.communities.length > 3 && (
          <Button theme="text" onClick={handleToggle}>
            {isExpanded ? "See less" : "See more"}
          </Button>
        )}
      </div>

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:md:grid-cols-3 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        {communitiesToDisplay.map((community: CommunityInfoType) => (
          <Link
            key={community.community_id}
            href={buildPageUrl({ type: "community", slug: community.slug })}
          >
            <CommunityCard
              community={{
                id: community.community_id,
                banner: community.banner,
                description: community.description,
                dp: community.dp,
                name: community.name,
                handle: community.handle,
                slug: community.slug,
                type: "PUBLIC",
                stats: {
                  members: community.no_of_members,
                  groups: 0,
                  posts: 0,
                },
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Mobile view component with horizontal swiper
export function TrendingCommunitiesMobileView({
  data,
}: {
  data: { communities: CommunityInfoType[] };
}) {
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Handle swiper events
  const handleSwiperInit = (swiper: SwiperType) => {
    setSwiperInstance(swiper);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  // Handle slide change
  const handleSlideChange = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="gencl:w-full gencl:relative">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-2">
        <p className="gencl:text-headline-4-semi-bold">Trending Communities</p>
      </div>

      <div className="gencl:swiper-navigation-container gencl:relative">
        <Swiper
          spaceBetween={10}
          slidesPerView={1.05} // Show 5% of the next slide
          className="gencl:w-full"
          modules={[Navigation]}
          navigation={{
            prevEl: ".swiper-community-prev-button",
            nextEl: ".swiper-community-next-button",
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
        >
          {data.communities.map((community: CommunityInfoType) => (
            <SwiperSlide key={community.community_id}>
              <CommunityCard
                community={{
                  id: community.community_id,
                  banner: community.banner,
                  description: community.description,
                  dp: community.dp,
                  name: community.name,
                  handle: community.handle,
                  slug: community.slug,
                  type: "PUBLIC",
                  stats: {
                    members: community.no_of_members,
                    groups: 0,
                    posts: 0,
                  },
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons - Always in DOM but conditionally styled */}
        {/* <Button
          variant="icon"
          className={`swiper-community-prev-button gencl:absolute gencl:left-4 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white gencl:rounded-full gencl:shadow-sm gencl:transition-opacity ${isBeginning ? "gencl:opacity-0 gencl:pointer-events-none" : "gencl:opacity-100"}`}
        >
          <ChevronLeft className="gencl:w-5 gencl:h-5 gencl:stroke-black!" />
        </Button>

        <Button
          variant="icon"
          className={`swiper-community-next-button gencl:absolute gencl:right-4 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white gencl:rounded-full gencl:shadow-sm gencl:transition-opacity ${isEnd ? "gencl:opacity-0 gencl:pointer-events-none" : "gencl:opacity-100"}`}
        >
          <ChevronRight className="gencl:w-5 gencl:h-5 gencl:stroke-black!" />
        </Button> */}
      </div>
    </div>
  );
}
