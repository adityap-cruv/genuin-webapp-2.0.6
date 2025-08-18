import { useMemo, type ComponentProps } from "react";
import {
  NotificationDataType,
  NotificationItem,
  NotificationItemSkeleton,
} from "@genuin/components/molecules/notification-item";
import { cn } from "@genuin/ui/lib/utils";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { NotificationIcon } from "@genuin/ui/icons";
import { useGetNotifications } from "@genuin/components/react-query/api/notification";
import { ComponentErrorState } from "../error-state-component";

type NotificationListProps = {
  ItemWrapper: React.ComponentType<{ children: React.ReactNode }>;
} & ComponentProps<"div">;

export function NotificationList({
  ItemWrapper,
  className,
  ...restProps
}: NotificationListProps) {
  const {
    data,
    isError,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetNotifications(10);

  const notifications: any = useMemo(() => {
    return data?.pages.flatMap((item) => item.notifications) ?? [];
  }, [data]);

  if (isLoading) {
    return <NotificationListSkeleton />;
  }

  if (isError) {
    return (
      <ComponentErrorState
        type="WARNING"
        subtitle="We're unable to load notifications."
        className="gencl:bg-transparent"
      />
    );
  }

  if (!notifications || notifications.length === 0) {
    return <NotificationsEmptyState />;
  }

  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:flex-col gencl:max-h-[80vh] gencl:overflow-y-auto gencl:gap-2",
        className
      )}
      {...restProps}
    >
      <InfiniteScroll
        hasNextPage={hasNextPage}
        getNextPage={fetchNextPage}
        isLoadingNextPage={isFetchingNextPage}
        loader={<NotificationItemSkeleton />}
      >
        {notifications.map((notification: NotificationDataType) => (
          <ItemWrapper>
            <NotificationItem
              key={notification.notification_id}
              notification={notification}
            />
          </ItemWrapper>
        ))}
      </InfiniteScroll>
    </div>
  );
}

export function NotificationsEmptyState() {
  return (
    <div className="gencl:min-h-[300px] gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4 gencl:w-full gencl:h-full gencl:text-center">
      <NotificationIcon size="xl" />
      <div>
        <h3 className="gencl:text-body-0-semi-bold gencl:text-secondary-900">
          No Notifications Yet
        </h3>
        <p className="gencl:text-body-2-medium gencl:text-secondary-600">
          All notifications will show here
        </p>
      </div>
    </div>
  );
}

export function NotificationListSkeleton() {
  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <NotificationItemSkeleton key={index} />
      ))}
    </div>
  );
}
