import {
  CommentIcon,
  PinIcon,
  PlayIcon,
  ShareIcon,
  // ThreeDotsIcon,
} from "@genuin/ui/icons";
import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";
import { cva } from "class-variance-authority";

import { Stats } from "../stats";

import type { PostTileProps } from "./post-tile.type";

export const postTileVariants = cva(
  "gencl:group gencl:relative gencl:rounded-md gencl:overflow-hidden gencl:aspect-reel",
  {
    variants: {
      size: {
        sm: "gencl:h-70",
        lg: "gencl:h-75",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

export function PostTile({
  postData: { imageUrl, isPinned, linkouts, stats },
  imageCompProps,
  showHover = true,
  size = "sm",
  className,
  ...restProps
}: PostTileProps) {
  return (
    <div className={cn(postTileVariants({ size }), className)} {...restProps}>
      <Image src={imageUrl} {...imageCompProps} />
      {isPinned && (
        <PinIcon className="gencl:stroke-white gencl:group-hover:hidden gencl:absolute gencl:top-2 gencl:right-2 gencl:fill-white" />
      )}
      {linkouts && (
        <div className="gencl:bg-white gencl:group-hover:hidden gencl:rounded-lg gencl:absolute gencl:top-2 gencl:size-9 gencl:left-2"></div>
      )}
      {stats && (
        <Stats
          className="gencl:group-hover:hidden gencl:flex gencl:gap-2 gencl:justify-between gencl:p-2 gencl:absolute gencl:bottom-0 gencl:w-full"
          valueClassName="gencl:text-white! gencl:text-body-2-medium"
          stats={{
            views: {
              value: stats.views,
              icon: (
                <PlayIcon className="gencl:stroke-white gencl:mr-1 gencl:stroke-2 gencl:size-3 gencl:fill-none" />
              ),
            },
            comments: {
              value: stats.comments,
              icon: (
                <CommentIcon className="gencl:stroke-white! gencl:stroke-2 gencl:mr-1 gencl:size-4" />
              ),
            },
            shares: {
              value: stats.shares,
              icon: (
                <ShareIcon className="gencl:stroke-white! gencl:mr-1 gencl:size-4" />
              ),
            },
          }}
        />
      )}
      {showHover && (
        <div className="gencl:hidden gencl:cursor-pointer gencl:group-hover:flex gencl:items-center gencl:justify-center gencl:absolute gencl:h-full gencl:w-full gencl:inset-0 gencl:bg-black/40">
          {/* <ThreeDotsIcon className="gencl:absolute gencl:top-2 gencl:p-1 gencl:rounded-md gencl:right-2 gencl:stroke-white gencl:bg-black/40" /> */}
          <div className="gencl:p-2.5 gencl:rounded-full gencl:bg-black/40 gencl:backdrop:blur-[3px]">
            <PlayIcon variant="light" className="gencl:size-6" />
          </div>
        </div>
      )}
    </div>
  );
}

export function PostTileSkeleton({
  size = "sm",
  className,
}: {
  size: PostTileProps["size"];
  className?: string;
}) {
  return (
    <Skeleton
      className={cn(postTileVariants({ size }), "gencl:shrink-0", className)}
    />
  );
}
