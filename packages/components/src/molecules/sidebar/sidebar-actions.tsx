import { ThreeDotsIcon } from "@genuin/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/popover";

import { SideBarActionLinks } from "./sidebar-actions-link";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps } from "react";
import { NEXT_PUBLIC_HOST_URL } from "@genuin/components/lib/utils/env";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthContext } from "@genuin/components/context/auth";
import {
  NotificationCountResponse,
  useNotificationCount,
} from "@genuin/components/react-query/api/notification/get-notification-count";

const sidebarActionsVariants = cva(
  "gencl:px-3 gencl:py-4 gencl:!w-full gencl:border-b gencl:border-secondary-100",
  {
    variants: {
      variant: {
        default:
          "gencl:flex gencl:flex-col gencl:[&_p]:hidden gencl:[&_p]:xl:block",
        mobile: "gencl:flex gencl:flex-col gencl:[&_p]:block",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type SidebarActionsProps = {
  brandConfiguredTerms: string;
  brandConfiguredPrivacy: string;
  onItemClick?: () => void;
} & VariantProps<typeof sidebarActionsVariants> &
  ComponentProps<"div">;

export function SidebarActions({
  brandConfiguredTerms,
  brandConfiguredPrivacy,
  className,
  variant,
  onItemClick,
  ...restProps
}: SidebarActionsProps) {
  const pathName = usePathname();
  const { user } = useAuthContext();
  const { data: notificationData } = useNotificationCount({
    // Only enable the query if the user is logged in
    enabled: !!user,
  });

  return (
    <div
      className={cn(className, sidebarActionsVariants({ variant }))}
      {...restProps}
    >
      {SideBarActionLinks.map((links, index) => {
        // Skip notification link if user is not logged in
        if (links.type === "notification" && !user) return null;
        const Icon = links.icon;
        const isNotification = links.type === "notification";
        const notificationCount =
          (notificationData as NotificationCountResponse)?.count || 0;
        const showNotificationCount = isNotification && notificationCount > 0;

        return (
          <Link
            key={index}
            href={buildPageUrl({ type: links.type })}
            className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-2 gencl:py-2 gencl:xl:py-4 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer"
            onClick={onItemClick}
          >
            <div className="gencl:w-6 gencl:h-6 gencl:relative">
              <Icon
                className="gencl:w-6 gencl:h-6"
                variant={
                  pathName === buildPageUrl({ type: links.type })
                    ? "active"
                    : "default"
                }
              />
              {showNotificationCount && (
                <span className="gencl:absolute gencl:-top-1 gencl:-right-1 gencl:inline-flex gencl:items-center gencl:justify-center gencl:w-4 gencl:h-4 gencl:text-body-2-semi-bold gencl:text-white gencl:bg-primary gencl:rounded-full">
                  {notificationCount > 99 ? "+" : notificationCount}
                </span>
              )}
            </div>

            <p className="gencl:text-body-1-medium">{links.text}</p>
          </Link>
        );
      })}
      <Popover>
        <PopoverTrigger asChild>
          <div className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-2 gencl:py-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer">
            <ThreeDotsIcon className="gencl:h-6 gencl:w-6 gencl:p-0" />
            <p className="gencl:text-body-1-medium">More</p>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="gencl:shadow-none gencl:focus-visible:outline-none gencl:focus-visible:ring-0 gencl:bg-white gencl:rounded-lg gencl:p-3 gencl:w-fit gencl:border gencl:border-secondary-100"
        >
          <Link
            href={
              brandConfiguredTerms
                ? brandConfiguredTerms
                : NEXT_PUBLIC_HOST_URL + "/terms"
            }
            onClick={onItemClick}
          >
            <p className="gencl:text-body-1-medium gencl:p-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg">
              Terms and Condition
            </p>
          </Link>
          <Link
            href={
              brandConfiguredPrivacy
                ? brandConfiguredPrivacy
                : NEXT_PUBLIC_HOST_URL + "/privacy"
            }
            onClick={onItemClick}
          >
            <p className="gencl:text-body-1-medium gencl:p-2 gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:rounded-lg">
              Privacy Policy
            </p>
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
}
