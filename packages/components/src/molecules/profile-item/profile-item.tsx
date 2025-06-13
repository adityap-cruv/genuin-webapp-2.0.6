import { Avatar } from "@genuin/ui/components/avatar";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { TickIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

type ProfileItemProps = {
  username: string;
  isVerified: boolean;
  profileImage: {
    isAvatar: boolean;
    url: string;
  };
  className?: string;
};

export function ProfileItem({
  username,
  isVerified,
  profileImage,
  className,
}: ProfileItemProps) {
  return (
    <div className={cn(className)}>
      <Avatar
        isAvatar={profileImage.isAvatar}
        imageUrl={profileImage.url}
        alt={username}
        className="gencl:size-20"
      />
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:mt-2">
        <p className="gencl:text-body-2-semi-bold">@{username}</p>
        {isVerified && (
          <TickIcon variant="primary" className="gencl:size-3 gencl:shrink-0" />
        )}
      </div>
    </div>
  );
}

export function ProfileItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <Skeleton className="gencl:size-20 gencl:rounded-full" />
      <div className="gencl:w-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:mt-2">
        <Skeleton className="gencl:w-full gencl:h-3" />
        <Skeleton className="gencl:w-3 gencl:h-3 gencl:shrink-0" />
      </div>
    </div>
  );
}
