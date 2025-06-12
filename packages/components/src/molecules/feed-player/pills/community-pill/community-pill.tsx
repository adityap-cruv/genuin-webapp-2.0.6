import { Avatar } from "@genuin/ui/avatar";
import { Link } from "@molecules/link";
import { JoinCommunityButton } from "@molecules/join-community-button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@context/auth";
import { PostDetailsType } from "@react-query/api/feed/schema";
import { CommunityHoverCard } from "../community-hover-card";
import { ComponentProps } from "react";
import { on } from "events";

const communityPillVariants = cva(
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

type CommunityPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark";
  communityDetails: PostDetailsType["community"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof JoinCommunityButton
  >["onCommunityJoinStatusChange"];
};

export function CommunityPill({
  isHoverable = false,
  variant = "light",
  communityDetails,
  onCommunityJoinStatusChange,
}: CommunityPillProps) {
  const { authenticationStatus } = useAuthContext();
  const pill = (
    <Link
      href={buildPageUrl({ type: "community", slug: communityDetails.slug })}
    >
      <div className={communityPillVariants({ variant })}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center">
          <Avatar
            alt={communityDetails.name ?? ""}
            imageUrl={communityDetails.profileImage ?? ""}
            isAvatar={false}
            size="xs"
          />
          <span className="gencl:text-body-2-medium gencl:line-clamp-1">
            {communityDetails.name}
          </span>
        </div>
        {authenticationStatus === "authenticated" && (
          <JoinCommunityButton
            roleTexts={{
              UNJOINED: "Join",
            }}
            communityId={communityDetails.id}
            isPrivate={communityDetails.isPrivate}
            role={communityDetails.userRole}
            shape="pill"
            theme={variant === "dark" ? "secondary" : "primary"}
            onClick={(e) => {
              e.preventDefault();
            }}
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
      <HoverCardContent className="gencl:max-w-md! gencl:w-full">
        <CommunityHoverCard
          communityDetails={communityDetails}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
