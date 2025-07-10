import {
  HomeIcon,
  PopularIcon,
  ExploreIcon,
  LatestIcon,
  NotificationIcon,
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
    icon: NotificationIcon,
    text: "Notification",
    type: "notification",
  },
] as const;
