"use client";

import { useState } from "react";
import {
  TrendingGroupCard,
  TrendingGroupCardSkeleton,
} from "@genuin/components/organisms/trending-groups-card";
import { Button } from "@genuin/ui/components/button";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { getTrendingGroups } from "@genuin/components/react-query/api/group/trending";

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

export function TrendingGroups() {
  const { isLoading, data, isError } = getTrendingGroups();

  const [isExpanded, setIsExpanded] = useState(false);

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

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-2">
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
                key={chat_id}
                slug={slug}
                description={group.group_description}
                memberCount={group.no_of_members}
                postCount={group.no_of_videos}
                groupName={group.group_name}
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

export function TrendingGroupsSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-4">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch">
        <Skeleton className="gencl:w-40 gencl:h-6" />
        <Skeleton className="gencl:w-20 gencl:h-6" />
      </div>
      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-3">
        <GroupsSkeleton noOfGroups={3} />
      </div>
    </div>
  );
}

function GroupsSkeleton({ noOfGroups = 1 }: { noOfGroups: number }) {
  return Array.from({ length: noOfGroups }).map((_, index) => (
    <TrendingGroupCardSkeleton key={index} />
  ));
}
