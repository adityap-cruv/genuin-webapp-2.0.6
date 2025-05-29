import { Avatar } from "@genuin/ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";
import { EntityHoverCardContent } from "src/organisms/post-details/pill-hover-card-content";

import { JoinCommunityButton } from "../join-community-button";

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
  data: {
    id: string;
    name: string;
    profileImage: string;
    isPrivate: boolean;
    brand?: {
      slug: string;
    };
  };
};

export function CommunityPill({
  isHoverable = false,
  variant = "light",
  data,
}: CommunityPillProps) {
  const auth = false;

  const pill = (
    <div className={communityPillVariants({ variant })}>
      <div className="gencl:flex gencl:gap-1 gencl:items-center">
        <Avatar
          alt={data?.name}
          imageUrl={data?.profileImage}
          isAvatar={false}
          size="xs"
        />
        <span className="gencl:text-body-2-medium gencl:line-clamp-1">
          {data?.name}
        </span>
      </div>
      {auth && (
        <JoinCommunityButton
          buttonText="Join"
          shape="pill"
          theme={variant === "dark" ? "secondary" : "primary"}
        />
      )}
    </div>
  );

  if (!isHoverable) {
    return pill;
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>{pill}</HoverCardTrigger>
      <HoverCardContent>
        <EntityHoverCardContent type="community" data={data} />
      </HoverCardContent>
    </HoverCard>
  );
}
