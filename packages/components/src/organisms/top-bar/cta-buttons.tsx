import { Button } from "@genuin/ui/button";
import { useBaseContext } from "@genuin/components/context/base";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/popover";
import { Avatar } from "@genuin/ui/avatar";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { cn } from "@genuin/ui/lib/utils";
import { useCallback, useState } from "react";
import { Search } from "@genuin/components/molecules/search";
import { cva, VariantProps } from "class-variance-authority";
import { NotificationIcon } from "@genuin/ui/icons";

export const iconVariant = cva(
  "gencl:flex gencl:size-9 gencl:items-center gencl:justify-center gencl:rounded-full",
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
  const { web_cta } = useBaseContext().brandDetails;
  const { authenticationStatus } = useAuthContext();

  const showApp = web_cta === "app" || web_cta === "both";
  const showLogin = web_cta === "login" || web_cta === "both";
  const isAuthenticated = authenticationStatus === "authenticated";

  return (
    <div className="gencl:flex gencl:gap-2.5 gencl:justify-between gencl:items-center">
      <Search theme={theme} />

      {isAuthenticated && (
        <Link
          className="gencl:flex gencl:md:hidden!"
          href={buildPageUrl({ type: "notification" })}
        >
          <div className={cn(iconVariant({ theme }))}>
            <NotificationIcon size="md" theme={theme} />
          </div>
        </Link>
      )}

      {showApp && (
        <AuthenticationModal asChild customStep="GET_APP">
          <Button theme="outline" size="sm">
            Get app
          </Button>
        </AuthenticationModal>
      )}

      {showLogin && (
        <AuthenticationModal customStep="SIGNIN" asChild>
          <Button
            theme="primary"
            className={cn(isAuthenticated && "gencl:hidden")}
            size="sm"
          >
            Log in
          </Button>
        </AuthenticationModal>
      )}

      {isAuthenticated && <UserMenu />}
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
          signOut(buildPageUrl({ type: "home" }));
        }}
      >
        <LogOutIcon className="gencl:size-6" />
        Log out
      </Button>
    </div>
  );
}
