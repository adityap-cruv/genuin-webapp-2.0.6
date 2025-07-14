import { Avatar } from "@genuin/ui/avatar";
import { Link } from "@genuin/components/molecules/link";
import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@genuin/components/context/auth";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { CommunityHoverCard } from "../community-hover-card";
import { ComponentProps } from "react";

const communityPillVariants = cva(
  "gencl:flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:p-1 gencl:pr-2 gencl:rounded-full gencl:transition-all gencl:cursor-pointer",
  {
    variants: {
      variant: {
        light:
          "gencl:bg-white gencl:text-default gencl:border gencl:border-secondary-150 gencl:hover:bg-secondary-50 gencl:hover:border-secondary-50",
        dark: "gencl:bg-black/40 gencl:text-white",
        fullScreen:
          "gencl:bg-black/40 gencl:backdrop-blur-lg gencl:text-white gencl:border-none",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
);

type CommunityPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark" | "fullScreen";
  communityDetails: PostDetailsType["community"];
  className?: string;
  onCommunityJoinStatusChange?: ComponentProps<
    typeof JoinCommunityButton
  >["onCommunityJoinStatusChange"];
};

export function CommunityPill({
  isHoverable = false,
  variant = "light",
  communityDetails,
  onCommunityJoinStatusChange,
  className,
}: CommunityPillProps) {
  const { authenticationStatus } = useAuthContext();
  const pill = (
    <Link
      href={buildPageUrl({ type: "community", slug: communityDetails.slug })}
    >
      <div className={communityPillVariants({ variant, className })}>
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
            size="sm"
            roleTexts={{
              UNJOINED: "Join",
            }}
            communityId={communityDetails.id}
            communityHandle={communityDetails.handle}
            communityName={communityDetails.name ?? ""}
            slug={communityDetails.slug}
            isPrivate={communityDetails.isPrivate}
            role={communityDetails.userRole}
            shape="pill"
            theme={
              variant === "fullScreen"
                ? "secondary"
                : communityDetails.userRole === "MEMBER"
                  ? "outline"
                  : communityDetails.userRole === "REQUESTED"
                    ? "secondary"
                    : "primary"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          />
        )}
      </div>
    </Link>
  );

  if (!isHoverable) {
    return pill;
  }

  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>{pill}</HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="gencl:max-w-md! gencl:min-w-80"
      >
        <CommunityHoverCard
          communityDetails={communityDetails}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
