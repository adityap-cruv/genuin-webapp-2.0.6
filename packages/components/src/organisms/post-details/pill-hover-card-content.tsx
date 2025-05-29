import { Avatar } from "@genuin/ui/avatar";
import { TickIcon } from "@genuin/ui/icons";
import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { GroupNotificationButton } from "src/molecules/group-notification-button";
import { JoinCommunityButton } from "src/molecules/join-community-button";
import { JoinGroupButton } from "src/molecules/join-group-button";
import { PrivacyInfo } from "src/molecules/privacy-info";
import { ShareButton } from "src/molecules/share-button";

type CommunityType = {
  name: string;
  profileImage: string;
  isPrivate: boolean;
  brand?: {
    slug: string;
  };
};

type GroupType = {
  name: string;
  isPrivate: boolean;
  community?: {
    name: string;
    profileImage?: string;
  };
};

type EntityHoverCardContentProps =
  | { type: "community"; data: CommunityType }
  | { type: "group"; data: GroupType };

export function EntityHoverCardContent(
  props: EntityHoverCardContentProps & ComponentProps<"div">
) {
  // TODO ADD AUTH WHEN IT'S IMPLEMENTED
  const auth = false;
  if (props.type === "community") {
    const { name, profileImage, isPrivate, brand } = props.data;

    return (
      <div className="gencl:space-y-2">
        <Avatar
          alt={name}
          imageUrl={profileImage ?? ""}
          isAvatar={false}
          size="2xl"
        />

        <div>
          <p className="gencl:text-body-1-semi-bold gencl:line-clamp-2">
            {name}
          </p>

          <div className="gencl:flex gencl:gap-1 gencl:text-body-1-medium gencl:items-center">
            <PrivacyInfo isPrivate={isPrivate ?? false} />

            {brand && (
              <span className="gencl:flex gencl:text-secondary-300">
                •&nbsp;on&nbsp;
                <span className="gencl:flex gencl:items-center gencl:text-black">
                  @{brand.slug}&nbsp;
                  <TickIcon className="gencl:size-3" />
                </span>
              </span>
            )}
          </div>
        </div>

        <p className="gencl:text-body-1-medium gencl:text-secondary-300 gencl:line-clamp-1">
          This is for testing description in hover card layout
        </p>

        {/* TODO USE COMMON COMPONENT */}
        <p className="gencl:text-body-1-medium gencl:text-secondary-300">
          <span className="gencl:font-semibold gencl:text-black">12</span> Views
          &nbsp;•&nbsp;
          <span className="gencl:font-semibold gencl:text-black">12</span>{" "}
          Comments &nbsp;•&nbsp;
          <span className="gencl:font-semibold gencl:text-black">12</span>{" "}
          Sparks
        </p>

        <div className="gencl:flex gencl:space-x-2">
          {auth && (
            <div className="gencl:w-full">
              <JoinCommunityButton className="gencl:w-full" />
            </div>
          )}
          <ShareButton />
        </div>
      </div>
    );
  }

  if (props.type === "group") {
    const { name, isPrivate, community } = props.data;

    return (
      <div className="gencl:space-y-2">
        <div>
          <p className="gencl:text-body-1-semi-bold gencl:line-clamp-2">
            {name}
          </p>

          <div className="gencl:flex gencl:gap-1 gencl:text-body-1-medium gencl:items-center">
            <PrivacyInfo isPrivate={isPrivate ?? false} />

            {community && (
              <span className="gencl:flex gencl:items-center gencl:text-secondary-300">
                •&nbsp;in&nbsp;
                <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:bg-secondary-50 gencl:p-1 gencl:rounded-full">
                  <Avatar
                    className="gencl:text-black"
                    alt={community.name}
                    imageUrl={community.profileImage ?? ""}
                    isAvatar={false}
                    size="xs"
                  />
                  <span className="gencl:text-body-2-medium gencl:line-clamp-1 gencl:pr-1">
                    {community.name}
                  </span>
                </div>
              </span>
            )}
          </div>
        </div>

        {/* TODO CHANGE THE DESCRIPTION WHEN ITS UPDATED FROM BACKEND */}
        <ReadMore
          text={"This is for testing description in hover card layout"}
          className={cn("gencl:text-body-1-medium gencl:pt-3")}
        />

        {/* TODO UPDATE WITH STAT COMPONENT */}
        <p className="gencl:text-body-1-medium gencl:text-secondary-300">
          <span className="gencl:font-semibold gencl:text-black">12</span> Views
          &nbsp;•&nbsp;
          <span className="gencl:font-semibold gencl:text-black">12</span>{" "}
          Comments &nbsp;•&nbsp;
          <span className="gencl:font-semibold gencl:text-black">12</span>{" "}
          Sparks
        </p>

        <div className="gencl:flex gencl:space-x-2">
          {auth && (
            <>
              <div className="gencl:w-full">
                <JoinGroupButton className="gencl:w-full" />
              </div>
              <GroupNotificationButton />
            </>
          )}
          <ShareButton />
        </div>
      </div>
    );
  }
}
