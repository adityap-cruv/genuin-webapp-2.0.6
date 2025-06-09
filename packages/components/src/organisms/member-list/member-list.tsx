import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import {
  MemberItem,
  MemberItemSkeleton,
  type MemberDataType,
} from "@molecules/member-item";

type MemberListProps = {
  title?: string;
  members?: MemberDataType[];
  fetchNextPage?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
} & ComponentProps<"div">;

export function MemberList({
  title,
  members,
  fetchNextPage,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  className,
  ...restProps
}: MemberListProps) {
  if (isLoading) {
    return <MemberListSkeleton />;
  }

  // TODO: Handle error state properly, e.g., show an error message
  if (isError) {
    return <div>Error loading members.</div>;
  }

  // TODO: Handle empty state properly
  if (!members || members.length === 0) {
    return <div>No members found.</div>;
  }

  return (
    <div
      className={cn("gencl:flex gencl:w-full gencl:flex-col", className)}
      {...restProps}
    >
      {title && <p className="gencl:pb-4 gencl:text-body-1-medium">{title}</p>}
      <InfiniteScroll
        hasNextPage={hasNextPage}
        getNextPage={fetchNextPage}
        isLoadingNextPage={isFetchingNextPage}
        //TODO: Add a loader component or skeleton
        loader={<div></div>}
      >
        {members.map((member) => (
          <MemberItem
            key={member.memberId}
            memberData={member}
            className="gencl:py-2 gencl:mb-2 gencl:rounded-lg gencl:hover:bg-secondary-150 gencl:pl-2 gencl:pr-4"
          />
        ))}
      </InfiniteScroll>
    </div>
  );
}

export function MemberListSkeleton() {
  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:overflow-clip">
      {Array.from({ length: 10 }).map(() => (
        <MemberItemSkeleton />
      ))}
    </div>
  );
}
