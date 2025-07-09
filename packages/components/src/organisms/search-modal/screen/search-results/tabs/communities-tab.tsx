import { ComponentProps, useMemo } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { CommunityCard } from "@genuin/components/organisms/community-card";
import { CommunityTopResultType } from "@genuin/components/react-query/api/search";
import {
  SearchEmptyState,
  searchDataTransformers,
  urlGenerators,
} from "../../../shared";

type CommunitiesTabProps = {
  communities: CommunityTopResultType[];
} & ComponentProps<"div">;

export function CommunitiesTab({
  communities,
  className,
  ...restProps
}: CommunitiesTabProps) {
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
        />
      ))}
    </div>
  );
}
