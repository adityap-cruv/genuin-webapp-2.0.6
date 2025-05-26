import { Button } from "@genuin/ui/button";

import type { CommunityUserRole } from "src/types/post";

type JoinCommunityButtonProps = {
  onCommunityJoinStatusChange?: (newRole: CommunityUserRole) => void;
};

export function JoinCommunityButton({
  onCommunityJoinStatusChange,
}: JoinCommunityButtonProps) {
  return (
    <Button size="sm" onClick={() => onCommunityJoinStatusChange?.("MEMBER")}>
      Join Community
    </Button>
  );
}
