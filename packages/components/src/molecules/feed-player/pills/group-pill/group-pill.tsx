import { Avatar } from "@genuin/ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@genuin/components/context/auth";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { GroupHoverCard } from "../group-hover-card";
import { ComponentProps } from "react";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";

const groupPillVariants = cva(
  "gencl:flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:p-1 gencl:pr-2 gencl:rounded-full gencl:transition-all gencl:cursor-pointer",
  {
    variants: {
      variant: {
        light:
          "gencl:bg-white gencl:text-default gencl:border gencl:border-secondary-150 gencl:hover:bg-secondary-50 gencl:hover:border-secondary-50",
        dark: "gencl:bg-black/40 gencl:text-white",
        fullScreen:
          "gencl:!bg-black/40 gencl:backdrop-blur-lg gencl:text-white gencl:border-none",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
);

type GroupPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark" | "fullScreen";
  groupDetails: PostDetailsType["group"];
  communityDetails: PostDetailsType["community"];
  className?: string;
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
  className,
}: GroupPillProps) {
  const { authenticationStatus } = useAuthContext();

  const ldDescription = `${
    groupDetails?.description ? groupDetails.description + " | " : ""
  } • Join ${groupDetails.name} to talk about it`;

  const pill = (
    <Link href={buildPageUrl({ type: "group", slug: groupDetails.slug })}>
      <div className={groupPillVariants({ variant, className })}>
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
            variant="icon"
            shape="pill"
            size="sm"
            groupId={groupDetails.id}
            groupName={groupDetails.name ?? ""}
            groupDescription={ldDescription}
            shareUrl={groupDetails.shareUrl ?? ""}  
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
      <HoverCardContent className="gencl:max-w-md! gencl:min-w-80">
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
