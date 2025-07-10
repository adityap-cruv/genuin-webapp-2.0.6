"use client";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps, ReactNode } from "react";
import {
  useRecents,
  useDeleteRecent,
  type RecentSearchItemType,
  postRecents,
  RECENT_SEARCH_CONTENT_TYPE,
} from "@genuin/components/react-query/api/search";
import { XIcon, ClockIcon } from "@genuin/ui/icons";
import { Button } from "@genuin/ui/components/button";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import { GroupCard } from "@genuin/components/organisms/group-card";
import { MemberItem } from "@genuin/components/molecules/member-item";
import { Skeleton } from "@genuin/ui/skeleton";
import { DialogClose } from "@genuin/ui/components/dialog";
import { useAuthContext } from "@genuin/components/context/auth";

export function Recents({
  className,
  onSearch,
  ...restProps
}: ComponentProps<"div"> & {
  onSearch?: (query: string) => void;
}) {
  const { authenticationStatus } = useAuthContext();
  const isAuthenticated = authenticationStatus === "authenticated";
  const {
    data: recentSearches,
    isLoading,
    isFetching,
  } = useRecents({
    enabled: isAuthenticated,
  });

  const deleteRecentMutation = useDeleteRecent();

  // Show skeleton while loading or fetching (only if authenticated)
  const showSkeleton = isAuthenticated && (isLoading || isFetching);

  const handleDeleteRecent = async (id: string) => {
    try {
      await deleteRecentMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to delete recent search:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteRecentMutation.mutateAsync({ all: true });
    } catch (error) {
      console.error("Failed to clear all recent searches:", error);
    }
  };

  if (showSkeleton) {
    return (
      <div
        className={cn("gencl:space-y-3 gencl:p-4", className)}
        {...restProps}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <RecentItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (
    !recentSearches ||
    !Array.isArray(recentSearches) ||
    recentSearches.length === 0
  ) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:p-8 gencl:text-center gencl:min-h-[400px]",
          className
        )}
        {...restProps}
      >
        <p className="gencl:text-body-1-semi-bold gencl:text-secondary-600">
          Start typing to search for communities, topics, or users
        </p>
      </div>
    );
  }

  return (
    <div className={cn("gencl:space-y-1", className)} {...restProps}>
      {/* Header */}
      <div className="gencl:flex gencl:items-center gencl:justify-between gencl:px-4 gencl:py-1">
        <h3 className="gencl:text-body-1-semi-bold gencl:text-secondary-600">
          Recent
        </h3>
        {Array.isArray(recentSearches) && recentSearches.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="default"
            theme="text"
            size="sm"
            className="gencl:text-body-2-semi-bold gencl:text-secondary-600 hover:gencl:text-foreground gencl:transition-colors gencl:p-0 gencl:h-auto"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Recent Items */}
      <div className="gencl:space-y-1">
        {Array.isArray(recentSearches) &&
          recentSearches.map((item: RecentSearchItemType) => {
            if (item.type === "text" && item.text) {
              return (
                <RecentTextItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  onDelete={() => handleDeleteRecent(item.id)}
                  onSearch={onSearch}
                />
              );
            }

            if (item.type === "community" && item.community) {
              return (
                <span
                  key={item.id}
                  onClick={async () => {
                    await postRecents(
                      RECENT_SEARCH_CONTENT_TYPE.community,
                      item?.community?.community_id
                    );
                  }}
                >
                  <RecentCommunityItem
                    id={item.id}
                    community={item.community}
                    onDelete={() => handleDeleteRecent(item.id)}
                  />
                </span>
              );
            }

            if (item.type === "loop" && item.loop) {
              return (
                <span
                  key={item.id}
                  onClick={async () => {
                    await postRecents(
                      RECENT_SEARCH_CONTENT_TYPE.loop,
                      item?.loop?.chat_id
                    );
                  }}
                >
                  <RecentGroupItem
                    id={item.id}
                    loop={item.loop}
                    onDelete={() => handleDeleteRecent(item.id)}
                  />
                </span>
              );
            }

            if (item.type === "user" && item.user) {
              return (
                <span
                  key={item.id}
                  onClick={async () => {
                    await postRecents(
                      RECENT_SEARCH_CONTENT_TYPE.user,
                      item?.user?.user_id
                    );
                  }}
                >
                  <RecentUserItem
                    id={item.id}
                    user={item.user}
                    onDelete={() => handleDeleteRecent(item.id)}
                  />
                </span>
              );
            }

            return null;
          })}
      </div>
    </div>
  );
}

// Base Recent Item Component
function RecentItem({
  children,
  onDelete,
  onClick,
  className,
}: {
  children: ReactNode;
  onDelete: () => void;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gencl:group gencl:flex gencl:items-center gencl:gap-3 gencl:px-4 gencl:py-3",
        "gencl:hover:bg-secondary-50 gencl:transition-colors",
        onClick && "gencl:cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-3 gencl:flex-1 gencl:min-w-0">
        {children}
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        variant="icon"
        theme="custom"
        size="sm"
        className="gencl:opacity-0 gencl:group-hover:opacity-100 gencl:transition-opacity gencl:p-1 hover:gencl:bg-secondary gencl:rounded-xs gencl:text-secondary-600"
        aria-label="Remove from recent searches"
      >
        <XIcon variant="default" size="md" />
      </Button>
    </div>
  );
}

