import { Button } from "@genuin/ui/button";
import { useBaseContext } from "@genuin/components/context/base";
import { AuthenticationModal } from "@organisms/authentication-modal";
import { useAuthContext } from "@context/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@genuin/ui/popover";
import { Avatar } from "@genuin/ui/avatar";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { Link } from "@molecules/link";
import { buildPageUrl } from "@lib/utils/pages";

export function CtaButtons() {
  const { web_cta } = useBaseContext().brandDetails;
  const { authenticationStatus } = useAuthContext();

  const showApp = web_cta === "app" || web_cta === "both";
  const showLogin =
    (web_cta === "login" || web_cta === "both") &&
    authenticationStatus === "unauthenticated";

  const showUserTick = authenticationStatus === "authenticated";
  return (
    <div className="gencl:flex gencl:gap-2.5 gencl:justify-between gencl:items-center">
      {true && (
        <AuthenticationModal asChild>
          <Button theme="outline" size="sm">
            Get app
          </Button>
        </AuthenticationModal>
      )}
      {showLogin && (
        <AuthenticationModal asChild>
          <Button theme="primary" size="sm">
            Log in
          </Button>
        </AuthenticationModal>
      )}
      {showUserTick && <UserTick />}
    </div>
  );
}

function UserTick() {
  const { user } = useAuthContext();
  if (!user) {
    return null; // or handle the case where user is not defined
  }
  return (
    <Popover>
      <PopoverTrigger>
        <Avatar
          imageUrl={user.image}
          isAvatar={user.isAvatar}
          alt={user.name}
        />
      </PopoverTrigger>
      <PopoverContent
        avoidCollisions
        sideOffset={8}
        collisionPadding={{ right: 16 }}
      >
        <Content />
      </PopoverContent>
    </Popover>
  );
}

function Content() {
  const { user, signOut } = useAuthContext();

  const ACTIONS = [
    {
      icon: <LogOutIcon className="gencl:size-6" />,
      label: "Log out",
      onClick: () => signOut("/"),
    },
  ] as const;

  if (!user) {
    return null; // or handle the case where user is not defined
  }

  // TODO: Have clarity from desgn on which button type to use here.
  // TODO: add a component for the settings link.
  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-2">
      <div className="gencl:border-b gencl:border-secondary-150 gencl:pb-3">
        <div className="gencl:flex gencl:items-center gencl:gap-2">
          <Avatar
            imageUrl={user.image}
            isAvatar={user.isAvatar}
            alt={user.name}
            size="md"
          />
          <div className="">
            <p className="gencl:text-body-1-bold">
              {user.name ?? "@" + user.nickname}
            </p>
            {!user.isBrandSystemUser && (
              // <AuthenticationModal customStep="COMPLETE_PROFILE">
              <Link href={buildPageUrl({ type: "settings" })}>
                <p className="gencl:text-body-1-semi-bold gencl:cursor-pointer gencl:text-primary gencl:hover:text-primary-700">
                  Complete Profile
                </p>
              </Link>
              // </AuthenticationModal>
            )}
          </div>
        </div>
      </div>
      <Link href={buildPageUrl({ type: "settings" })}>
        <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-2 gencl:hover:bg-secondary-50 gencl:py-3 gencl:rounded-lg gencl:text-body-1-medium">
          <SettingsIcon />
          Settings
        </div>
      </Link>
      <Button
        className="gencl:px-2 gencl:hover:bg-secondary-50 gencl:text-body-1-medium! gencl:justify-start"
        theme="custom"
        onClick={() => signOut(buildPageUrl({ type: "home" }))}
      >
        <LogOutIcon className="gencl:size-6" />
        Log out
      </Button>
    </div>
  );
}
