import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { JoinGroupButton } from "@molecules/join-group-button";
import { PrivacyInfo } from "@molecules/privacy-info";
import { ShareButton } from "@molecules/share-button";
import { PostDetailsType } from "@react-query/api/feed/schema";
import { useAuthContext } from "@context/auth";
import { GenericDetailsMetadata } from "@organisms/generic-details/generic-details-metadata";
import { Tag } from "@molecules/tag";
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
  const { name, isPrivate, description, role } = groupDetails;
  const { authenticationStatus } = useAuthContext();

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
                />
              </>
            )
          }
        />
      </div>
      <div className="gencl:flex gencl:space-x-2">
        {authenticationStatus === "authenticated" && (
          <>
            <JoinGroupButton
              className="gencl:flex-grow"
              groupId={groupDetails.id}
              isPrivate={groupDetails.isPrivate}
              role={groupDetails.role}
              onGroupJoinStatusChange={onGroupJoinStatusChange}
            />
            <GroupSubscriptionButton
              groupId={groupDetails.id}
              isSubscriber={groupDetails.isSubscribed ?? false}
              onSubscriptionChange={onGroupSubscriptionChange}
            />
          </>
        )}
        <ShareButton />
      </div>
    </div>
  );
}
