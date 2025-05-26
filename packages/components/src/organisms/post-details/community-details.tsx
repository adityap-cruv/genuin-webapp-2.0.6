import { Avatar } from "@genuin/ui/avatar";
import { DecorativeList } from "@genuin/ui/decorative-list";
import { LockIcon, PublicIcon, TickIcon } from "@genuin/ui/icons";
import type { ComponentProps } from "react";

import type { PostDetailsType } from "src/react-query/api/feed/schema";

import { JoinCommunityButton } from "../../molecules/join-community-button";
import { ShareButton } from "../../molecules/share-button";

import { GroupDetails } from "./group-details";

export function CommunityDetails({
  communityDetails,
  groupDetails,
}: {
  communityDetails: PostDetailsType["community"];
  groupDetails: PostDetailsType["group"];
}) {
  return (
    <div className="gencl:pt-4">
      <div className="gencl:flex gencl:justify-between gencl:gap-4">
        <div className="gencl:flex gencl:gap-4 gencl:items-center">
          <Avatar
            alt={communityDetails.name ?? ""}
            imageUrl={communityDetails.profileImage ?? ""}
            isAvatar={false}
            size="md"
          />
          <div className="">
            <a className="gencl:text-body-0-semi-bold gencl:line-clamp-2">
              {communityDetails.name}
            </a>
          </div>
        </div>
        <div className="gencl:flex gencl:space-x-2">
          <JoinCommunityButton />
          <ShareButton />
        </div>
      </div>
      <DecorativeList>
        <div className="gencl:flex gencl:gap-2 gencl:text-body-1-medium gencl:pb-4 gencl:pl-4 gencl:pt-2 gencl:items-center">
          <CommunityPrivacyInfo isPrivate={communityDetails.isPrivate} />
          {/* Todo: ask if have to put link here or not */}
          {communityDetails.brand && (
            <span className="gencl:flex">
              &nbsp;•&nbsp; on &nbsp;
              <span className="gencl:flex gencl:items-center">
                {communityDetails.brand?.name}&nbsp;
                <TickIcon className="gencl:size-3" />
              </span>
            </span>
          )}
        </div>
        <GroupDetails groupDetails={groupDetails} />
      </DecorativeList>
    </div>
  );
}

type CommunityPrivacyInfoProps = ComponentProps<"div"> & { isPrivate: boolean };

function CommunityPrivacyInfo({ isPrivate }: CommunityPrivacyInfoProps) {
  return (
    <div className="gencl:flex gencl:items-center gencl:gap-2">
      {isPrivate ? (
        <LockIcon className="gencl:size-5 gencl:fill-secondary-300" />
      ) : (
        <PublicIcon className="gencl:size-5 gencl:stroke-secondary-300" />
      )}
      <p className="gencl:text-secondary-300">
        {isPrivate ? "Private" : "Public"}
      </p>
    </div>
  );
}
