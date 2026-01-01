import { ThreeDotsIcon } from "@genuin/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/popover";
import { SideBarActionLinks } from "./sidebar-actions-link";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl, PageType } from "@genuin/components/lib/utils/pages";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps, useState } from "react";
import { NEXT_PUBLIC_HOST_URL } from "@genuin/components/lib/utils/env";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthContext } from "@genuin/components/context/auth";

import { SearchModal } from "@genuin/components/organisms/search-modal";
import { useBaseContext } from "@genuin/components/context/base";
import { Avatar } from "@genuin/ui/components/avatar";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

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
  showSearch?: boolean;
} & VariantProps<typeof sidebarActionsVariants> &
  ComponentProps<"div">;

export function SidebarActions({
  brandConfiguredTerms,
  brandConfiguredPrivacy,
  className,
  variant,
  showSearch,
  onItemClick,
  ...restProps
}: SidebarActionsProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const { camera_enabled } = useBaseContext().brandDetails;
  const { isMobile } = useDeviceDetection();

  return (
    <div
      className={cn(className, sidebarActionsVariants({ variant }))}
      {...restProps}
    >
      {SideBarActionLinks.map((links, index) => {
        // Skip notification and Profile link if user is not logged in
        if ((links.type === "profile" || links.type === "posts") && !user)
          return null;

        // Use SearchSidebarAction for search type when showSearch is true
        if (links.type === "search") {
          return showSearch ? (
            <SearchSidebarAction
              key={index}
              index={index}
              links={links}
              onItemClick={onItemClick}
            />
          ) : null;
        }
        // For posts menu, don't show on mobile devices or if camera_enabled is false
        if (links.type === "posts" && (isMobile || !camera_enabled)) {
          return null;
        }

        const Icon = links.type !== "profile" ? links.icon : undefined;

        return (
          <Link
            key={index}
            href={buildPageUrl({
              type: links.type as PageType,
              slug: user?.nickname,
            })}
            onClick={onItemClick}
          >
            <SidebarActionItem
              type={links.type as PageType}
              icon={"icon" in links ? links.icon : undefined}
              text={links.text}
              user={user}
              // notificationCount={
              //   links.type === "notification" ? notificationCount : undefined
              // }
              isActive={
                pathname ===
                buildPageUrl({
                  type: links.type as PageType,
                  slug: user?.nickname,
                })
              }
            />
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

type SidebarActionItemProps = {
  type: PageType;
  icon?: React.ElementType;
  text: string;
  user?: any;
  notificationCount?: number;
  isActive: boolean;
  onClick?: () => void;
};

export const SidebarActionItem = ({
  type,
  icon: Icon,
  text,
  user,
  isActive,
  notificationCount,
  onClick,
}: SidebarActionItemProps) => {
  return (
    <div
      onClick={onClick}
      className="gencl:flex gencl:rounded-lg gencl:items-center gencl:gap-4 gencl:px-2 gencl:py-2 gencl:xl:py-4 gencl:xl:px-3 gencl:hover:bg-secondary-50 gencl:cursor-pointer"
    >
      <div className="gencl:w-6 gencl:h-6 gencl:relative">
        {type === "profile" && user ? (
          <Avatar
            isAvatar={user.isAvatar || false}
            alt={user.nickname || "profile"}
            imageUrl={user.image || ""}
            size="xs"
          />
        ) : (
          Icon && (
            <Icon
              className="gencl:w-6 gencl:h-6"
              variant={isActive ? "active" : "default"}
            />
          )
        )}
        {type === "notification" &&
          notificationCount &&
          notificationCount > 0 && (
            <span className="gencl:absolute gencl:-top-1 gencl:-right-1 gencl:inline-flex gencl:items-center gencl:justify-center gencl:w-4 gencl:h-4 gencl:text-body-2-semi-bold gencl:text-white gencl:bg-primary gencl:rounded-full">
              {notificationCount > 99 ? "+" : notificationCount}
            </span>
          )}
      </div>
      <p className="gencl:text-body-1-medium">{text}</p>
    </div>
  );
};

export const SearchSidebarAction = ({
  index,
  links,
  onItemClick,
}: {
  index: number;
  links: { type: string; icon?: React.ElementType; text: string };
  onItemClick?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SidebarActionItem
        key={index}
        type={links.type as PageType}
        icon={"icon" in links ? links.icon : undefined}
        text={links.text}
        isActive={false}
        onClick={() => {
          setOpen(true);
          if (onItemClick) onItemClick();
        }}
      />
      <SearchModal
        type="search-dialog"
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      />
    </>
  );
};
