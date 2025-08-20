import {
  HomeIcon,
  PopularIcon,
  ExploreIcon,
  LatestIcon,
  NotificationIcon,
  SearchIcon,
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
    icon: SearchIcon,
    text: "Search",
    type: "search",
  },
  {
    text: "Profile",
    type: "profile",
  },
] as const;
