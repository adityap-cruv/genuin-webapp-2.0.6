import { PATH_NAME } from './utils/constants/path'

export function generatePathname(notification: any) {
  switch (notification.type) {
    case 'delete_rt':
      return PATH_NAME.community(notification?.community?.slug)
    case 'rt_comment':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'rt_comment_to_other_users':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'delete_video_rt_by_owner':
      return PATH_NAME.loop(notification?.conversation?.group?.slug)
    // case 'reply_rt':
    //   return PATH_NAME.loop(notification?.conversation?.group?.slug)
    // case 'rt_participation_request':
    //   return PATH_NAME.loop(notification?.conversation?.group?.slug)
    case 'invite_rt':
      return PATH_NAME.loop(notification?.conversation?.group?.slug)
    case 'remove_rt':
      return PATH_NAME.loop(notification?.conversation?.group?.slug)
    case 'reposted_rt_to_rt':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'rt_preview_available':
      return PATH_NAME.loop(notification?.conversation?.group?.slug)
    case 'community_join_request_approved':
      return PATH_NAME.community(notification?.community?.slug)
    case 'community_join_request':
      return PATH_NAME.community(notification?.community?.slug)
    case 'community_member_invited':
      return PATH_NAME.community(notification?.community?.slug)
    case 'community_moderator_removed':
      return PATH_NAME.community(notification?.community?.slug)
    case 'community_became_private':
      return PATH_NAME.community(notification?.community?.slug)
    case 'community_became_public':
      return PATH_NAME.community(notification?.community?.slug)
    // case 'community_deleted':
    //   return PATH_NAME.loop(notification?.community?.slug)
    case 'comment_with_user_mentioned':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'comment_with_community_mentioned':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'post_sparked':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'comment_sparked':
      return PATH_NAME.video(notification?.conversation_video?.slug)
    case 'new_community_moderator_joined':
      return PATH_NAME.community(notification?.community?.slug)
    // case 'upload_failed':
    //   return PATH_NAME.loop(notification?.conversation?.group?.slug)
    // case 'bcc_to_cb_added':
    //   return PATH_NAME.loop(notification?.conversation?.group?.slug)
    default:
      return PATH_NAME.loop(notification?.user?.nickname)
  }
}
