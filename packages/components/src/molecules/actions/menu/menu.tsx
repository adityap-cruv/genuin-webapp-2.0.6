import { useBaseContext } from "@genuin/components/context/base";
import { PlaybackSpeed } from "@genuin/components/molecules/playback-speed";
import { Report } from "@genuin/components/molecules/report";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@genuin/ui/components/popover";
import { cn } from "@genuin/ui/lib/utils";
import React from "react";
import { ShareButton } from "@genuin/components/molecules/share-button";

type MenuProps = {
  children?: React.ReactNode;
  contentId?: string;
  videoSlug?: string;
  shareUrl?: string;
};

const menuItems = (text: string, className?: string): React.ReactNode => {
  return (
    <p
      className={cn(
        "gencl:!text-body-1-medium gencl:text-secondary-500 gencl:p-2 gencl:cursor-pointer",
        className
      )}
    >
      {text}
    </p>
  );
};

export function Menu({
  contentId,
  shareUrl,
  videoSlug,
  children,
  ...props
}: MenuProps) {
  const { brandDetails } = useBaseContext();
  const MenuData = [
    shareUrl && {
      children: (
        <ShareButton pathName={shareUrl} withCustomChildren>
          {menuItems("Copy Link")}
        </ShareButton>
      ),
    },
    brandDetails.web_configs.playback_speed_enabled && {
      children: (
        <PlaybackSpeed
          type="playback-dialog"
          children={menuItems("Playback speed")}
        />
      ),
    },
    // Feature not implemented yet: "Group Details" and "Not interested" menu items are pending design.
    /*
    {
      children: menuItems("Group Details"),
    },
    {
      children: menuItems("Not interested"),
    },
    */
    contentId && {
      children: (
        <Report
          type="report-dialog"
          reportFor="VIDEO"
          contentId={contentId}
          shareUrl={shareUrl ?? ""}
          videoSlug={videoSlug ?? ""}
          children={menuItems("Report Post", "gencl:text-error-status")}
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

  return (
    <Popover {...props}>
      <PopoverTrigger>{children}</PopoverTrigger>
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
