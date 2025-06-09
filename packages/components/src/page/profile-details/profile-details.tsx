import { TabsSkeleton } from "@genuin/ui/tabs";

import { BecomeCreatorButton } from "@molecules/become-creator-button";
import { ShareButton } from "@molecules/share-button";
import {
  GenericDetails,
  GenericDetailsSkeleton,
} from "@organisms/generic-details";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { useGetProfileDetails } from "@react-query/api/profile/details";
import {
  CommunityListSkeleton,
  ProfileDetailsTabs,
} from "@templates/profile-details-tabs";

export function ProfileDetails({
  userName,
  forBrand,
}: {
  userName: string;
  forBrand: boolean;
}) {
  const {
    isLoading,
    isError,
    data: profileData,
  } = useGetProfileDetails(userName, forBrand);

  if (isLoading) {
    return <ProfileDetailsSkeleton />;
  }

  // TODO: handle the error state.
  if (isError || !profileData) {
    return <div>Error loading profile details.</div>;
  }

  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:p-6">
      <GenericDetails
        className=""
        title={profileData?.name ?? ""}
        profileImageDetails={{
          imageUrl:
            profileData?.profile_image_m ?? profileData?.profile_image ?? "",
          isAvatar: profileData.is_avatar,
          alt: profileData.name ?? "",
        }}
        userLogoType={profileData.brand?.brand_user_logo}
        metadata={
          <GenericDetailsMetadata
            handle={{
              brandUserLogo: profileData.brand?.brand_user_logo,
              url: profileData.brand?.brand_url ?? "",
              userName: profileData.brand?.brand_slug ?? "",
            }}
            stats={{
              Communities: profileData.no_of_communities,
              Groups: profileData.no_of_groups,
              Posts: profileData.videos,
            }}
          />
        }
        description={profileData.bio}
        links={{
          x: profileData.twitter_url,
          instagram: profileData.insta_url,
          tiktok: profileData.tiktok_url,
        }}
        ctas={
          <div className="gencl:flex gencl:gap-2">
            <BecomeCreatorButton />
            <ShareButton showText />
          </div>
        }
      />
      <ProfileDetailsTabs
        className="gencl:pt-6"
        userId={
          forBrand && profileData.brand
            ? profileData.brand?.brand_id.toString()
            : profileData.user_id
        }
        forBrand={forBrand}
      />
    </div>
  );
}

export function ProfileDetailsSkeleton() {
  return (
    <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:p-6">
      <GenericDetailsSkeleton />
      <TabsSkeleton noOfTabs={1} className="gencl:pt-6" />
      <div className="gencl:pt-6">
        <CommunityListSkeleton />
      </div>
    </div>
  );
}
