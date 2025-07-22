import {
  BagIcon,
  CreatedProfileIcon,
  PencilWithLineIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps, type ReactNode } from "react";

import { formateDateToLocaleString } from "@genuin/components/lib/utils";
import { Stats } from "@genuin/components/molecules/stats";
import { Tag } from "@genuin/components/molecules/tag";

import { Guidelines } from "./guide-lines";
import { cva, VariantProps } from "class-variance-authority";
import { ReadMore } from "@genuin/ui/components/read-more";
import { ReadMoreTextType } from "@genuin/ui/components/read-more/read-more.types";
import { SocialLinks } from "@genuin/components/molecules/social-links";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

const sideInfoVariant = cva(
  "gencl:bg-secondary-50 gencl:overflow-auto gencl:p-4 gencl:rounded-lg gencl:gap-2 gencl:space-y-4",
  {
    variants: {
      variant: {
        default:
          "gencl:max-w-xs gencl:w-full gencl:h-fit gencl:max-h-full gencl:sm:block! gencl:hidden",
        mobile: "gencl:w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type SideInfoProps = {
  sideInfoData: SideInfoDataType;
  /**
   * Additional comonent that can be passed to the side info component.
   */
  others?: ReactNode;
} & ComponentProps<"div"> &
  VariantProps<typeof sideInfoVariant>;

export function SideInfo({
  sideInfoData: {
    createdAt,
    createdBy,
    createdIn,
    stats,
    guidelines,
    description,
    links,
  },
  others,
  variant,
  className,
  ...restProps
}: SideInfoProps) {
  const { isMobile } = useDeviceDetectMediaQuery();

  // Create an array of all available sections
  const sections: { id: string; content: ReactNode }[] = [];

  // Description section
  if (description && variant === "mobile" && isMobile) {
    sections.push({
      id: "description",
      content: (
        <div className="gencl:space-y-4">
          <p className="gencl:text-body-1-semi-bold">Description</p>
          <ReadMore
            textClassName="gencl:text-body-1-medium! gencl:text-secondary-600"
            text={description}
            defaultExpand
            viewMoreText="more"
            viewLessText="less"
          />
        </div>
      ),
    });
  }

  // Links section
  if (
    links &&
    Object.keys(links).length > 0 &&
    variant === "mobile" &&
    isMobile
  ) {
    sections.push({
      id: "links",
      content: (
        <div className="gencl:space-y-4">
          <p className="gencl:text-body-1-semi-bold">Links</p>
          <SocialLinks
            links={links}
            variant={variant === "mobile" ? "detailed" : "default"}
          />
        </div>
      ),
    });
  }

  // Stats section (default variant)
  if (stats && variant === "default") {
    sections.push({
      id: "stats-default",
      content: (
        <Stats
          valueClassName="gencl:text-body-0-semi-bold!"
          pairClassName="gencl:flex-col gencl:items-start"
          labelClassName="gencl:text-body-2-medium! gencl:text-secondary-600"
          valueFirst
          className="gencl:flex gencl:justify-between gencl:max-w-3xs"
          stats={stats}
        />
      ),
    });
  }

  // Creation info section
  if (createdAt || createdBy || createdIn || (stats && variant === "mobile")) {
    sections.push({
      id: "creation-info",
      content: (
        <div className="gencl:space-y-2">
          {variant === "mobile" && (
            <p className="gencl:text-body-1-semi-bold gencl:pb-2">More info</p>
          )}
          {createdAt && (
            <div className="gencl:flex gencl:gap-2 gencl:items-center">
              <PencilWithLineIcon
                theme="secondary"
                size={variant === "default" ? "md" : "sm"}
              />
              <p className="gencl:text-body-1-medium gencl:text-secondary-600">
                Created on {formateDateToLocaleString(createdAt)}
              </p>
            </div>
          )}
          {createdBy && (
            <EntityInfo
              icon={
                <CreatedProfileIcon
                  theme="secondary"
                  size={variant === "default" ? "md" : "sm"}
                />
              }
              title="Created by"
              entity={createdBy}
              size={variant === "default" ? "md" : "sm"}
            />
          )}
          {createdIn && (
            <EntityInfo
              icon={
                <BagIcon
                  theme="secondary"
                  size={variant === "default" ? "md" : "sm"}
                />
              }
              title="Created in&nbsp;"
              entity={createdIn}
              size={variant === "default" ? "md" : "sm"}
            />
          )}
          {stats && variant === "mobile" && (
            <Stats
              stats={{
                Views: stats.Views,
                Comments: stats.Comments,
                Reactions: stats.Reactions,
              }}
              variant="descriptive"
              theme="secondary"
              className="gencl:space-y-0"
            />
          )}
        </div>
      ),
    });
  }

  // Guidelines section
  if (Array.isArray(guidelines) && guidelines.length > 0) {
    sections.push({
      id: "guidelines",
      content: <Guidelines guidelines={guidelines} />,
    });
  }

  // Others section
  if (others) {
    sections.push({
      id: "others",
      content: others,
    });
  }

  return (
    <div className={cn(sideInfoVariant({ variant }), className)} {...restProps}>
      {sections.map((section, index) => (
        <div key={section.id}>
          {section.content}
          {index < sections.length - 1 && (
            <div className="gencl:border-b gencl:border-secondary-150 gencl:my-4" />
          )}
        </div>
      ))}
    </div>
  );
}

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
  description: ReadMoreTextType;
  stats?: Record<"Views" | "Comments" | "Reactions", number>;
  links?: ComponentProps<typeof SocialLinks>["links"];
  createdAt?: string;
  createdBy?: EntityDataType;
  createdIn?: EntityDataType;
  guidelines?: GuidelineType[];
};

type EntityInfoProps = {
  icon: ReactNode;
  title: string;
  entity: EntityDataType;
} & { size: ComponentProps<typeof Tag>["size"] };

/**
 * EntityInfo component displays information about an entity like created IN, or created BY.
 */
function EntityInfo({ title, icon, entity, size }: EntityInfoProps) {
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
        size={size}
      />
    </div>
  );
}
