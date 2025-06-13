import { useState } from "react";
import {
  CommunityCard,
  CommunityCardSkeleton,
} from "@organisms/community-card";
import { Button } from "@genuin/ui/components/button";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { getTrendingCommunities } from "@react-query/api/community/trending";

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
  if (isError) {
    return <div>Error loading trending communities.</div>;
  }

  // TODO: Handle empty state properly
  if (!data || data?.communities.length === 0) {
    return (
      <div className="gencl:text-center">No trending communities found.</div>
    );
  }

  const communitiesToDisplay = isExpanded
    ? data.communities
    : data.communities.slice(0, 3);

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <p className="gencl:text-headline-4-semi-bold">Trending Communities</p>
        {data.communities.length > 3 && (
          <Button theme="text" onClick={handleToggle}>
            {isExpanded ? "See less" : "See more"}
          </Button>
        )}
      </div>

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:md:grid-cols-3 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        {communitiesToDisplay.map((community: CommunityInfoType) => (
          <CommunityCard
            key={community.community_id}
            community={{
              banner: community.banner,
              description: community.description,
              dp: community.dp,
              name: community.name,
              stats: {
                members: community.no_of_members,
                groups: 0,
                posts: 0,
              },
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TrendingCommunitiesSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <Skeleton className="gencl:w-[25%] gencl:h-8" />
        <Skeleton className="gencl:w-32 gencl:h-6" />
      </div>
      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        <CommunitiesSkeleton noOfCommunities={4} />
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
