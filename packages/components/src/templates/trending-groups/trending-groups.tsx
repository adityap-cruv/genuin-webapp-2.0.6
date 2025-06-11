import { useEffect, useState } from "react";
import {
  TrendingGroupCard,
  TrendingGroupCardSkeleton,
} from "@/organisms/trending-groups-card";
import { Button } from "@genuin/ui/components/button";
import { Skeleton } from "@genuin/ui/components/skeleton";

type TrendingGroups = {
  groupName: string;
  memberCount: string;
  postCount: string;
  userAvatars: {
    imageUrl: string;
    alt: string;
    isAvatar: boolean;
    userName: string;
    name: string;
  }[];
  content: string;
  thumbnailAvatars: {
    imageUrl: string;
    alt: string;
    isAvatar: boolean;
  }[];
};

export function TrendingGroups(props: {
  groups: TrendingGroups[] | [];
  isLoading: boolean;
}) {
  const [hasMore, setHasMore] = useState(true);
  const [groups, setGroups] = useState(props?.groups);

  function fetchMoreGroups() {
    if (!hasMore) {
      setHasMore(true);
      return;
    }
    setTimeout(() => {
      setHasMore(false);
    }, 2000);
  }

  useEffect(() => {
    setGroups(props?.groups);
    return () => {
      setHasMore(true);
    };
  }, [props]);

  if (props.isLoading) {
    return <TrendingGroupsSkeleton />;
  }

  // TODO: Handle error state properly, e.g., show an error message
  // if (isError) {
  //   return <div>Error loading communities.</div>;
  // }

  // TODO: Handle empty state properly
  if (!groups || groups.length === 0) {
    return <div className="gencl:text-center">No groups found.</div>;
  }

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch">
        <p className="pb-2 pt-6 text-title-1-bold gencl:text-headline-3-semi-bold">
          Trending Groups
        </p>
        {groups.length !== 0 && (
          <Button theme="text" onClick={() => fetchMoreGroups()}>
            {hasMore ? "See more" : "See less"}
          </Button>
        )}
      </div>

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-3 gencl:mt-4">
        {groups.map((item, index) => (
          <TrendingGroupCard
            key={index}
            groupName={item.groupName}
            memberCount={item.memberCount}
            postCount={item.postCount}
            userAvatars={item.userAvatars}
            content={item.content}
            thumbnailAvatars={item.thumbnailAvatars}
          />
        ))}
      </div>
    </div>
  );
}

function TrendingGroupsSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <Skeleton className="gencl:w-[25%] gencl:h-8" />
        <Skeleton className="gencl:w-32 gencl:h-6" />
      </div>
      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-2 gencl:lg:grid-cols-3 gencl:gap-x-2 gencl:gap-y-4">
        <GroupsSkeleton noOfGroups={4} />
      </div>
    </div>
  );
}

function GroupsSkeleton({ noOfGroups = 1 }: { noOfGroups: number }) {
  return Array.from({ length: noOfGroups }).map(() => (
    <TrendingGroupCardSkeleton />
  ));
}
