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
import { useState } from "react";

export function CtaButtons() {
  const { web_cta } = useBaseContext().brandDetails;
  const { authenticationStatus } = useAuthContext();

  const showApp = web_cta === "app" || web_cta === "both";
  const showLogin = web_cta === "login" || web_cta === "both";

  const showUserTick = authenticationStatus === "authenticated";
  return (
    <div className="gencl:flex gencl:gap-2.5 gencl:justify-between gencl:items-center">
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
            className={cn(showUserTick && "gencl:hidden")}
            size="sm"
          >
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
  const [open, setOpen] = useState(false);

  if (!user) {
    return null; // or handle the case where user is not defined
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
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
        <Content onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

function Content({ onClose }: { onClose: () => void }) {
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
              <Link href={buildPageUrl({ type: "settings" })} onClick={onClose}>
                <p className="gencl:text-body-1-semi-bold gencl:cursor-pointer gencl:text-primary gencl:hover:text-primary-700">
                  Complete Profile
                </p>
              </Link>
              // </AuthenticationModal>
            )}
          </div>
        </div>
      </div>
      {!user.isBrandSystemUser && (
        <Link href={buildPageUrl({ type: "settings" })} onClick={onClose}>
          <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:px-2 gencl:hover:bg-secondary-50 gencl:py-3 gencl:rounded-lg gencl:text-body-1-medium">
            <SettingsIcon />
            Settings
          </div>
        </Link>
      )}
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
