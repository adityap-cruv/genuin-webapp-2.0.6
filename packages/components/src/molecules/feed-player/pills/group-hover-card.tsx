import type { ComponentProps } from "react";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { PrivacyInfo } from "@genuin/components/molecules/privacy-info";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { GenericDetailsMetadata } from "@genuin/components/organisms/generic-details/generic-details-metadata";
import { Tag } from "@genuin/components/molecules/tag";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

type GroupHoverCardProps = {
  groupDetails: PostDetailsType["group"];
  communityDetails: PostDetailsType["community"];
  onGroupJoinStatusChange?: ComponentProps<
    typeof JoinGroupButton
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof GroupSubscriptionButton
  >["onSubscriptionChange"];
  isAuthenticated?: boolean;
} & ComponentProps<"div">;

export function GroupHoverCard({
  groupDetails,
  communityDetails,
  className,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  ...props
}: GroupHoverCardProps) {
  const { name, isPrivate } = groupDetails;

  const ldDescription = `${
    groupDetails?.description ? groupDetails.description + " | " : ""
  } • Join ${groupDetails.name} to talk about it`;

  return (
    <div className="gencl:space-y-2" {...props}>
      <div className="gencl:space-y-1">
        <p className="gencl:text-body-1-semi-bold gencl:line-clamp-2">{name}</p>
        <GenericDetailsMetadata
          className="gencl:flex gencl:items-center"
          privacyInfo={{
            isPrivate,
            showPrivacyText: false,
          }}
          others={
            communityDetails && (
              <>
                <p>in</p>
                <Tag
                  size="sm"
                  alt={communityDetails.name ?? ""}
                  profileImage={{
                    url: communityDetails.profileImage ?? "",
                    isAvatar: false,
                  }}
                  url={buildPageUrl({
                    type: "community",
                    slug: communityDetails.slug,
                  })}
                  userName={communityDetails.name ?? ""}
                  title={communityDetails.name ?? ""}
                  className="gencl:pr-2"
                />
              </>
            )
          }
        />
      </div>
      <div className="gencl:flex gencl:items-center gencl:space-x-2">
        <>
          <JoinGroupButton
            size="sm"
            className="gencl:flex-grow"
            groupId={groupDetails.id}
            groupName={groupDetails.name ?? ""}
            groupDescription={ldDescription}
            shareUrl={groupDetails.shareUrl ?? ""}
            isPrivate={groupDetails.isPrivate}
            role={groupDetails.role}
            onGroupJoinStatusChange={onGroupJoinStatusChange}
          />
          <GroupSubscriptionButton
            size="sm"
            groupId={groupDetails.id}
            groupName={groupDetails.name ?? ""}
            groupDescription={ldDescription}
            shareUrl={groupDetails.shareUrl ?? ""}
            isSubscriber={groupDetails.isSubscribed ?? false}
            onSubscriptionChange={onGroupSubscriptionChange}
          />
        </>
        <ShareButton
          size="sm"
          pathName={buildPageUrl({
            type: "group",
            slug: groupDetails.slug,
          })}
        />
      </div>
    </div>
  );
}
