"use client";

import { useState, useEffect } from "react";
import {
  CommunityCard,
  CommunityCardSkeleton,
} from "@genuin/components/organisms/community-card";
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
import { CommunityUserRole } from "@genuin/components/types/post";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared hook for join status logic
function useCommunityJoinStatus(communities: CommunityInfoType[]) {
  const [communitiesWithJoinStatus, setCommunitiesWithJoinStatus] = useState<
    Record<string, CommunityUserRole>
  >({});

  useEffect(() => {
    if (communities?.length) {
      const initialJoinStatus: Record<string, CommunityUserRole> = {};
      communities.forEach((community: CommunityInfoType) => {
        initialJoinStatus[community.community_id] = "UNJOINED";
      });
      setCommunitiesWithJoinStatus(initialJoinStatus);
    }
  }, [communities]);

  const handleCommunityJoinStatusChange = (
    communityId: string,
    newRole: CommunityUserRole
  ) => {
    setCommunitiesWithJoinStatus((prev) => ({
      ...prev,
      [communityId]: newRole,
    }));
  };

  const communitiesWithUpdatedCounts = communities.map(
    (community: CommunityInfoType) => {
      let roleNumber: number | undefined;
      const joinStatus = communitiesWithJoinStatus[community.community_id];
      if (joinStatus === "LEADER") roleNumber = 1;
      else if (joinStatus === "MEMBER") roleNumber = 2;
      else if (joinStatus === "MODERATOR") roleNumber = 3;
      else roleNumber = undefined;
      return {
        ...community,
        joinStatus,
        roleNumber,
        isRequested: joinStatus === "REQUESTED",
      };
    }
  );

  return {
    communitiesWithJoinStatus,
    setCommunitiesWithJoinStatus,
    handleCommunityJoinStatusChange,
    communitiesWithUpdatedCounts,
  };
}

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
  slug: string;
  banner: string;
  description: string;
  no_of_members?: number;
  no_of_videos?: number;
  no_of_loops?: number;
};

// Add interface for community with join status
interface CommunityWithJoinStatus extends CommunityInfoType {
  joinStatus?: CommunityUserRole;
  roleNumber?: number;
  isRequested?: boolean;
}

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
  const { handleCommunityJoinStatusChange, communitiesWithUpdatedCounts } =
    useCommunityJoinStatus(data.communities);

  const communitiesToDisplay = isExpanded
    ? communitiesWithUpdatedCounts
    : communitiesWithUpdatedCounts.slice(0, 3);

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
        {communitiesToDisplay.map((community: CommunityWithJoinStatus) => (
          <Link
            key={community.community_id}
            href={buildPageUrl({ type: "community", slug: community.slug })}
          >
            <CommunityCard
              onCommunityJoinStatusChange={(newRole) =>
                handleCommunityJoinStatusChange(community.community_id, newRole)
              }
              community={{
                id: community.community_id,
                banner: community.banner,
                description: community.description,
                dp: community.dp,
                dp_s: community.dp_s,
                dp_m: community.dp_m,
                dp_l: community.dp_l,
                name: community.name,
                handle: community.handle,
                slug: community.slug,
                type: "PUBLIC",
                logged_in_user_role: community.roleNumber,
                is_community_join_requested: community.isRequested,
                stats: {
                  members: community.no_of_members ?? 0,
                  groups: community.no_of_loops ?? 0,
                  posts: community.no_of_videos ?? 0,
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
  const { handleCommunityJoinStatusChange, communitiesWithUpdatedCounts } =
    useCommunityJoinStatus(data.communities);

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
        {/* Use a fixed height container with a specific height */}
        <div className="gencl:swiper-container">
          <Swiper
            spaceBetween={10}
            slidesPerView={1.05} // Show 5% of the next slide
            className="gencl:w-full gencl:h-58"
            modules={[Navigation]}
            navigation={{
              prevEl: ".swiper-community-prev-button",
              nextEl: ".swiper-community-next-button",
            }}
            onSwiper={handleSwiperInit}
            onSlideChange={handleSlideChange}
            autoHeight={false}
            watchSlidesProgress={true}
          >
            {communitiesWithUpdatedCounts.map(
              (community: CommunityWithJoinStatus) => (
                <SwiperSlide
                  key={community.community_id}
                  className="gencl:h-full"
                >
                  <div className="gencl:card-wrapper gencl:h-full">
                    <Link
                      href={buildPageUrl({
                        type: "community",
                        slug: community.slug,
                      })}
                      className="gencl:block gencl:w-full gencl:h-full"
                    >
                      <CommunityCard
                        className="gencl:h-full gencl:flex gencl:flex-col"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                        onCommunityJoinStatusChange={(newRole) =>
                          handleCommunityJoinStatusChange(
                            community.community_id,
                            newRole
                          )
                        }
                        community={{
                          id: community.community_id,
                          banner: community.banner,
                          description: community.description,
                          dp: community.dp,
                          dp_s: community.dp_s,
                          dp_m: community.dp_m,
                          dp_l: community.dp_l,
                          name: community.name,
                          handle: community.handle,
                          slug: community.slug,
                          type: "PUBLIC",
                          logged_in_user_role: community.roleNumber,
                          is_community_join_requested: community.isRequested,
                          stats: {
                            members: community.no_of_members ?? 0,
                            groups: community.no_of_loops ?? 0,
                            posts: community.no_of_videos ?? 0,
                          },
                        }}
                      />
                    </Link>
                  </div>
                </SwiperSlide>
              )
            )}
          </Swiper>
        </div>

        {/* Navigation buttons - Always in DOM but conditionally styled */}

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
