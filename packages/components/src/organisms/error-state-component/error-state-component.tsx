import { Button } from "@genuin/ui/components/button";
import type { ComponentProps } from "react";
import { Link } from "@genuin/components/molecules/link";
import {
  CommunitiesIcon,
  ErrorIcon,
  GroupIcon,
  LockIcon,
  PlayIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

const ICONS = {
  play: <PlayIcon theme="secondary" size="xl" className="gencl:mb-2" />,
  community: <CommunitiesIcon className="gencl:mb-2 gencl:size-8" />,
  group: <GroupIcon className="gencl:mb-2 gencl:size-8" />,
  warning: <ErrorIcon className="gencl:mb-2 gencl:size-8" />,
  private: (
    <div className="gencl:p-3 gencl:rounded-full gencl:bg-white gencl:mb-2">
      <LockIcon className="gencl:size-8" />
    </div>
  ),
};

const STATES_MESSAGES = {
  NO_POSTS: {
    icon: "play",
    title: "No Posts Yet",
    subtitle: "No content available",
    showButton: false,
    buttonLabel: "Create Post",
  },
  NO_GROUPS: {
    icon: "group",
    title: "No Groups Yet",
    subtitle: "No content available",
    showButton: false,
  },
  PRIVATE_GROUP: {
    icon: "private",
    title: "Private Group",
    subtitle: "Join this group to see and interact with their posts",
    showButton: false,
  },
  NO_COMMUNITIES: {
    icon: "community",
    title: "No Communities Yet",
    subtitle: "Communities by this brand will show up here",
    showButton: false,
  },
  PRIVATE_COMMUNITY: {
    icon: "private",
    title: "Private Community",
    subtitle:
      "Join this community to see and interact with their groups and posts",
    showButton: false,
  },
  NO_POSTS_ITEM: {
    icon: "play",
    title: "No Posts Yet",
    subtitle: "Be the first one to post!",
    showButton: false,
  },
  NO_MEMBERS: {
    icon: "group",
    title: "No Members Yet",
    subtitle: "",
    showButton: false,
  },
  WARNING: {
    icon: "warning",
    title: "",
    subtitle: "We're unable to load posts.",
    showButton: false,
  },
} as const;

type ComponentErrorStateProps = ComponentProps<"div"> & {
  type: keyof typeof STATES_MESSAGES;
  forList?: boolean;
  subtitle?: string;
  title?: string;
};

export function ComponentErrorState({
  type = "NO_POSTS",
  forList,
  title,
  subtitle,
  className,
  ...restProps
}: ComponentErrorStateProps) {
  const state = STATES_MESSAGES[type];

  if (forList) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:gap-4 gencl:bg-secondary-50 gencl:py-6 gencl:px-4",
          className
        )}
        {...restProps}
      >
        {ICONS[state.icon]}
        <div>
          <p className="gencl:mb-2 gencl:text-body-0-semi-bold">
            {title ? title : state.title}
          </p>
          <p className="gencl:text-secondary-600 gencl:text-body-1-semi-bold">
            {subtitle ? subtitle : state.subtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:h-full gencl:rounded-xl gencl:items-center gencl:w-full gencl:justify-center gencl:bg-secondary-50",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:flex-col gencl:h-100 gencl:items-center gencl:justify-center gencl:w-full">
        {ICONS[state.icon]}
        {(state.title || title) && (
          <p className="gencl:mb-2 gencl:text-center gencl:text-body-0-semi-bold gencl:sm:!text-headline-4-semi-bold mb-3">
            {title ? title : state.title}
          </p>
        )}
        {(state.subtitle || subtitle) && (
          <p className="gencl:text-secondary-600 mb-4 gencl:text-body-1-medium gencl:text-center gencl:mb-4">
            {subtitle ? subtitle : state.subtitle}
          </p>
        )}
        {state.showButton && "buttonLabel" in state && state.buttonLabel && (
          <Link href="/">
            <Button size="md" theme="outline">
              {state.buttonLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
