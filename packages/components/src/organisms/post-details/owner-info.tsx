import { Avatar } from "@genuin/ui/avatar";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { ProfileLink } from "@genuin/components/molecules/profile-link";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

// TODO: Figure out how to use links.
export function OwnerInfo({
  owner,
  createdAt,
}: {
  owner: PostDetailsType["owner"];
  createdAt: string;
}) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      <Avatar
        alt={owner.name ?? ""}
        imageUrl={owner.profileImage}
        isAvatar={owner.isAvatar}
        size="md"
      />
      <ProfileLink
        url={buildPageUrl({
          type: !!owner.brand ? "brand" : "profile",
          slug: !!owner.brand ? owner.brand.slug : owner.userName,
        })}
        userLogoType={owner.brand?.userLogo}
        className="gencl:text-body-1-medium"
      >
        @{owner.userName}
      </ProfileLink>
      <span className="gencl:text-body-1-medium gencl:text-secondary-600">
        {createdAt}
      </span>
    </div>
  );
}
