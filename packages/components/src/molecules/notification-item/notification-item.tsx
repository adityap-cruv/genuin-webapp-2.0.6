import { Avatar } from "@genuin/ui/components/avatar";
import { Image } from "@genuin/ui/components/image";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { Link } from "../link";

import { GetNotificationAttributedText } from "./notification-attributed-text";
import type { NotificationDataType } from "./notification-item.types";
import { generatePathname } from "./utils";

type NotificationItemProps = {
  notification: NotificationDataType;
  className?: string;
} & ComponentProps<"a">;

export function NotificationItem({ notification, className, ...restProps }: NotificationItemProps) {
  const pathname = generatePathname(notification);

  // Removed notification from list which is not need to handle as fallback
  if (typeof pathname !== "string") {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "gencl:w-full gencl:flex gencl:text-start gencl:gap-4 gencl:px-4 gencl:py-2 gencl:rounded-lg",
          {
            "gencl:bg-primary-100": !notification?.is_read,
            "gencl:hover:bg-secondary-50": notification?.is_read,
          },
          className
        )}>
        <Link
          href={buildPageUrl({
            type: "profile",
            slug: notification?.user?.nickname,
          })}>
          <Avatar
            size="lg"
            alt={notification?.user?.name || ""}
            imageUrl={(notification?.user?.profile_image_m ?? notification?.user?.profile_image) || ""}
            isAvatar={notification?.user?.is_avatar || false}
          />
        </Link>
        <GetNotificationAttributedText notification={notification} />

        {notification?.conversation_video?.thumbnail_url && (
          <Link
            href={buildPageUrl({
              type: "video",
              slug: notification?.conversation_video?.slug,
            })}
            className="gencl:shrink-0">
            <div className="gencl:relative gencl:w-12 gencl:h-12">
              <div className="gencl:absolute gencl:w-6 gencl:h-6 gencl:rounded-full gencl:bg-blend-overlay gencl:!bg-black/40 gencl:top-1/2 gencl:left-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2 gencl:flex gencl:items-center gencl:justify-center gencl:z-10">
                <PlayIcon className="gencl:w-3/4" />
              </div>
              <Image
                className="gencl:rounded-lg gencl:object-cover gencl:aspect-square"
                src={notification?.conversation_video?.thumbnail_url}
                alt="thumbnail"
              />
            </div>
          </Link>
        )}
        {notification?.community?.dp && (
          <Link
            href={buildPageUrl({
              type: "community",
              slug: notification?.community?.slug,
            })}>
            <Avatar
              imageUrl={notification?.community?.dp}
              alt={notification?.community?.name}
              isAvatar={false}
              size="lg"
              className="gencl:rounded-lg"
              imageClassName="gencl:rounded-lg"
              fallbackClassName="gencl:rounded-lg gencl:bg-secondary-150 gencl:text-secondary-500"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="gencl:w-full gencl:flex gencl:items-center gencl:gap-4 gencl:px-4 gencl:py-2">
      <Skeleton className="gencl:w-12 gencl:h-12 gencl:rounded-full gencl:shrink-0" />
      <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-2.5">
        <Skeleton className="gencl:w-full gencl:h-3 gencl:bg-secondary-100 gencl:rounded-md" />
        <Skeleton className="gencl:w-full gencl:h-3 gencl:bg-secondary-100 gencl:rounded-md" />
      </div>
      <Skeleton className="gencl:w-12 gencl:h-12 gencl:rounded-lg gencl:shrink-0" />
    </div>
  );
}
