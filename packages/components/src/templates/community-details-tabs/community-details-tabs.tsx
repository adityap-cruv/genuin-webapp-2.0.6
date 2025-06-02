import { Loader } from "@genuin/ui/loader";

import { useGetCommunityGroups } from "src/react-query/api/community/groups";

export function CommunityDetailsTabs({ slug }: { slug: string }) {
  const {
    data: communityGroups,
    isLoading,
    isError,
  } = useGetCommunityGroups(slug);

  // TODO: handle community groups shimmer
  if (isLoading) {
    return <Loader size="md" />;
  }
  // todo: handle if community groups doesn't exist
  if (isError) {
    return <div>Handle error state for the community groups</div>;
  }

  // todo: handle if community groups is empty
  if (!communityGroups || communityGroups.loops.length === 0) {
    return <div>No community groups available.</div>;
  }

  return <div>tabs</div>;
}
