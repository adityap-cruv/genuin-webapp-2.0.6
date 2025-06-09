import { CommunityPill } from "@molecules/community-pill";
import { GroupPill } from "@molecules/group-pill";
import type { PostDetailsType } from "@react-query/api/feed/schema";

export function CommunityDetails({
  communityDetails,
  groupDetails,
}: {
  communityDetails: PostDetailsType["community"];
  groupDetails: PostDetailsType["group"];
}) {
  return (
    <div className="gencl:pt-3 gencl:flex gencl:gap-2">
      <CommunityPill
        isHoverable={true}
        variant="light"
        data={{
          id: communityDetails.id,
          isPrivate: communityDetails.isPrivate,
          name: communityDetails.name ?? "",
          profileImage: communityDetails.profileImage ?? "",
          slug: communityDetails.slug ?? "",
          brand: { slug: communityDetails.brand?.slug ?? "" },
        }}
      />

      <GroupPill
        isHoverable={true}
        variant="light"
        data={{
          isPrivate: false,
          name: groupDetails.name ?? "",
          slug: groupDetails.slug,
          community: {
            name: communityDetails.name ?? "",
            profileImage: communityDetails.profileImage ?? "",
          },
        }}
      />
    </div>
  );
}
