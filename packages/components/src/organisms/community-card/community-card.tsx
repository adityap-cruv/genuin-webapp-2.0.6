import { Avatar } from "@genuin/ui/components/avatar";
import { Stats } from "../../molecules/stats";
import { Image } from "@genuin/ui/components/image";
import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { CommunityCardProps } from "./community-card.types";

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <div className="gencl:flex gencl:flex-col gencl:rounded-lg gencl:border gencl:border-secondary-200 gencl:overflow-clip gencl:w-full">
      <div className="gencl:w-full">
        <Image
          className="gencl:w-full gencl:h-15 gencl:object-cover"
          src={community.banner}
          alt="community-banner"
        />
      </div>
      <div className="gencl:p-4 gencl:flex-1">
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3">
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            <Avatar
              imageUrl={community.dp}
              alt={community.name}
              isAvatar={false}
              size="lg"
              className="gencl:shrink-0 gencl:border gencl:border-secondary-200"
            />
            <p className="gencl:text-body-1-semi-bold gencl:line-clamp-2 gencl:break-all">
              {community.name}
            </p>
          </div>
          <Button theme="primary" className="gencl:rounded-lg">
            Join
          </Button>
        </div>
        {community?.description && (
          <p className="gencl:text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-2 gencl:mt-3">
            {community.description}
          </p>
        )}
      </div>
      <div className="gencl:p-4 gencl:bg-secondary-50">
        <Stats
          className="gencl:flex gencl:justify-between"
          valueClassName="gencl:text-body-2-bold"
          labelClassName="gencl:text-body-2-medium! gencl:text-secondary-700"
          pairClassName="gencl:flex-col gencl:items-start"
          stats={{
            Members: community.stats.members,
            Groups: community.stats.groups,
            Posts: community.stats.posts,
          }}
          valueFirst
        />
      </div>
    </div>
  );
}

export function CommunityCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-col gencl:rounded-[10px] gencl:border gencl:border-secondary-200 gencl:overflow-clip",
        className
      )}
    >
      <div className="gencl:w-full">
        <Skeleton className="gencl:w-full gencl:h-15 gencl:rounded-none" />
      </div>
      <div className="gencl:p-4">
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:mb-3">
          <div className="gencl:w-full gencl:flex gencl:items-center gencl:gap-2">
            <Skeleton className="gencl:size-11 gencl:shrink-0 gencl:rounded-full" />
            <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full">
              <Skeleton className="gencl:w-full gencl:h-3" />
              <Skeleton className="gencl:w-full gencl:h-3" />
            </div>
          </div>
          <Skeleton className="gencl:w-16 gencl:h-8 gencl:bg-secondary-100 gencl:rounded-lg" />
        </div>
        <div className="gencl:flex gencl:flex-col gencl:gap-2">
          <Skeleton className="gencl:w-full gencl:h-3" />
          <Skeleton className="gencl:w-full gencl:h-3" />
        </div>
      </div>
      <div className="gencl:flex gencl:justify-between gencl:p-4 gencl:bg-secondary-50">
        {Array.from({ length: 3 }).map(() => (
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
            <Skeleton className="gencl:w-8 gencl:h-3" />
            <Skeleton className="gencl:w-15 gencl:h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
