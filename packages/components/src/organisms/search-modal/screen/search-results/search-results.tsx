import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@genuin/ui/components/tabs";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps } from "react";
import { useTopResults } from "@genuin/components/react-query/api/search";
import {
  TopTab,
  PostsTab,
  CommunitiesTab,
  GroupsTab,
  ProfilesTab,
} from "./tabs";
import { Skeleton } from "@genuin/ui/components/skeleton";
import {
  SearchEmptyState,
  SearchErrorState,
  SearchLoadingState,
} from "../../shared";
import { SEARCH_CONFIG } from "../../constants";

type SearchResultsProps = {
  query: string;
  onSelect?: (result: any) => void;
  onClose?: () => void;
} & Omit<ComponentProps<"div">, "onSelect">;

export function SearchResults({
  query,
  onSelect,
  onClose,
  className,
  ...restProps
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState("top");
  const { data: topResults, isLoading, error } = useTopResults(query);

  // Memoize tab configuration
  const tabs = useMemo(
    () =>
      [
        { value: "top", label: "Top" },
        { value: "posts", label: "Posts" },
        { value: "communities", label: "Communities" },
        { value: "groups", label: "Groups" },
        { value: "profiles", label: "Profiles" },
      ] as const,
    []
  );

  // Memoize totals calculation
  const totals = useMemo(() => {
    if (!topResults) return null;

    return {
      posts: topResults.videos.length,
      communities: topResults.communities.length,
      groups: topResults.loops.length,
      profiles: topResults.people.length,
    };
  }, [topResults]);

  const totalResults = totals
    ? totals.posts + totals.communities + totals.groups + totals.profiles
    : 0;

  // Show loading state
  if (isLoading) {
    return (
      <SearchLoadingState
        count={SEARCH_CONFIG.SKELETON_COUNTS.SEARCH_RESULTS}
        SkeletonComponent={SearchItemSkeleton}
        className={cn("gencl:p-4", className)}
        {...restProps}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <SearchErrorState
        message="Failed to load search results. Please try again."
        className={className}
        {...restProps}
      />
    );
  }

  // Show empty state when no results
  if (!topResults || totalResults === 0) {
    return (
      <SearchEmptyState
        title="No results found"
        subtitle={`No results found for "${query}". Try searching with different keywords.`}
        className={className}
        {...restProps}
      />
    );
  }

  return (
    <div
      className={cn(
        "gencl:w-full gencl:h-full gencl:flex gencl:flex-col",
        className
      )}
      {...restProps}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gencl:flex gencl:flex-col gencl:h-full"
      >
        {/* Fixed header with tabs - sticky positioning */}
        <div className="gencl:sticky gencl:top-0 gencl:z-10 gencl:bg-white gencl:border-b gencl:border-secondary-200 gencl:px-4">
          <TabsList className="gencl:w-auto gencl:inline-flex gencl:bg-transparent gencl:border-none gencl:rounded-none gencl:h-10 gencl:p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gencl:relative gencl:data-[state=active]:gencl:bg-transparent gencl:data-[state=active]:gencl:text-primary gencl:data-[state=active]:gencl:border-b-2 gencl:data-[state=active]:gencl:border-primary gencl:rounded-none gencl:px-4 gencl:py-1 gencl:text-sm gencl:font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Scrollable content area */}
        <div className="gencl:flex-1 gencl:overflow-y-auto">
          <TabsContent value="top" className="gencl:p-4 gencl:m-0">
            <TopTab
              topResults={topResults}
              query={query}
              onSeeAll={(tab) => setActiveTab(tab)}
              onSelect={(result) => {
                console.log("Selected result:", result);
                // onSelect?.(result);
                // onClose?.();
              }}
            />
          </TabsContent>

          <TabsContent value="posts" className="gencl:p-4 gencl:m-0">
            <PostsTab posts={topResults.videos} />
          </TabsContent>

          <TabsContent value="communities" className="gencl:p-4 gencl:m-0">
            <CommunitiesTab communities={topResults.communities} />
          </TabsContent>

          <TabsContent value="groups" className="gencl:p-4 gencl:m-0">
            <GroupsTab groups={topResults.loops} />
          </TabsContent>

          <TabsContent value="profiles" className="gencl:p-4 gencl:m-0">
            <ProfilesTab profiles={topResults.people} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Skeleton for loading state
function SearchItemSkeleton() {
  return (
    <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-3 hover:gencl:bg-secondary/50 gencl:transition-colors">
      {/* Avatar/Icon skeleton */}
      <Skeleton className="gencl:size-10 gencl:shrink-0 gencl:rounded-full" />

      {/* Content skeleton */}
      <div className="gencl:flex-1 gencl:space-y-2 gencl:min-w-0">
        {/* Primary text line */}
        <Skeleton className="gencl:h-4 gencl:w-1/2" />
        {/* Secondary text line */}
        <Skeleton className="gencl:h-3 gencl:w-203" />
      </div>
    </div>
  );
}
