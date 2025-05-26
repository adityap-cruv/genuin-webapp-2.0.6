import { Avatar } from "@genuin/ui/avatar";
import { Button } from "@genuin/ui/button";

import type { PostDetailsType } from "src/react-query/api/feed/schema";

// TODO: Figure out how to use links.
export function OwnerInfo({ owner }: { owner: PostDetailsType["owner"] }) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center">
      <Avatar
        alt={owner.name ?? ""}
        imageUrl={owner.profileImage}
        isAvatar={owner.isAvatar}
        size="md"
      />
      <Button
        theme="text"
        className="gencl:text-body-1-medium gencl:px-0"
        asChild
      >
        <a>{owner.userName}</a>
      </Button>
    </div>
  );
}
