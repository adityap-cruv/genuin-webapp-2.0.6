import {
  HomeIcon,
  PopularIcon,
  ExploreIcon,
  LatestIcon,
} from "@genuin/ui/icons";
import { SVGIconsProps } from "@genuin/ui/icons/type";
import { PageType } from "@lib/utils/pages";
import React from "react";

type SideBarActionLinksType = {
  icon: (props: SVGIconsProps) => React.ReactNode,
  text: string,
  type: PageType
}

export const SideBarActionLinks: SideBarActionLinksType[] = [
  {
    icon: HomeIcon,
    text: "Home",
    type : "home"
  },
  {
    icon: PopularIcon,
    text: "Popular",
    type: "popular",
  },
  {
    icon: LatestIcon,
    text: "Latest",
    type: "latest",
  },
  {
    icon: ExploreIcon,
    text: "Explore",
    type: "explore",
  }
];
