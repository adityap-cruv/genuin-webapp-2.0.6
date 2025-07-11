"use client";

import { useState } from "react";
import {
  CommunityCard,
  CommunityCardSkeleton,
} from "@genuin/components/organisms/community-card";
import { Button } from "@genuin/ui/components/button";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { getTrendingCommunities } from "@genuin/components/react-query/api/community/trending";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

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

export function TrendingCommunitiesSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <Skeleton className="gencl:w-[25%] gencl:h-8" />
        <Skeleton className="gencl:w-32 gencl:h-6" />
      </div>
      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        <CommunitiesSkeleton noOfCommunities={3} />
      </div>
    </div>
  );
}

function CommunitiesSkeleton({
  noOfCommunities = 1,
}: {
  noOfCommunities: number;
}) {
  return Array.from({ length: noOfCommunities }).map((_, index) => (
    <CommunityCardSkeleton key={index} />
  ));
}
