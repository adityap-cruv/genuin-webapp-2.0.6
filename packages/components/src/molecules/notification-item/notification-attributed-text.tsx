"use client";

import { getPastTense, getTimeAgo } from "@genuin/ui/lib/utils";

import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";

import { Link } from "../link";

import type { NotificationDataType } from "./notification-item.types";

export function GetNotificationAttributedText({ notification }: { notification: NotificationDataType }) {
  const { brandDetails } = useBaseContext();
  const { user } = useAuthContext();

  const reactionSuffix = brandDetails.reactions.suffix;
  const reactionTitle = brandDetails.reactions.title;
  const agoTimeString = (
    <span className="gencl:text-body-1-medium gencl:text-secondary-400">{getTimeAgo(notification?.created_at)}</span>
  );

  switch (notification.type) {
    case "delete_rt":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> deleted the group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> of </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}. {agoTimeString}
        </div>
      );
    case "rt_comment":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> commented on your post in </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.{" "}
          {agoTimeString}
        </div>
      );
    case "rt_comment_to_other_users":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> also commented on a post in </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.{" "}
          {agoTimeString}
        </div>
      );
    case "delete_video_rt_by_owner":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> removed your post from </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.{" "}
          {agoTimeString}
        </div>
      );
    case "reply_rt":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> posted to </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.
          <Text> See it now. </Text>
          {agoTimeString}
        </div>
      );
    case "rt_participation_request":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> requested to join as a member in </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> Review their request now. </Text>
          {agoTimeString}
        </div>
      );
    case "invite_rt":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> added you as a member of </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> in </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community. </Text>
          {agoTimeString}
        </div>
      );
    case "remove_rt":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> removed you as a member of </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.{" "}
          <Text>If you believe this was a mistake, contact the Group&apos;s member.</Text> {agoTimeString}
        </div>
      );
    case "reposted_rt_to_rt":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> reposted your post from </Text>
          {GroupTag(
            notification?.reposted_conversation?.group?.slug,
            notification?.reposted_conversation?.group?.group_name
          )}
          <Text> to </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text>. Check it now.</Text> {agoTimeString}
        </div>
      );
    case "rt_preview_available":
      return (
        <div>
          <Text> You successfully created the group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> Invite people to join!</Text> {agoTimeString}
        </div>
      );
    case "community_join_request_approved":
      return (
        <div>
          <Text>Welcome to </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community, </Text>
          {ProfileTag({ user: { nickname: user?.nickname ?? "" } })}
          <Text>! </Text>
          {agoTimeString}
        </div>
      );
    case "community_join_request":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> requested to join </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}. {agoTimeString}
        </div>
      );
    case "community_member_invited":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> added you in </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}. {agoTimeString}
        </div>
      );
    case "community_moderator_removed":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> removed you as admin from </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text>. You can still post and interact with the community. </Text>
          {agoTimeString}
        </div>
      );
    case "community_became_private":
      return (
        <div>
          <Text>Update: </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> is now private.</Text> {agoTimeString}
        </div>
      );
    case "community_became_public":
      return (
        <div>
          <Text>Update: </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> is now public.</Text> {agoTimeString}
        </div>
      );
    case "community_deleted":
      return (
        <div>
          <Text>Important Update: </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community has been deleted.</Text> {agoTimeString}
        </div>
      );
    case "comment_with_user_mentioned":
      return (
        <div>
          <span className="gencl:text-body-1-semi-bold">@{notification?.user?.nickname}</span>
          <Text> tagged you in a comment on </Text>
          {user?.id === notification?.conversation?.owner?.member_id ? (
            <Text>your post.</Text>
          ) : (
            <>
              <span className="gencl:text-body-1-semi-bold">@{notification?.conversation?.owner?.username}&apos;s</span>
              <Text> post. </Text>
            </>
          )}
          {agoTimeString}
        </div>
      );
    case "comment_with_community_mentioned":
      return (
        <div>
          <span className="gencl:text-body-1-semi-bold">@{notification?.user?.nickname}</span>
          <Text> mentioned </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> in a comment on </Text>
          {user?.id === notification?.conversation?.owner?.member_id ? (
            <Text>your post.</Text>
          ) : (
            <>
              <span className="gencl:text-body-1-semi-bold">@{notification?.conversation?.owner?.username}&apos;s</span>
              <Text> post. </Text>
            </>
          )}
          {agoTimeString}
        </div>
      );
    case "post_sparked":
      return (
        <div>
          {ProfileTag(notification)}
          <Text>{" " + getPastTense(reactionTitle) + " " + reactionSuffix}</Text>
          <Text> your post in </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text>. </Text>
          {agoTimeString}
        </div>
      );
    case "comment_sparked":
      return (
        <div>
          {ProfileTag(notification)} <Text>{" " + getPastTense(reactionTitle) + " " + reactionSuffix}</Text>
          <Text> your comment in </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}.{" "}
          {agoTimeString}
        </div>
      );
    case "new_community_moderator_joined": {
      const moderatorsCount = notification?.moderators?.length || 0;
      let moderatorsText;
      if (moderatorsCount === 1) {
        moderatorsText = (
          <>
            <span className="gencl:text-body-1-semi-bold">@{notification?.moderators?.[0]?.nickname}</span>
            <Text> joined as an admin of </Text>
            {CommunityTag(notification?.community?.slug, notification?.community?.name)}
            <Text>.</Text>
          </>
        );
      } else if (moderatorsCount === 2) {
        moderatorsText = (
          <div>
            <span className="gencl:text-body-1-semi-bold">@{notification?.moderators?.[0]?.nickname}</span>
            <Text> and </Text>
            <span className="gencl:text-body-1-semi-bold">@{notification?.moderators?.[1]?.nickname}</span>
            <Text> joined as admin of </Text>
            {CommunityTag(notification?.community?.slug, notification?.community?.name)}
            <Text>.</Text>
          </div>
        );
      } else if (moderatorsCount > 2) {
        moderatorsText = (
          <div>
            <span className="gencl:text-body-1-semi-bold">@{notification?.moderators?.[0]?.nickname}</span>
            <Text>, </Text>
            <span className="gencl:text-body-1-semi-bold">@{notification?.moderators?.[1]?.nickname}</span>
            <Text>and {moderatorsCount - 2} others joined as moderators of </Text>
            {CommunityTag(notification?.community?.slug, notification?.community?.name)}.
          </div>
        );
      }
      return (
        <div>
          {moderatorsText} {agoTimeString}
        </div>
      );
    }
    // case "upload_failed":
    //     const failedTime = CommonFunctions.setConversationTime(parseFloat(notification?.failedVideo?.messageAt ?? "0.0") || 0.0);
    //     return (
    //         <div>
    //             Post failed to upload. Please try again!
    //             {failedTime}
    //         </div>
    //     );
    case "bcc_to_cb_added":
      return (
        <div>
          <Link
            className="gencl:text-body-1-semi-bold"
            href={buildPageUrl({
              type: "brand",
              slug: notification?.user?.brand?.brand_slug,
            })}>
            {notification?.brand?.name}
          </Link>
          <Text> added you as a creator. Create your community now. </Text>
          {agoTimeString}
        </div>
      );
    case "group_pinned_group_owner":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> pinned your group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> in </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community. </Text>
          {agoTimeString}
        </div>
      );
    case "group_pinned_community_admin":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> pinned the group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> to </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community. </Text>
          {agoTimeString}
        </div>
      );
    case "group_unpinned_group_owner":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> unpinned your group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> from </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community. </Text>
          {agoTimeString}
        </div>
      );
    case "group_unpinned_community_admin":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> unpinned the group </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> from </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community. </Text>
          {agoTimeString}
        </div>
      );
    case "community_member_joined":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> joined the </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community as a member. </Text>
          {agoTimeString}
        </div>
      );
    case "rt_member_joined":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> joined the </Text>
          {GroupTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.group_name)}
          <Text> in </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text> community as a member. </Text>
          {agoTimeString}
        </div>
      );
    case "community_moderator_invited":
      return (
        <div>
          {ProfileTag(notification)}
          <Text> added you as an admin in </Text>
          {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          <Text>. Help us shape our community! </Text>
          {agoTimeString}
        </div>
      );
    default:
      return <Text>Please update the app to view this notification.</Text>;
  }
}

function ProfileTag(notification: any) {
  if (!notification?.user?.nickname) return;

  const isBrand = notification?.user?.brand;
  return (
    <Link
      className="gencl:text-body-1-semi-bold"
      href={buildPageUrl({
        type: isBrand ? "brand" : "profile",
        slug: isBrand ? notification?.user?.brand?.brand_slug : notification?.user?.nickname,
      })}>
      @{notification?.user?.nickname}
    </Link>
  );
}

function CommunityTag(slug: string, name: string) {
  return (
    <Link href={buildPageUrl({ type: "community", slug })} className="gencl:text-body-1-semi-bold">
      {name}
    </Link>
  );
}

function GroupTag(slug: string, name: string) {
  return (
    <Link href={buildPageUrl({ type: "group", slug })} className="gencl:text-body-1-semi-bold">
      {name}
    </Link>
  );
}

function Text({ children }: { children: any }) {
  return <span className="gencl:text-body-1-medium">{children}</span>;
}
