import {
  BagIcon,
  CreatedProfileIcon,
  PencilWithLineIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps, ReactNode } from "react";

import { Stats } from "src/molecules/stats";
import { Tag } from "src/molecules/tag";

import { MemberList } from "../member-list";

type EntityDataType = {
  userName: string;
  profileImage: {
    isAvatar: boolean;
    url: string;
  };
  name?: string; // Optional name property
  url: string;
};

type SideInfoDataType = {
  stats: Record<"Views" | "Comments" | "Sparks", number>;
  createdAt: string;
  createdBy: EntityDataType;
  createdIn: EntityDataType;
  guidelines?: string[];
};

type SideInfoProps = { sideInfoData: SideInfoDataType } & ComponentProps<"div">;

type EntityInfoProps = {
  icon: ReactNode;
  title: string;
  entity: EntityDataType;
};

function EntityInfo({ title, icon, entity }: EntityInfoProps) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      {icon}
      <p className="gencl:text-body-1-medium gencl:text-secondary-600">
        {title}
      </p>
      <Tag
        alt={entity.name || entity.userName}
        profileImage={entity.profileImage}
        url={entity.url}
        userName={"@" + entity.userName}
      />
    </div>
  );
}

export function SideInfo({
  sideInfoData: { createdAt, createdBy, createdIn, stats, guidelines },
  className,
  ...restProps
}: SideInfoProps) {
  return (
    <div
      className={cn(
        "gencl:bg-secondary-50 gencl:p-4 gencl:rounded-lg gencl:gap-2 gencl:space-y-4",
        className
      )}
      {...restProps}
    >
      {stats && (
        <Stats
          valueClassName="gencl:text-body-0-semi-bold"
          pairClassName="gencl:flex-col"
          labelClassName="gencl:text-body-2-medium gencl:text-secondary-600"
          valueFirst
          className="gencl:flex gencl:justify-around"
          stats={stats}
        />
      )}
      <div className="gencl:space-y-2">
        {createdAt && (
          <div className="gencl:flex gencl:gap-2 gencl:items-center">
            <PencilWithLineIcon className="gencl:size-5 gencl:stroke-secondary-600" />
            <p className="gencl:text-body-1-medium gencl:text-secondary-600">
              Created on {createdAt}
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
            title="Created in"
            entity={createdIn}
          />
        )}
      </div>
      {guidelines && guidelines.length > 0 && (
        <div className="gencl:space-y-4">
          <p className="gencl:text-body-1-semi-bold">Guidelines</p>
          <ol className="gencl:list-decimal gencl:list-inside">
            {guidelines.map((guideline, index) => (
              <li
                key={index}
                className="gencl:text-body-1-semi-bold gencl:text-secondary-600"
              >
                {guideline}
              </li>
            ))}
          </ol>
        </div>
      )}
      <Admins />
    </div>
  );
}

function Admins() {
  return <MemberList title="Admins" members={[]} />;
}
