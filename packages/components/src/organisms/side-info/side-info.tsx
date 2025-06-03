import { Button } from "@genuin/ui/button";
import {
  BagIcon,
  CreatedProfileIcon,
  PencilWithLineIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useState, type ComponentProps, type ReactNode } from "react";

import { formateDateToLocaleString } from "src/lib/utils";
import { Stats } from "src/molecules/stats";
import { Tag } from "src/molecules/tag";

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

type SideInfoDataType = {
  stats: Record<"Views" | "Comments" | "Sparks", number>;
  createdAt: string;
  createdBy: EntityDataType;
  createdIn: EntityDataType;
  guidelines?: string[];
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
              <BagIcon className="gencl:stroke-secondary-600 gencl:size-6" />
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

// todo: use accordion in guidelines.
function Guidelines({ guidelines }: { guidelines?: string[] }) {
  const [showMore, setShowMore] = useState(
    guidelines ? (guidelines?.length > 3 ? false : true) : false
  );
  console.log("guidelines", guidelines, showMore);
  if (!guidelines || guidelines.length === 0) return;

  return (
    <div className="gencl:space-y-4 gencl:border-t gencl:pt-4 gencl:border-secondary-300">
      <p className="gencl:text-body-1-semi-bold">Guidelines</p>
      <ol className="gencl:list-decimal gencl:list-inside">
        {guidelines
          .slice(0, showMore ? undefined : 3)
          .map((guideline, index) => (
            <li
              key={index}
              className="gencl:text-body-1-semi-bold gencl:text-secondary-600"
            >
              {guideline}
            </li>
          ))}
      </ol>
      {!showMore && (
        <Button theme="text" size="sm" onClick={() => setShowMore(!showMore)}>
          Show More
        </Button>
      )}
    </div>
  );
}
