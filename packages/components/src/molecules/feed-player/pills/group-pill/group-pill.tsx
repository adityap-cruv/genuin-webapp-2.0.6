import { Avatar } from "@genuin/ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { GroupSubscriptionButton } from "@molecules/group-subscription-button";
import { Link } from "@molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@context/auth";
import { PostDetailsType } from "@react-query/api/feed/schema";
import { GroupHoverCard } from "../group-hover-card";
import { ComponentProps } from "react";
import { JoinGroupButton } from "@molecules/join-group-button";

const groupPillVariants = cva(
  "gencl:flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:p-1 gencl:rounded-full gencl:transition-all gencl:cursor-pointer",
  {
    variants: {
      variant: {
        light:
          "gencl:bg-white gencl:text-default gencl:border gencl:border-secondary-150 gencl:hover:bg-secondary-150",
        dark: "gencl:bg-black/40 gencl:text-white",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
);

type GroupPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark";
  groupDetails: PostDetailsType["group"];
  communityDetails: PostDetailsType["community"];
  onGroupJoinStatusChange: ComponentProps<
    typeof JoinGroupButton
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof GroupSubscriptionButton
  >["onSubscriptionChange"];
};

export function GroupPill({
  isHoverable = false,
  variant = "light",
  groupDetails,
  communityDetails,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
}: GroupPillProps) {
  const { authenticationStatus } = useAuthContext();

  const pill = (
    <Link href={buildPageUrl({ type: "group", slug: groupDetails.slug })}>
      <div className={groupPillVariants({ variant })}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center">
          <Avatar
            alt={groupDetails.name ?? ""}
            imageUrl={""}
            isAvatar={false}
            size="xs"
          />
          <span className="gencl:text-body-2-medium gencl:line-clamp-1">
            {groupDetails.name}
          </span>
        </div>
        {authenticationStatus === "authenticated" && (
          <GroupSubscriptionButton
            className="gencl:px-2"
            shape="pill"
            groupId={groupDetails.id}
            isSubscriber={groupDetails.isSubscribed ?? false}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onSubscriptionChange={onGroupSubscriptionChange}
          />
        )}
      </div>
    </Link>
  );

  if (!isHoverable) {
    return pill;
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{pill}</HoverCardTrigger>
      <HoverCardContent>
        <GroupHoverCard
          communityDetails={communityDetails}
          groupDetails={groupDetails}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
