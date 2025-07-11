import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps, useMemo } from "react";
import { SuggestionItemType } from "@genuin/components/react-query/api/search";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import { GroupCard } from "@genuin/components/organisms/group-card";
import {
  MemberItem,
  MemberItemSkeleton,
} from "@genuin/components/molecules/member-item";
import { DialogClose } from "@genuin/ui/components/dialog";
import {
  SearchEmptyState,
  SearchLoadingState,
  searchDataTransformers,
  urlGenerators,
  searchAnalytics,
  keyGenerators,
} from "../../shared";
import { SEARCH_CONFIG } from "../../constants";

type SuggestionsProps = {
  suggestions: SuggestionItemType[];
  isLoading?: boolean;
  searchQuery?: string;
} & ComponentProps<"div">;

export function Suggestions({
  suggestions,
  isLoading = false,
  searchQuery = "",
  className,
  ...restProps
}: SuggestionsProps) {
  // Memoize processed suggestions to avoid re-processing on every render
  const processedSuggestions = useMemo(() => {
    return suggestions.map((suggestion, index) => ({
      ...suggestion,
      key: keyGenerators.suggestion(suggestion, index),
    }));
  }, [suggestions]);

  // Show loading state
  if (isLoading) {
    return (
      <SearchLoadingState
        count={SEARCH_CONFIG.SKELETON_COUNTS.SUGGESTIONS}
        SkeletonComponent={MemberItemSkeleton}
        className={cn("gencl:p-3", className)}
        {...restProps}
      />
    );
  }

  // Show empty state
  if (suggestions.length === 0) {
    return (
      <SearchEmptyState
        title={
          searchQuery.trim()
            ? `No results for "${searchQuery}"`
            : "No suggestions found"
        }
        subtitle="Try searching for something else"
        icon={
          <span className="gencl:text-[250px]! gencl:text-secondary-50 gencl:absolute gencl:inset-0 gencl:m-auto gencl:flex gencl:items-center gencl:justify-center pointer-events-none select-none">
            !
          </span>
        }
        className={cn("gencl:relative gencl:min-h-[500px]", className)}
        {...restProps}
      />
    );
  }

  return (
    <div className={cn("gencl:space-y-1 gencl:p-2", className)} {...restProps}>
      {processedSuggestions.map((suggestion) => {
        // Render appropriate component based on suggestion type
        switch (suggestion.type) {
          case "community": {
            if (!suggestion.community) return null;
            const communityData = searchDataTransformers.community(
              suggestion.community
            );
            const url = urlGenerators.community(suggestion.community.slug);

            return (
              <DialogClose key={suggestion.key} asChild>
                <CommunityCard
                  community={communityData}
                  variant="suggestion"
                  url={url}
                  onClick={() => {
                    searchAnalytics.trackRecentClick(
                      "community",
                      suggestion.community?.community_id
                    );
                  }}
                />
              </DialogClose>
            );
          }

          case "loop": {
            if (!suggestion.loop?.group?.slug) return null;
            const groupData = searchDataTransformers.group(suggestion.loop);
            const url = urlGenerators.group(suggestion.loop.group.slug);

            return (
              <DialogClose key={suggestion.key} asChild>
                <GroupCard
                  {...groupData}
                  group={{
                    ...groupData.group,
                    chat_id: suggestion.loop.chat_id,
                  }}
                  variant="suggestion"
                  url={url}
                  onClick={() => {
                    searchAnalytics.trackRecentClick(
                      "loop",
                      suggestion.loop?.chat_id
                    );
                  }}
                  shouldCloseModal={true} // Ensure modal closes on click
                />
              </DialogClose>
            );
          }

          case "user": {
            if (!suggestion.user?.nickname) return null;
            const userData = searchDataTransformers.user(suggestion.user);
            // const url = urlGenerators.profile(suggestion.user.nickname);

            return (
              <DialogClose key={suggestion.key} asChild>
                <MemberItem
                  memberData={userData}
                  variant="suggestion"
                  onClick={() => {
                    searchAnalytics.trackRecentClick(
                      "user",
                      suggestion.user?.user_id
                    );
                  }}
                />
              </DialogClose>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
