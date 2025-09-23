import { ComponentProps, useMemo } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import {
  CommunityTopResultType,
  updateCommunityJoinStatusInSearchResults,
} from "@genuin/components/react-query/api/search";
import {
  SearchEmptyState,
  searchDataTransformers,
  urlGenerators,
} from "../../../shared";
import { CommunityUserRole } from "@genuin/components/types/post";
import { usePathname } from "@genuin/components/hooks/use-pathname";

type CommunitiesTabProps = {
  communities: CommunityTopResultType[];
  query: string;
} & ComponentProps<"div">;

export function CommunitiesTab({
  communities,
  query,
  className,
  ...restProps
}: CommunitiesTabProps) {
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
