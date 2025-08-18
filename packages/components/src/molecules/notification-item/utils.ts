import { buildPageUrl } from "@genuin/components/lib/utils/pages";

export function generatePathname(notification: any) {
  switch (notification.type) {
    case "delete_rt":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "rt_comment":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "rt_comment_to_other_users":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "delete_video_rt_by_owner":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "invite_rt":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "remove_rt":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "reposted_rt_to_rt":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "rt_preview_available":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "community_join_request_approved":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "community_join_request":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "community_member_invited":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "community_moderator_removed":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "community_became_private":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "community_became_public":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "comment_with_user_mentioned":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "comment_with_community_mentioned":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "post_sparked":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "comment_sparked":
      return buildPageUrl({
        type: "video",
        slug: notification?.conversation_video?.slug,
      });
    case "new_community_moderator_joined":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    // case 'upload_failed':
    //   return PATH_NAME.loop(notification?.conversation?.group?.slug)
    case "bcc_to_cb_added":
      return buildPageUrl({
        type: "brand",
        slug: notification?.user?.brand?.brand_slug,
      });
    case "group_pinned_group_owner":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "group_pinned_community_admin":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "group_unpinned_group_owner":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "group_unpinned_community_admin":
      return buildPageUrl({
        type: "group",
        slug: notification?.conversation?.group?.slug,
      });
    case "community_member_joined":
      return buildPageUrl({
        type: "profile",
        slug: notification?.user?.nickname,
      });
    case "rt_member_joined":
      return buildPageUrl({
        type: "profile",
        slug: notification?.user?.nickname,
      });
    case "community_moderator_invited":
      return buildPageUrl({
        type: "community",
        slug: notification?.community?.slug,
      });
    case "reply_rt":
      // PATH_NAME.loop(notification?.conversation?.group?.slug)
      return "";
    case "rt_participation_request":
      // PATH_NAME.loop(notification?.conversation?.group?.slug)
      return "";
    case "community_deleted":
      // PATH_NAME.loop(notification?.community?.slug)
      return "";
    default:
      return null;
  }
}
