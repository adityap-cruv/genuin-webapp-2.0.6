import { useBaseContext } from "@genuin/components/context/base";
import { PlaybackSpeed } from "@genuin/components/molecules/playback-speed";
import { Report } from "@genuin/components/molecules/report";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@genuin/ui/components/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@genuin/ui/components/dialog/dialog";
import { cn } from "@genuin/ui/lib/utils";
import React, { ReactNode, useEffect, useState } from "react";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Link } from "../../link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { FlagIcon, GroupIcon, PlayIcon } from "@genuin/ui/icons";
import { useFeedContext } from "@genuin/components/templates/feed/context";

type MenuProps = {
  children?: React.ReactNode;
  contentId?: string;
  videoSlug?: string;
  shareUrl?: string;
  groupSlug: string;
};

type MenuItemProps = {
  text: string;
  className?: string;
  icon?: ReactNode;
};

const menuItems = ({
  text,
  className,
  icon,
}: MenuItemProps): React.ReactNode => {
  return (
    <div className="gencl:flex gencl:items-center">
      {icon && icon}
      <p
        className={cn(
          "gencl:!text-body-1-medium gencl:text-secondary-600 gencl:hover:bg-secondary-50 gencl:rounded-md gencl:p-2 gencl:cursor-pointer",
          className
        )}
      >
        {text}
      </p>
    </div>
  );
};

export function Menu({
  contentId,
  shareUrl,
  videoSlug,
  children,
  groupSlug,
  ...props
}: MenuProps) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { brandDetails } = useBaseContext();
  const [isOpen, setIsOpen] = useState(false);
  const { activeIndex } = useFeedContext();

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    return () => {
      setIsOpen(false);
    };
  }, [activeIndex]);

  const MenuData = [
    shareUrl &&
      !isMobile && {
        children: (
          <ShareButton pathName={shareUrl} withCustomChildren>
            {menuItems({ text: "Copy Link" })}
          </ShareButton>
        ),
      },
    isMobile && {
      children: (
        <Link href={buildPageUrl({ type: "group", slug: groupSlug })}>
          {menuItems({
            text: "Group Details",
            ...(isMobile && { icon: <GroupIcon size="lg" /> }),
          })}
        </Link>
      ),
    },
    brandDetails.web_configs.playback_speed_enabled && {
      children: (
        <PlaybackSpeed
          type="playback-dialog"
          children={menuItems({
            text: "Playback speed",
            ...(isMobile && { icon: <PlayIcon size="lg" /> }),
          })}
        />
      ),
    },
    // Feature not implemented yet: "Group Details" and "Not interested" menu items are pending design.
    contentId && {
      children: (
        <Report
          type="report-dialog"
          reportFor="VIDEO"
          contentId={contentId}
          shareUrl={shareUrl ?? ""}
          videoSlug={videoSlug ?? ""}
          children={menuItems({
            text: "Report Post",
            className: "gencl:text-error-status",
            ...(isMobile && { icon: <FlagIcon theme="danger" size="lg" /> }),
          })}
        />
      ),
    },
  ].filter(
    (item): item is { children: React.ReactElement } =>
      !!item &&
      typeof item === "object" &&
      "children" in item &&
      React.isValidElement(item.children)
  );

  if (isMobile) {
    return (
      <Dialog type="menu-dialog">
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="gencl:p-3 gencl:border gencl:border-secondary-100 gencl:rounded-t-xl gencl:flex gencl:flex-col gencl:gap-0.5 gencl:z-50 gencl:!bg-white gencl:focus-visible:outline-none gencl:focus-visible:ring-0">
          <p className="gencl:text-body-0-semi-bold">More options</p>
          {MenuData.map((data, index) => (
            <React.Fragment key={index}>{data.children}</React.Fragment>
          ))}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} {...props}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="gencl:w-fit gencl:p-3 gencl:border gencl:border-secondary-100 gencl:rounded-xl gencl:flex gencl:flex-col gencl:gap-0.5 gencl:z-50 gencl:!bg-white gencl:focus-visible:outline-none gencl:focus-visible:ring-0"
      >
        {MenuData.map((data, index) => (
          <React.Fragment key={index}>{data.children}</React.Fragment>
        ))}
      </PopoverContent>
    </Popover>
  );
}
