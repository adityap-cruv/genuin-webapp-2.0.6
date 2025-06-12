import { Avatar } from "@genuin/ui/avatar";
import { type ComponentProps } from "react";

import { JoinCommunityButton } from "@molecules/join-community-button";
import { ShareButton } from "@molecules/share-button";
import { PostDetailsType } from "@react-query/api/feed/schema";
import { cn } from "@genuin/ui/lib/utils";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Stats } from "@molecules/stats";
import { Tag } from "@molecules/tag";

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
            userName: communityDetails.handle,
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
        <JoinCommunityButton
          communityId={id}
          isPrivate={isPrivate}
          role={userRole}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          className="gencl:flex-grow"
        />
        <ShareButton />
      </div>
    </div>
  );
}
