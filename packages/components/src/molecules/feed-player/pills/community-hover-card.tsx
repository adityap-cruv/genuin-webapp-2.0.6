import { Avatar } from "@genuin/ui/avatar";
import { type ComponentProps } from "react";

import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { cn } from "@genuin/ui/lib/utils";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Stats } from "@genuin/components/molecules/stats";
import { Tag } from "@genuin/components/molecules/tag";
import { compressText } from "@genuin/components/lib/utils";
import { useAuthContext } from "@genuin/components/context/auth";

type CommunityHoverCardProps = {
  communityDetails: PostDetailsType["community"];
  onCommunityJoinStatusChange: ComponentProps<
    typeof JoinCommunityButton
  >["onCommunityJoinStatusChange"];
} & ComponentProps<"div">;

export function CommunityHoverCard({
  communityDetails,
  onCommunityJoinStatusChange,
  className,
  ...restProps
}: CommunityHoverCardProps) {
  const { name, profileImage, isPrivate, brand, id, userRole } =
    communityDetails;
  const { authenticationStatus } = useAuthContext();

  return (
    <div
      className={cn("gencl:space-y-2 gencl:w-full", className)}
      {...restProps}
    >
      <Avatar
        alt={name ?? ""}
        imageUrl={profileImage ?? ""}
        isAvatar={false}
        size="2xl"
      />
      <div className="gencl:space-y-1">
        <p className="gencl:text-body-1-semi-bold gencl:line-clamp-2">{name}</p>
        <GenericDetailsMetadata
          className="gencl:items-center"
          privacyInfo={{ isPrivate, showPrivacyText: false }}
          handle={{
            url: buildPageUrl({
              type: "community",
              slug: communityDetails.slug,
            }),
            userName: compressText(communityDetails.handle, 12),
          }}
          others={
            brand && (
              <>
                <p>in</p>
                <Tag
                  size="sm"
                  title={communityDetails.brand?.name ?? ""}
                  alt={communityDetails.brand?.name ?? ""}
                  profileImage={{
                    url: communityDetails.brand?.logo ?? "",
                    isAvatar: false,
                  }}
                  url={buildPageUrl({
                    type: "brand",
                    slug: communityDetails.brand?.slug ?? "",
                  })}
                  userLogoType={communityDetails.brand?.userLogo}
                  userName={"@" + communityDetails.handle}
                />
              </>
            )
          }
        />
        <Stats
          className="gencl:flex gencl:gap-1 gencl:text-body-1-medium! gencl:text-secondary-600"
          valueFirst={true}
          valueClassName="gencl:text-black! gencl:mr-1"
          labelClassName="gencl:mr-1"
          separator="•"
          stats={{
            Members: communityDetails.membersCount ?? 0,
            Groups: communityDetails.groupsCount ?? 0,
            Posts: communityDetails.postsCount ?? 0,
          }}
        />
      </div>

      <div className="gencl:flex gencl:gap-2 gencl:w-full">
        {authenticationStatus === "authenticated" && (
          <JoinCommunityButton
            communityId={id}
            communityHandle={communityDetails.handle}
            communityName={communityDetails.name ?? ""}
            slug={communityDetails.slug}
            isPrivate={isPrivate}
            role={userRole}
            onCommunityJoinStatusChange={onCommunityJoinStatusChange}
            className="gencl:flex-grow"
          />
        )}
        <ShareButton
          pathName={buildPageUrl({
            type: "community",
            slug: communityDetails.slug,
          })}
        />
      </div>
    </div>
  );
}
