import { Button } from "@genuin/ui/components/button";
import type { ComponentProps } from "react";
import { Link } from "@molecules/link";
import {
  CommunitiesIcon,
  ErrorIcon,
  GroupIcon,
  PlayIcon,
} from "@genuin/ui/icons";

const ICONS = {
  play: (
    <PlayIcon variant="stroke-secondary" className="gencl:mb-2 gencl:size-8" />
  ),
  community: <CommunitiesIcon className="gencl:mb-2 gencl:size-8" />,
  group: <GroupIcon className="gencl:mb-2 gencl:size-8" />,
  warning: <ErrorIcon className="gencl:mb-2 gencl:size-8" />,
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
  NO_COMMUNITIES: {
    icon: "community",
    title: "No Communities Yet",
    subtitle: "Communities by this brand will show up here",
    showButton: false,
  },
  NO_POSTS_ITEM: {
    icon: "play",
    title: "No Posts Yet",
    subtitle: "Be the first one to post!",
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
};

export function ComponentErrorState({
  type = "NO_POSTS",
}: ComponentErrorStateProps) {
  const state = STATES_MESSAGES[type];

  return (
    <div className="gencl:flex gencl:flex-col gencl:h-full gencl:items-center gencl:w-full gencl:justify-center gencl:bg-secondary-50">
      <div className="gencl:flex gencl:flex-col gencl:h-100 gencl:items-center gencl:justify-center gencl:w-full">
        {ICONS[state.icon]}
        {state.title && (
          <p className="gencl:mb-2 gencl:text-center gencl:text-headline-4-semi-bold mb-3">
            {state.title}
          </p>
        )}
        {state.subtitle && (
          <p className="gencl:text-secondary-600 mb-4 text-body-1-semi-bold gencl:text-center gencl:mb-4">
            {state.subtitle}
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
