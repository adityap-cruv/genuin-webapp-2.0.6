import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { CommunityPill } from "@molecules/community-pill";
import { GroupPill } from "@molecules/group-pill";
import type { PostDetailsType } from "@react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
};

export function ExpandViewDetails({
  className,
  postDetails,
  ...restProps
}: ExpandViewProps) {
  const { showSeeker } = usePlayerContext();

  return (
    <div
      className={cn(
        "gencl:absolute gencl:w-full gencl:z-10 gencl:right-0-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:space-y-3 gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
        <Avatar
          imageUrl={postDetails.owner.profileImage}
          alt={postDetails.owner.name ?? ""}
          isAvatar={postDetails.owner.isAvatar}
        />
        <ProfileLink
          url={buildPageUrl({
            type: !!postDetails.owner.brand ? "brand" : "profile",
            slug: postDetails.owner.userName,
          })}
          userLogoType={postDetails.owner.brand?.userLogo}
        >
          @{postDetails.owner.userName}
        </ProfileLink>
      </div>
      <ReadMore
        showExpandText={false}
        text={postDetails.video.description}
        maxLines={2}
        shouldAnimate
        position="overlay"
        className="gencl:text-body-1-medium"
      />
      <div className="gencl:flex gencl:flex-nowrap gencl:gap-2 gencl:w-full gencl:overflow-x-auto gencl:z-10">
        {/* TODO ADD REMAINING DETAILS, PENDING FROM BACKEND */}
        <CommunityPill
          isHoverable={true}
          variant="dark"
          data={{
            id: postDetails.community.id,
            slug: postDetails.community.slug,
            isPrivate: postDetails.community.isPrivate,
            name: postDetails.community.name ?? "",
            profileImage: postDetails.community.profileImage ?? "",
            brand: { slug: postDetails.community.brand?.slug ?? "" },
          }}
        />
        <GroupPill
          isHoverable={true}
          variant="dark"
          data={{
            isPrivate: false,
            slug: postDetails.group.slug,
            name: postDetails.group.name ?? "",
            community: {
              name: postDetails.community.name ?? "",
              profileImage: postDetails.community.profileImage ?? "",
            },
          }}
        />
      </div>
      <div
        className={cn(
          "gencl:transition-all",
          showSeeker ? "gencl:h-4" : "gencl:h-0"
        )}
      />
    </div>
  );
}
