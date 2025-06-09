import {
  BagIcon,
  CreatedProfileIcon,
  PencilWithLineIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps, type ReactNode } from "react";

import { formateDateToLocaleString } from "@lib/utils";
import { Stats } from "@molecules/stats";
import { Tag } from "@molecules/tag";

import { Guidelines } from "./guide-lines";

type EntityDataType = {
  userName: string;
  profileImage: {
    isAvatar: boolean;
    url: string;
  };
  name?: string; // Optional name property
  url: string;
  userLogoType?: number | null;
};

export type GuidelineType = {
  id: number;
  position: number;
  title: string;
  description: string;
};

type SideInfoDataType = {
  stats: Record<"Views" | "Comments" | "Sparks", number>;
  createdAt: string;
  createdBy: EntityDataType;
  createdIn: EntityDataType;
  guidelines?: GuidelineType[];
};

type SideInfoProps = {
  sideInfoData: SideInfoDataType;
  /**
   * Additional comonent that can be passed to the side info component.
   */
  others?: ReactNode;
} & ComponentProps<"div">;

type EntityInfoProps = {
  icon: ReactNode;
  title: string;
  entity: EntityDataType;
};

/**
 * EntityInfo component displays information about an entity like created IN, or created BY.
 */
function EntityInfo({ title, icon, entity }: EntityInfoProps) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      {icon}
      <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:whitespace-nowrap">
        {title}
      </p>
      <Tag
        alt={entity.name || entity.userName}
        profileImage={entity.profileImage}
        url={entity.url}
        userName={"@" + entity.userName}
        userLogoType={entity.userLogoType}
      />
    </div>
  );
}

export function SideInfo({
  sideInfoData: { createdAt, createdBy, createdIn, stats, guidelines },
  others,
  className,
  ...restProps
}: SideInfoProps) {
  return (
    <div
      className={cn(
        "gencl:bg-secondary-50 gencl:overflow-auto gencl:max-w-xs gencl:w-full gencl:p-4 gencl:rounded-lg gencl:gap-2 gencl:space-y-4",
        className
      )}
      {...restProps}
    >
      {stats && (
        <Stats
          valueClassName="gencl:text-body-0-semi-bold!"
          pairClassName="gencl:flex-col gencl:items-start"
          labelClassName="gencl:text-body-2-medium! gencl:text-secondary-600"
          valueFirst
          className="gencl:flex gencl:justify-between gencl:max-w-3xs"
          stats={stats}
        />
      )}
      <div className="gencl:space-y-2">
        {createdAt && (
          <div className="gencl:flex gencl:gap-2 gencl:items-center">
            <PencilWithLineIcon className="gencl:size-5 gencl:stroke-secondary-600" />
            <p className="gencl:text-body-1-medium gencl:text-secondary-600">
              Created on {formateDateToLocaleString(createdAt)}
            </p>
          </div>
        )}
        {createdBy && (
          <EntityInfo
            icon={
              <CreatedProfileIcon className="gencl:stroke-secondary-600 gencl:size-6" />
            }
            title="Created by"
            entity={createdBy}
          />
        )}
        {createdIn && (
          <EntityInfo
            icon={
              <BagIcon className="gencl:stroke-secondary-600 gencl:size-6 gencl:shrink-0" />
            }
            title="Created in&nbsp;"
            entity={createdIn}
          />
        )}
      </div>
      {guidelines && <Guidelines guidelines={guidelines} />}
      {others && others}
    </div>
  );
}
