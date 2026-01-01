import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@genuin/ui/popover";
import { lazy, Suspense, useState, useCallback } from "react";
import { useBaseContext } from "@genuin/components/context/base";
import { useAuthContext } from "@genuin/components/context/auth";
import { Button } from "@genuin/ui/button";

import type { AuthenticationModalProps } from "@genuin/components/organisms/authentication-modal";

const AuthenticationModal = lazy(() =>
  import("../../organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
) as React.ComponentType<AuthenticationModalProps>;

import { Avatar } from "@genuin/ui/avatar";
import { ChevronLeft, LogOutIcon, SettingsIcon } from "lucide-react";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { cn } from "@genuin/ui/lib/utils";
import { NotificationIcon, XIcon, PlusIcon } from "@genuin/ui/icons";
import { NotificationList } from "@genuin/components/organisms/notification-list";
import {
  NotificationCountResponse,
  useNotificationCount,
  useReadNotifications,
} from "@genuin/components/react-query/api/notification";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { Search } from "@genuin/components/molecules/search";
import { cva, VariantProps } from "class-variance-authority";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@genuin/ui/components/sheet";
import { useAnalytics } from "@genuin/components/context/analytics";

export const iconVariant = cva(
  "gencl:flex gencl:size-9 gencl:items-center gencl:justify-center gencl:rounded-full gencl:sm:rounded-lg!",
  {
    variants: {
      theme: {
        light: "gencl:bg-white gencl:border gencl:border-secondary-150",
        dark: "gencl:bg-black/40",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  }
);

/**
 * Top bar CTA buttons for the web app.
 * Handles login, app download, notifications, and user menu.
 */
export function CtaButtons({ theme }: VariantProps<typeof iconVariant>) {
  const { web_cta, camera_enabled } = useBaseContext().brandDetails;
  const { authenticationStatus } = useAuthContext();
  const { track, EventName } = useAnalytics();

  const showApp = web_cta === "app" || web_cta === "both";
  const showLogin = web_cta === "login" || web_cta === "both";
  const isAuthenticated = authenticationStatus === "authenticated";

  return (
    <div className="gencl:flex gencl:gap-2.5 gencl:justify-between gencl:items-center">
      <Search theme={theme} />

      {showApp && (
        <Suspense fallback={<Button theme="outline" size="sm">Get app</Button>}>
          <AuthenticationModal
            asChild
            customStep="GET_APP"
            onClick={() => {
              track(EventName.GET_APP_BUTTON_CLICKED);
            }}
          >
            <Button theme="outline" size="sm">
              Get app
            </Button>
          </AuthenticationModal>
        </Suspense>
      )}

      {isAuthenticated && camera_enabled && (
        <Link
          className="gencl:hidden gencl:md:block!"
          href={buildPageUrl({ type: "posts-create" })}
        >
          <Button theme="outline" size="sm">
            <PlusIcon className="gencl:size-6" />
            Create
          </Button>
        </Link>
      )}

      {showLogin && (
        <Suspense fallback={<Button theme="primary" className={cn(isAuthenticated && "gencl:hidden")} size="sm">Log in</Button>}>
          <AuthenticationModal customStep="SIGNIN" asChild>
            <Button
              theme="primary"
              className={cn(isAuthenticated && "gencl:hidden")}
              size="sm"
            >
              Log in
            </Button>
          </AuthenticationModal>
        </Suspense>
      )}

      {isAuthenticated && (
        <>
          <Notification />
          <UserMenu />
        </>
      )}
    </div>
  );
}

/**
 * UserMenu: Avatar popover for authenticated users.
 * Shows user info, settings, and logout.
 */
function UserMenu() {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="gencl:cursor-pointer">
        <Avatar
          imageUrl={user.image}
          isAvatar={user.isAvatar}
          alt={user.name}
        />
      </PopoverTrigger>
      <PopoverContent
        className="gencl:border-none gencl:bg-white"
        avoidCollisions
        sideOffset={8}
        collisionPadding={{ right: 16 }}
      >
        <UserMenuContent onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

// TODO: Have clarity from desgn on which button type to use here.
/**
 * UserMenuContent: Popover content for user menu.
 * Shows user info, settings, and logout.
 */
function UserMenuContent({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuthContext();
  const { track, EventName } = useAnalytics();
  if (!user) return null;

  // Profile is considered complete if all required fields are truthy
  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    const { hasTopics, name, usernameSet, image, bio } = user;
    return [hasTopics, name, usernameSet, image, bio].every(Boolean);
  }, [user]);

  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-2">
      {/* User info and profile completion */}
      <div className="gencl:border-b gencl:border-secondary-150 gencl:pb-3">
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          <Avatar
            imageUrl={user.image}
            isAvatar={user.isAvatar}
            alt={user.name}
            size="md"
          />
          <div>
            <p className="gencl:text-body-1-bold">
              {user.name ?? "@" + user.nickname}
            </p>
            {!user.isBrandSystemUser && (
              <Link href={buildPageUrl({ type: "settings" })} onClick={onClose}>
                <p className="gencl:text-body-1-semi-bold gencl:cursor-pointer gencl:text-secondary-600 gencl:hover:text-secondary-900">
                  {isProfileComplete() ? " View Profile" : "Complete Profile"}
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Settings link for non-brand users */}
      {!user.isBrandSystemUser && (
        <Link href={buildPageUrl({ type: "settings" })} onClick={onClose}>
          <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-2 gencl:hover:bg-secondary-50 gencl:py-3 gencl:rounded-lg gencl:text-body-1-medium">
            <SettingsIcon />
            Settings
          </div>
        </Link>
      )}

      {/* Logout button */}
      <Button
        className="gencl:px-2 gencl:hover:bg-secondary-50 gencl:text-body-1-medium! gencl:justify-start"
        theme="custom"
        onClick={() => {
          onClose();
          track(EventName.LOG_OUT);
          signOut(buildPageUrl({ type: "home" }));
        }}
      >
        <LogOutIcon className="gencl:size-6" />
        Log out
      </Button>
    </div>
  );
}

type NotificationItemWrapperType = {
  children: React.ReactNode;
  onClick: () => void;
};

const NotificationItemWrapper = ({
  children,
  onClick,
}: NotificationItemWrapperType) => {
  const { isMobile } = useDeviceDetectMediaQuery();

  if (isMobile) {
    return <SheetClose onClick={onClick}>{children}</SheetClose>;
  }
  return <PopoverClose onClick={onClick}>{children}</PopoverClose>;
};

function Notification() {
  const { user } = useAuthContext();
  const { isMobile } = useDeviceDetectMediaQuery();

  // Only enable the query if the user is logged in
  const { data: notificationData, refetch: refreshNotification } =
    useNotificationCount({ enabled: !!user });

  const { mutate: markAsReadAll } = useReadNotifications({
    onSuccess: () => refreshNotification(),
  });

  const hasUnreadNotifications =
    ((notificationData as NotificationCountResponse)?.count || 0) > 0;

  const notificationButton = (
    <Button theme="outline" variant="icon" size="sm">
      <div className="gencl:relative">
        <NotificationIcon />
        {hasUnreadNotifications && (
          <span className="gencl:absolute gencl:w-2 gencl:h-2 gencl:bg-red gencl:rounded-xl gencl:border-1 gencl:border-white gencl:top-0" />
        )}
      </div>
    </Button>
  );

  const handleNotificationClick = async (open?: boolean) => {
    // Check if popover close than trigger api
    if (open) return;
    markAsReadAll(true);
  };

  const notificationHeader = (
    <div
      className={cn(
        "gencl:flex gencl:items-center gencl:justify-between",
        isMobile
          ? "gencl:border-b gencl:border-secondary-150 gencl:px-4 gencl:py-2"
          : "gencl:mb-4"
      )}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-2">
        {isMobile && (
          <NotificationItemWrapper onClick={handleNotificationClick}>
            <ChevronLeft className="gencl:stroke-secondary-600 gencl:cursor-pointer" />
          </NotificationItemWrapper>
        )}
        <h3 className="gencl:text-headline-4-semi-bold">Notifications</h3>
      </div>

      {!isMobile && (
        <NotificationItemWrapper onClick={handleNotificationClick}>
          <XIcon size="md" theme="secondary" className="gencl:cursor-pointer" />
        </NotificationItemWrapper>
      )}
    </div>
  );

  if (!user) {
    return null;
  }

  if (isMobile) {
    return (
      <Sheet onOpenChange={handleNotificationClick}>
        <SheetTrigger>{notificationButton}</SheetTrigger>
        <SheetContent
          side="left"
          className="gencl:gap-0 gencl:w-full"
          hideCloseIcon
        >
          {notificationHeader}
          <div className="gencl:w-full gencl:h-full gencl:p-4">
            <NotificationList
              ItemWrapper={({ children }) => (
                <NotificationItemWrapper onClick={handleNotificationClick}>
                  {children}
                </NotificationItemWrapper>
              )}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover onOpenChange={handleNotificationClick}>
      <PopoverTrigger asChild>{notificationButton}</PopoverTrigger>
      <PopoverContent
        className="gencl:border-none gencl:bg-white gencl:px-4 gencl:pt-6 gencl:pb-4 gencl:w-100 gencl:rounded-3xl gencl:drop-shadow-sm"
        align="end"
      >
        {notificationHeader}
        <NotificationList
          ItemWrapper={({ children }) => (
            <NotificationItemWrapper onClick={handleNotificationClick}>
              {children}
            </NotificationItemWrapper>
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
