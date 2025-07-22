"use client";
import { useId, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TabsSkeleton } from "@genuin/ui/tabs";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";

import { BecomeCreatorButton } from "@genuin/components/molecules/become-creator-button";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { GenericDetails } from "@genuin/components/organisms/generic-details";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { useGetProfileDetails } from "@genuin/components/react-query/api/profile/details";
import { ProfileDetailsTabs } from "@genuin/components/templates/profile-details-tabs";
import { DetailsPageTopbar } from "@genuin/components/organisms/details-page-topbar";
import { useBaseContext } from "@genuin/components/context/base";
import { ProfileDetailsSkeleton } from "./skeleton";
import { SideInfo } from "@genuin/components/organisms/side-info";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

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
  const { isMobile } = useDeviceDetectMediaQuery();
  const router = useRouter();

  useEffect(() => {
    if (profileData && profileData.brand && !forBrand) {
      // Redirect to the brand page when profile gets converted into brand
      const brandUrl = buildPageUrl({
        type: "brand",
        slug: profileData.brand.brand_slug,
      });
      router.replace(brandUrl);
    }
  }, [profileData, forBrand, router]);

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

  const ctas = (
    <div className="gencl:flex gencl:gap-2">
      {(forBrand || (!forBrand && profileData && profileData.brand)) && (
        <BecomeCreatorButton
          theme="primary"
          className="gencl:flex-grow gencl:sm:flex-grow-0!"
        />
      )}
      <ShareButton
        pathName={buildPageUrl({
          type: !!profileData?.brand ? "brand" : "profile",
          slug: profileData?.nickname,
        })}
      />
    </div>
  );

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
            {(forBrand || (!forBrand && profileData && profileData.brand)) && (
              <BecomeCreatorButton />
            )}
            <ShareButton
              pathName={buildPageUrl({
                type: !!profileData.brand ? "brand" : "profile",
                slug: !!profileData.brand
                  ? profileData.brand.brand_slug
                  : profileData.nickname,
              })}
            />
          </div>
        }
      />
      <div className="gencl:w-full gencl:overflow-auto gencl:h-full gencl:sm:p-6">
        <GenericDetails
          className="gencl:p-4 gencl:sm:p-0!"
          id={detailsId}
          variant="profile"
          handle={{
            brandUserLogo: profileData.brand?.brand_user_logo,
            userName: profileData.brand?.brand_slug ?? "",
          }}
          stats={{
            Communities: profileData.no_of_communities,
            Groups: profileData.no_of_groups,
            Posts: profileData.videos,
          }}
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
          ctas={ctas}
        />
        <ProfileDetailsTabs
          className="gencl:sm:pt-6!"
          userId={
            forBrand && profileData.brand
              ? profileData.brand?.brand_id.toString()
              : profileData.user_id
          }
          forBrand={forBrand}
          aboutComponent={<About profileDetails={profileData} />}
        />
      </div>
    </>
  );
}

function About({
  profileDetails,
}: {
  profileDetails: ReturnType<typeof useGetProfileDetails>["data"];
}) {
  const { brandDetails } = useBaseContext();
  if (!profileDetails) return;

  // Prepare links object
  const links = {
    linkedin: profileDetails.linkedin_id
      ? profileDetails.linkedin_url + profileDetails.linkedin_id
      : undefined,
    instagram: profileDetails.insta_id
      ? profileDetails.insta_url + profileDetails.insta_id
      : undefined,
    x: profileDetails.twitter_id
      ? profileDetails.twitter_url + profileDetails.twitter_id
      : undefined,
    tiktok: profileDetails.tiktok_id
      ? profileDetails.tiktok_url + profileDetails.tiktok_id
      : undefined,
    ...(Number(brandDetails?.brand_id) !== profileDetails?.brand?.brand_id && {
      custom: profileDetails.brand?.brand_url,
    }),
  };

  // Check if there's any data to display (description or links)
  const hasDescription = !!profileDetails?.bio;
  const hasLinks = Object.values(links).some((link) => !!link);

  // If there's no data to display, show empty state
  if (!hasDescription && !hasLinks) {
    return (
      <div className="gencl:p-4 gencl:h-60 gencl:flex gencl:items-center gencl:justify-center gencl:text-center gencl:bg-secondary-50 gencl:rounded-lg">
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          No additional information available
        </p>
      </div>
    );
  }

  return (
    <SideInfo
      variant="mobile"
      sideInfoData={{
        description: profileDetails?.bio ?? "",
        links,
      }}
    />
  );
}
