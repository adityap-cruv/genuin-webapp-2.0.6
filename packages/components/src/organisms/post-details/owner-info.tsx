import { Avatar } from "@genuin/ui/avatar";

import { ProfileLink } from "@molecules/profile-link";
import type { PostDetailsType } from "@react-query/api/feed/schema";

// TODO: Figure out how to use links.
export function OwnerInfo({ owner }: { owner: PostDetailsType["owner"] }) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      <Avatar
        alt={owner.name ?? ""}
        imageUrl={owner.profileImage}
        isAvatar={owner.isAvatar}
        size="md"
      />
      <ProfileLink
        url={`/profile/${owner.userName}`}
        userLogoType={owner.brand?.userLogo}
        className="gencl:text-body-1-medium"
      >
        @{owner.userName}
      </ProfileLink>
    </div>
  );
}
