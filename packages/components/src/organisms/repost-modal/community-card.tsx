import { DecorativeList } from "@genuin/ui/components/decorative-list";
import { CommunityPrivacyInfo } from "@molecules/community-privacy-info";
import { GroupPrivacyInfo } from "@molecules/group-privacy-info";
import { Avatar } from "@genuin/ui/components/avatar";
import { RepostCommunityType } from "@react-query/api/repost/schema";

import { Button } from "@genuin/ui/button";
import { RepostIcon } from "@genuin/ui/icons";
import { useRepostVideoMutation } from "@react-query/api/repost";
import { useCallback } from "react";
import { toast, toastError } from "@genuin/ui/components/toaster";
import { cn } from "@genuin/ui/lib/utils";
import { Link } from "@molecules/link";
import { buildPageUrl } from "@lib/utils/pages";

export function CommunityCard({
  communityInfo,
  videoId,
}: {
  communityInfo: RepostCommunityType;
  videoId: string;
}) {
  return (
    <div>
      <div className="gencl:flex gencl:gap-x-3">
        <Avatar
          size="md"
          alt={communityInfo.name ?? ""}
          imageUrl={communityInfo.dp_m ?? communityInfo.dp ?? ""}
          isAvatar={false}
        />
        <div>
          <span className="gencl:space-y-1">
            <Link
              href={buildPageUrl({
                type: "community",
                slug: communityInfo.slug,
              })}
            >
              <p
                title={communityInfo.name ?? ""}
                className="gencl:line-clamp-2 gencl:text-body-1-bold"
              >
                {communityInfo.name}
              </p>
            </Link>
            <CommunityPrivacyInfo
              isPrivate={communityInfo.type === "PRIVATE"}
              className="gencl:text-body-2-medium gencl:text-secondary-600!"
            />
          </span>
        </div>
      </div>
      <DecorativeList className="gencl:ml-4 gencl:space-y-4">
        <div className="gencl:h-0.5" />
        {communityInfo.chats.map((item, index) => {
          return (
            <li key={index}>
              <div className="gencl:w-full gencl:flex gencl:justify-between gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-secondary-50 gencl:px-4 gencl:py-3">
                <div className="gencl:space-y-1">
                  <Link href={buildPageUrl({ type: "group", slug: item.slug })}>
                    <p className="gencl:line-clamp-1 gencl:break-all gencl:text-body-1-semi-bold">
                      {item.group.group_name}
                    </p>
                  </Link>
                  {item.actions[0] && (
                    <GroupPrivacyInfo
                      accessTypeId={item.actions[0]?.access_type_id}
                      actionId={item.actions[0]?.action_id}
                    />
                  )}
                </div>
                <RepostButton videoId={videoId} destinationId={item.chat_id} />
              </div>
            </li>
          );
        })}
      </DecorativeList>
    </div>
  );
}

function RepostButton({
  destinationId,
  videoId,
}: {
  destinationId: string;
  videoId: string;
}) {
  const {
    mutate: repostVideo,
    isPending,
    isSuccess,
  } = useRepostVideoMutation({
    onSuccess: () => {
      toast("Video reposted successfully!");
    },
    onError: () => {
      toastError("Failed to repost video. Please try again later.");
    },
  });

  const handleRepost = useCallback(() => {
    repostVideo({ destinationId, sourceVideoId: videoId });
  }, [destinationId, videoId]);

  return (
    <Button
      theme={isSuccess ? "primary" : "outline"}
      disabled={isPending}
      onClick={handleRepost}
    >
      <RepostIcon
        className={cn("gencl:size-6", isPending && "gencl:animate-spin")}
      />
      {isSuccess ? "Reposted" : "Repost"}
    </Button>
  );
}
