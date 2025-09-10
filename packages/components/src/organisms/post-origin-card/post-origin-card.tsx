import { Avatar, DecorativeList } from "@genuin/ui/components";
import { PostOriginCardProps } from "./types";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";
import { CommunityPrivacyInfo } from "@genuin/components/molecules/community-privacy-info";
import { GroupPrivacyInfo } from "@genuin/components/molecules/group-privacy-info";
import { Skeleton } from "@genuin/ui/components/skeleton";

export function PostOriginCard({ community, group }: PostOriginCardProps) {
  return (
    <div className="gencl:w-full">
      <div className="gencl:flex gencl:gap-x-3">
        <Avatar
          alt={community?.name ?? ""}
          imageUrl={community?.profileImage ?? ""}
          isAvatar={false}
          size="md"
        />
        <div>
          <span className="gencl:space-y-1">
            <Link
              href={buildPageUrl({ type: "community", slug: community?.slug })}
            >
              <p
                title={community?.name ?? ""}
                className="gencl:line-clamp-1 gencl:text-body-1-semi-bold gencl:mb-1"
              >
                {community?.name}
              </p>
            </Link>
            <CommunityPrivacyInfo
              isPrivate={community?.isPrivate ?? false}
              className="gencl:text-body-2-medium gencl:text-secondary-600!"
            />
          </span>
        </div>
      </div>
      <DecorativeList className="gencl:ml-4.5 gencl:space-y-2 gencl:[&>li]:pl-0 gencl:[&>li]:before:w-4">
        <div className="gencl:h-0.5" />
        <li>
          <div className="gencl:w-full gencl:flex gencl:justify-between gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-secondary-50 gencl:px-4 gencl:py-3">
            <div className="gencl:space-y-1">
              <Link href={buildPageUrl({ type: "group", slug: group?.slug })}>
                <p className="gencl:line-clamp-1 gencl:break-all gencl:text-body-1-semi-bold gencl:mb-1">
                  {group?.name}
                </p>
              </Link>
              {group?.actions && group?.actions[0] && (
                <GroupPrivacyInfo
                  accessTypeId={group?.actions[0]?.access_type_id}
                  actionId={group?.actions[0]?.action_id}
                />
              )}
            </div>
          </div>
        </li>
      </DecorativeList>
    </div>
  );
}

export function PostOriginCardSkeleton() {
  return (
    <div className="gencl:w-full">
      <div className="gencl:flex gencl:gap-x-3">
        <Skeleton className="gencl:size-10 gencl:rounded-full" />
        <div className="gencl:flex gencl:flex-col gencl:gap-2">
          <Skeleton className="gencl:w-100 gencl:h-4" />
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            <Skeleton className="gencl:size-4 gencl:rounded-sm" />
            <Skeleton className="gencl:h-3 gencl:w-1/3" />
          </div>
        </div>
      </div>
      <DecorativeList className="gencl:ml-4.5 gencl:space-y-2 gencl:[&>li]:pl-0 gencl:[&>li]:before:w-4">
        <div className="gencl:h-0.5" />
        <li>
          <div className="gencl:w-full gencl:flex gencl:justify-between gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-secondary-50 gencl:px-4 gencl:py-3">
            <div className="gencl:flex gencl:flex-col gencl:gap-2">
              <Skeleton className="gencl:w-100 gencl:h-4" />
              <div className="gencl:flex gencl:items-center gencl:gap-2">
                <Skeleton className="gencl:size-4 gencl:rounded-sm" />
                <Skeleton className="gencl:w-1/2 gencl:h-3" />
              </div>
            </div>
          </div>
        </li>
      </DecorativeList>
    </div>
  );
}
