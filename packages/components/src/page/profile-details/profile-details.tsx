import { Loader } from "@genuin/ui/loader";

import { BecomeCreatorButton } from "src/molecules/become-creator-button";
import { ShareButton } from "src/molecules/share-button";
import { GenericDetails } from "src/organisms";
import { GenericDetailsMetadata } from "src/organisms/generic-details/generic-details-metadata";
import { useGetProfileDetails } from "src/react-query/api/profile/details";
import { ProfileDetailsTabs } from "src/templates/profile-details-tabs";

export function ProfileDetails({ userName }: { userName: string }) {
  const {
    isLoading,
    isError,
    data: profileData,
  } = useGetProfileDetails(userName);

  // TODO: handle the loading state.
  if (isLoading) {
    return <Loader />;
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
        metadata={
          <GenericDetailsMetadata
            brandDetails={
              profileData.brand
                ? {
                    isVerified: profileData.brand?.brand_user_logo === 1,
                    url: profileData.brand?.brand_url ?? "",
                    userName: profileData.brand?.brand_slug ?? "",
                  }
                : undefined
            }
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
      <ProfileDetailsTabs className="gencl:pt-6" userId={profileData.user_id} />
    </div>
  );
}