// Text Recent Item (plain search query)
function RecentTextItem({
  id,
  text,
  onDelete,
  onSearch,
}: {
  id: string;
  text: string;
  onDelete: () => void;
  onSearch?: (query: string) => void;
}) {
  const handleClick = () => {
    // Trigger search with this text
    onSearch?.(text);
  };

  return (
    <RecentItem onDelete={onDelete} onClick={handleClick}>
      <div className="gencl:rounded-full gencl:bg-secondary-50 gencl:p-2">
        <ClockIcon className="gencl:h-6 gencl:w-6 gencl:text-secondary-600" />
      </div>
      <div className="gencl:min-w-0 gencl:flex-1">
        <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:truncate">
          {text}
        </p>
      </div>
    </RecentItem>
  );
}

// Community Recent Item
function RecentCommunityItem({
  id,
  community,
  onDelete,
}: {
  id: string;
  community: any;
  onDelete: () => void;
}) {
  return (
    <RecentItem onDelete={onDelete}>
      <DialogClose asChild>
        <CommunityCard
          community={{
            id: community.community_id || "",
            name: community.name || "",
            dp: community.dp || "",
            banner: community.dp || "",
            description: community.description || "",
            handle: community.handle || "",
            slug: community.slug || "",
            stats: {
              members: 0, // Not used in recent variant
              groups: 0, // Not used in recent variant
              posts: 0, // Not used in recent variant
            },
            type: community.type === 2 ? "PRIVATE" : "PUBLIC",
          }}
          variant="recent"
          className="gencl:rounded-none gencl:border-0 gencl:shadow-none gencl:p-0 gencl:hover:bg-transparent"
          url={buildPageUrl({
            type: "community",
            slug: community.slug,
          })}
          shouldCloseModal={true}
        />
      </DialogClose>
    </RecentItem>
  );
}

// Group Recent Item
function RecentGroupItem({
  id,
  loop,
  onDelete,
}: {
  id: string;
  loop: any;
  onDelete: () => void;
}) {
  const href = buildPageUrl({
    type: "group",
    slug: loop.group?.slug || loop.slug || "",
  });

  return (
    <RecentItem onDelete={onDelete}>
      <GroupCard
        group={{
          chat_id: loop.chat_id || "",
          name: loop.group?.group_name || "",
          isPrivate: false,
          url: href,
          slug: loop.group?.slug || loop.slug || "",
          description: loop.group?.group_description || "",
          stats: {
            members: 0, // Not used in recent variant
            posts: 0, // Not used in recent variant
            views: 0, // Not used in recent variant
          },
        }}
        owner={{
          userName: "", // Not used in recent variant
          url: "", // Not used in recent variant
        }}
        variant="recent"
        className="gencl:rounded-none gencl:border-0 gencl:shadow-none gencl:p-0 gencl:hover:bg-transparent gencl:w-full"
        url={href}
        shouldCloseModal={true}
      />
    </RecentItem>
  );
}

// User Recent Item
function RecentUserItem({
  id,
  user,
  onDelete,
}: {
  id: string;
  user: any;
  onDelete: () => void;
}) {
  const href = buildPageUrl({
    type: "profile",
    slug: user.nickname,
  });
  const memberData = {
    memberId: id,
    url: href,
    name: user.name || user.nickname || "",
    userName: user.nickname || "",
    profileImage: {
      isAvatar: user.is_avatar || false,
      url: user.profile_image_m || user.profile_image || "",
    },
    bio: user.bio,
    isOwner: user.is_brand_system_user, // Not applicable for recent search items
  };

  return (
    <RecentItem onDelete={onDelete} className="gencl:w-full gencl:min-w-0">
      <DialogClose asChild>
        <MemberItem
          memberData={memberData}
          variant="recent"
          className="gencl:w-full gencl:min-w-0"
        />
      </DialogClose>
    </RecentItem>
  );
}

// Skeleton for loading state
function RecentItemSkeleton() {
  return (
    <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-3 hover:gencl:bg-secondary/50 gencl:transition-colors">
      {/* Avatar/Icon skeleton */}
      <Skeleton className="gencl:size-10 gencl:shrink-0 gencl:rounded-full" />

      {/* Content skeleton */}
      <div className="gencl:flex-1 gencl:space-y-2 gencl:min-w-0">
        {/* Primary text line */}
        <Skeleton className="gencl:h-4 gencl:w-1/2" />
        {/* Secondary text line */}
        <Skeleton className="gencl:h-3 gencl:w-2/3" />
      </div>
    </div>
  );
}
