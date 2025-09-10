import {
  HomeIcon,
  PopularIcon,
  ExploreIcon,
  LatestIcon,
  VideoIcon,
} from "@genuin/ui/icons";

export const SideBarActionLinks = [
  {
    icon: HomeIcon,
    text: "Home",
    type: "home",
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
  },
  {
    text: "Profile",
    type: "profile",
  },
  {
    icon: VideoIcon,
    text: "My Videos",
    type: "posts",
  },
] as const;
