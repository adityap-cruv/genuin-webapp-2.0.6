import { useEffect, useState } from "react";
import { Button } from "@genuin/ui/components/button";
import {
  ProfileItem,
  ProfileItemSkeleton,
} from "@genuin/components/molecules/profile-item";
import { Skeleton } from "@genuin/ui/components/skeleton";

type ProfileDataType = {
  username: string;
  is_verified: boolean;
  is_avatar: boolean;
  profile_img: string;
};

export function TrendingProfilesList(props: {
  profiles: ProfileDataType[] | [];
  isLoading: boolean;
}) {
  const [hasMore, setHasMore] = useState(true);
  const [profiles, setProfiles] = useState<ProfileDataType[]>([]);

  function fetchMoreProfiles() {
    if (!hasMore) {
      setHasMore(true);
      return;
    }
    setTimeout(() => {
      setHasMore(false);
    }, 2000);
  }

  useEffect(() => {
    setProfiles(props.profiles);
    return () => {
      setHasMore(true);
    };
  }, [props]);

  const visibleProfiles = !hasMore ? profiles : profiles.slice(0, 3);

  if (props.isLoading) {
    return <TrendingProfilesSkeleton />;
  }

  // TODO: Handle error state properly, e.g., show an error message
  // if (isError) {
  //   return <div>Error loading profiles.</div>;
  // }

  // TODO: Handle empty state properly
  if (!profiles || profiles.length === 0) {
    return <div className="gencl:text-center">No profiles found.</div>;
  }

  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <p className="gencl:text-headline-4-semi-bold">Trending Profiles</p>
        {profiles.length !== 0 && (
          <Button theme="text" onClick={() => fetchMoreProfiles()}>
            {hasMore ? "See more" : "See less"}
          </Button>
        )}
      </div>

      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-12 gencl:lg:grid-cols-9 gencl:xl:grid-cols-12 gencl:gap-x-2 gencl:gap-y-4">
        {visibleProfiles.map((profile, index) => (
          <ProfileItem
            key={index}
            className="gencl:flex gencl:flex-col gencl:items-center"
            username={profile.username}
            isVerified={profile.is_verified}
            profileImage={{
              isAvatar: profile.is_avatar,
              url: profile.profile_img,
            }}
          />
        ))}
        {props.isLoading && <ProfilesSkeleton noOfProfiles={4} />}
      </div>
    </div>
  );
}

function TrendingProfilesSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:flex-col">
      <div className="gencl:flex gencl:justify-between gencl:items-center gencl:self-stretch gencl:mb-4">
        <Skeleton className="gencl:w-[20%] gencl:h-8" />
        <Skeleton className="gencl:w-32 gencl:h-6" />
      </div>
      <div className="gencl:grid gencl:grid-cols-1 gencl:sm:grid-cols-12 gencl:lg:grid-cols-9 gencl:xl:grid-cols-12 gencl:gap-x-2 gencl:gap-y-4">
        <ProfilesSkeleton noOfProfiles={4} />
      </div>
    </div>
  );
}

function ProfilesSkeleton({ noOfProfiles = 1 }: { noOfProfiles: number }) {
  return Array.from({ length: noOfProfiles }).map(() => (
    <ProfileItemSkeleton className="gencl:flex gencl:flex-col gencl:items-center" />
  ));
}
