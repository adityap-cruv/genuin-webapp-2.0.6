"use client";

import { useState } from "react";
import { TrendingGroupCard } from "@genuin/components/organisms/trending-groups-card";
import { Button } from "@genuin/ui/components/button";
import { getTrendingGroups } from "@genuin/components/react-query/api/group/trending";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperType } from "swiper/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { TrendingGroupsSkeleton } from "./skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GroupMemberInfoType = {
  member_id: string;
  name: string;
  username: string;
  profile_image: string;
  is_avatar: boolean;
};

type GroupInfoType = {
  chat_id: string;
  slug: string;
  group: {
    group_name: string;
    dp: string;
    group_description: string;
    no_of_members: number;
    no_of_videos: number;
    members: GroupMemberInfoType[];
  };
  latest_messages: {
    thumbnail_url: string;
    slug: string;
  }[];
};

// Desktop view component
export function TrendingGroupsDesktopView({
  data,
  isExpanded,
  handleToggle,
}: {
  data: { groups: GroupInfoType[] };
  isExpanded: boolean;
  handleToggle: () => void;
}) {
  const groupsToDisplay = isExpanded ? data.groups : data.groups.slice(0, 3);

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-4">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch">
        <p className="gencl:text-headline-4-semi-bold">Trending Groups</p>
        {data?.groups.length > 3 && (
          <Button theme="text" onClick={handleToggle}>
            {isExpanded ? "See less" : "See more"}
          </Button>
        )}
      </div>

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:md:grid-cols-3 gencl:lg:grid-cols-3 gencl:gap-x-4 gencl:gap-y-6">
        {groupsToDisplay.map(
          ({ chat_id, group, slug, latest_messages }: GroupInfoType) => {
            const formattedPostThumbnails = latest_messages?.map(
              ({ thumbnail_url, slug }) => ({
                imageUrl: thumbnail_url,
                alt: "Post Thumbnail",
                slug: slug,
              })
            );

            const formattedMembersAvatars = group.members.map((member) => ({
              userName: member.username,
              name: member.name,
              imageUrl: member.profile_image,
              isAvatar: member.is_avatar,
              alt: member.name,
            }));
            return (
              <TrendingGroupCard
                className="gencl:w-full gencl:h-full"
                key={chat_id}
                slug={slug}
                groupName={group.group_name}
                description={group.group_description}
                memberCount={group.no_of_members}
                postCount={group.no_of_videos}
                userAvatars={formattedMembersAvatars ?? []}
                postData={formattedPostThumbnails ?? []}
              />
            );
          }
        )}
      </div>
    </div>
  );
}

// Mobile view component with horizontal swiper
function TrendingGroupsMobileView({
  data,
}: {
  data: { groups: GroupInfoType[] };
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
        <p className="gencl:text-headline-4-semi-bold">Trending Groups</p>
      </div>

      <div className="gencl:swiper-navigation-container gencl:relative">
        <Swiper
          spaceBetween={10}
          slidesPerView={1.05} // Show 5% of the next slide
          className="gencl:w-full"
          modules={[Navigation]}
          navigation={{
            prevEl: ".swiper-prev-button",
            nextEl: ".swiper-next-button",
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
        >
          {data.groups.map(
            ({ chat_id, group, latest_messages, slug }: GroupInfoType) => {
              const formattedPostThumbnails = latest_messages?.map(
                ({ thumbnail_url, slug }) => ({
                  imageUrl: thumbnail_url,
                  alt: "Post Thumbnail",
                  slug: slug,
                })
              );

              const formattedMembersAvatars = group.members.map((member) => ({
                userName: member.username,
                name: member.name,
                imageUrl: member.profile_image,
                isAvatar: member.is_avatar,
                alt: member.name,
              }));

              return (
                <SwiperSlide key={chat_id}>
                  <TrendingGroupCard
                    groupName={group.group_name}
                    slug={slug}
                    description={group.group_description}
                    memberCount={group.no_of_members}
                    postCount={group.no_of_videos}
                    userAvatars={formattedMembersAvatars ?? []}
                    postData={formattedPostThumbnails ?? []}
                  />
                </SwiperSlide>
              );
            }
          )}
        </Swiper>

        {/* Navigation buttons - Always in DOM but conditionally styled */}
        {/* <Button
          variant="icon"
          className={`swiper-prev-button gencl:absolute gencl:left-4 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white gencl:rounded-full gencl:shadow-sm gencl:transition-opacity ${isBeginning ? "gencl:opacity-0 gencl:pointer-events-none" : "gencl:opacity-100"}`}
        >
          <ChevronLeft className="gencl:w-5 gencl:h-5 gencl:stroke-black!" />
        </Button>

        <Button
          variant="icon"
          className={`swiper-next-button gencl:absolute gencl:right-4 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white gencl:rounded-full gencl:shadow-sm gencl:transition-opacity ${isEnd ? "gencl:opacity-0 gencl:pointer-events-none" : "gencl:opacity-100"}`}
        >
          <ChevronRight className="gencl:w-5 gencl:h-5 gencl:stroke-black!" />
        </Button> */}
      </div>
    </div>
  );
}

export function TrendingGroups() {
  const { isLoading, data, isError } = getTrendingGroups();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isMobile } = useDeviceDetectMediaQuery();

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  if (isLoading) {
    return <TrendingGroupsSkeleton />;
  }

  // TODO: Handle error state properly, e.g., show an error message
  // if (isError) {
  //   return <div>Error loading trending groups.</div>;
  // }

  // TODO: Handle empty state properly
  if (!data || data?.groups?.length === 0) {
    return null;
  }

  if (isMobile) {
    return <TrendingGroupsMobileView data={data} />;
  }

  return (
    <TrendingGroupsDesktopView
      data={data}
      isExpanded={isExpanded}
      handleToggle={handleToggle}
    />
  );
}

export { TrendingGroupsSkeleton };
