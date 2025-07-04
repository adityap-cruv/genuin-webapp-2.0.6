"use client";
import { useId } from "react";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";

import { BecomeCreatorButton } from "@genuin/components/molecules/become-creator-button";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { ShareButton } from "@genuin/components/molecules/share-button";
import {
  GenericDetails,
  GenericDetailsSkeleton,
} from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { useGetProfileDetails } from "@genuin/components/react-query/api/profile/details";
import {
  CommunityListSkeleton,
  ProfileDetailsTabs,
} from "@genuin/components/templates/profile-details-tabs";
import { DetailsPageTopbar } from "@genuin/components/organisms/details-page-topbar";
import { useBaseContext } from "@genuin/components/context/base";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";

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
    error,
    data: profileData,
  } = useGetProfileDetails(userName, forBrand);
  const detailsId = useId();
  const { brandDetails } = useBaseContext();
  if (isLoading) {
    return <ProfileDetailsSkeleton />;
  }

  if (isError) {
    if (error.message === NOT_FOUND_ERROR_CODES.user) {
      return <ErrorState type="NO_USER" />;
    }

    if (error.message === NOT_FOUND_ERROR_CODES.brand) {
      return <ErrorState type="NO_BRAND_USER" />;
    }

    return <ErrorState type="ERROR" />;
  }

  if (!profileData) {
    return <ErrorState type="NO_USER" />;
  }

  return (
    <>
      <DetailsPageTopbar
        idToTrack={detailsId}
        className="gencl:pl-4 gencl:pr-6 gencl:py-3"
        title={profileData?.name ?? ""}
        profileImageDetails={{
          imageUrl:
            profileData?.profile_image_m ?? profileData?.profile_image ?? "",
          isAvatar: profileData.is_avatar,
          alt: profileData.name ?? "",
        }}
        ctas={
          <div className="gencl:flex gencl:gap-2">
            <BecomeCreatorButton theme="secondary" />
            <ShareButton
              pathName={buildPageUrl({
                type: !!profileData.brand ? "brand" : "profile",
                slug: profileData.nickname,
              })}
            />
          </div>
        }
      />
      <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:p-6">
        <GenericDetails
          id={detailsId}
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
                userName: profileData.nickname ?? "",
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
            linkedin: profileData.linkedin_id
              ? profileData.linkedin_url + profileData.linkedin_id
              : undefined,
            instagram: profileData.insta_id
              ? profileData.insta_url + profileData.insta_id
              : undefined,
            x: profileData.twitter_id
              ? profileData.twitter_url + profileData.twitter_id
              : undefined,
            tiktok: profileData.tiktok_id
              ? profileData.tiktok_url + profileData.tiktok_id
              : undefined,
            ...(Number(brandDetails?.brand_id) !==
              profileData?.brand?.brand_id && {
              custom: profileData.brand?.brand_url,
            }),
          }}
          ctas={
            <div className="gencl:flex gencl:gap-2">
              <BecomeCreatorButton />
              <ShareButton
                pathName={buildPageUrl({
                  type: !!profileData.brand ? "brand" : "profile",
                  slug: profileData.nickname,
                })}
              />
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
    </>
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
