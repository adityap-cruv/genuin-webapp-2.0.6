import Link from "next/link";

import { BrandCommunityTag } from "@components/common/brand-community-tag";
import { CustomAvatar } from "@components/custom/custom-avatar";
import { LockIcon } from "@icons/LockIcon";
import { PATH_NAME } from "@lib/utils/constants/path";

import { useSearchBarStore } from "../../store";

import { NoResults } from "./no-results";

import { type CommunityType } from ".";

export function Communities({ communities }: { communities?: CommunityType[] }) {
  if (communities)
    return (
      <div className="flex flex-col gap-y-3 px-4 pt-4 pb-16 sm:py-4">
        {communities.map((item) => {
          return <CommunityTile key={item.id} community={item} />;
        })}
      </div>
    );

  return <NoResults />;
}

export function CommunityTile({ community }: { community: CommunityType }) {
  const { close } = useSearchBarStore();
  return (
    <Link onClick={close} href={PATH_NAME.community(community.slug)}>
      <div className="border-tertiary-300 hover:bg-tertiary-100 flex flex-col gap-y-2 rounded-[10px] border p-4 hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2">
            <CustomAvatar
              imageUrl={community.profileImage ?? ""}
              fallbackString={community.name ?? ""}
              isAvatar={false}
              className="h-12 w-12"
            />
            <span>
              <p className="text-body-1-bold hover:underline">{community.name}</p>
              <div className="flex items-center gap-1">
                {community.brand && (
                  <BrandCommunityTag
                    brandSlug={community.brand.brand_slug}
                    brandLogo={community.brand?.logo}
                    brandName={community.brand?.name}
                  />
                )}
                <p className="text-body-1-demi text-tertiary">{`${community.memberCount} members`}</p>
                {community.type === 2 && (
                  <div className="flex items-center justify-center">
                    <LockIcon className="stroke-tertiary h-4 w-4" />
                    <p className="text-cap-1-demi text-tertiary">Private</p>
                  </div>
                )}
              </div>
            </span>
          </span>
        </div>
        <p className="text-body-1-demi line-clamp-2 break-all">{community.description}</p>
      </div>
    </Link>
  );
}
