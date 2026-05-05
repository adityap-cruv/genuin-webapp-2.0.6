import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useMemo } from "react";

import { usePathname } from "@genuin/components/hooks/use-pathname";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import type { CommunityTopResultType } from "@genuin/components/react-query/api/search";
import { updateCommunityJoinStatusInSearchResults } from "@genuin/components/react-query/api/search";
import type { CommunityUserRole } from "@genuin/components/types/post";

import { SearchEmptyState, searchDataTransformers, urlGenerators } from "../../../shared";

type CommunitiesTabProps = {
  communities: CommunityTopResultType[];
  query: string;
} & ComponentProps<"div">;

export function CommunitiesTab({ communities, query, className, ...restProps }: CommunitiesTabProps) {
  const pathname = usePathname();

  // Memoize processed communities to avoid re-processing on every render
  const processedCommunities = useMemo(() => {
    return communities.map((community) => ({
      community: searchDataTransformers.community(community),
      url: urlGenerators.community(community.slug),
      key: community.community_id,
    }));
  }, [communities]);

  if (communities.length === 0) {
    return (
      <SearchEmptyState
        title="No communities found"
        subtitle="Try searching with different keywords"
        className={className}
        {...restProps}
      />
    );
  }

  return (
    <div className={cn("gencl:space-y-3", className)} {...restProps}>
      {processedCommunities.map(({ community, url, key }) => (
        <CommunityCard
          key={key}
          community={community}
          variant="search"
          url={url}
          shouldCloseModal={true}
          onCommunityJoinStatusChange={(newRole: CommunityUserRole) => {
            updateCommunityJoinStatusInSearchResults({
              communityId: community.id,
              newRole: newRole,
              query,
              pathname,
              slug: community.slug,
            });
          }}
        />
      ))}
    </div>
  );
}
