'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { getTimeAgo } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'

export function GetNotificationAttributedText({ notification }: { notification: any }): JSX.Element {
  const user = useGenuinOptions().user
  const agoTimeString = <span className="text-body-1-demi text-tertiary">{getTimeAgo(notification?.created_at)}</span>

  switch (notification.type) {
    case 'delete_rt':
      return (
        <div>
          {ProfileTag(notification)}
          deleted the loop
          {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          of
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)}</strong> {agoTimeString}
        </div>
      )
    case 'rt_comment':
      return (
        <div>
          {ProfileTag(notification)}
          commented on your post in
          <strong>
            {' '}
            {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          </strong>{' '}
          {agoTimeString}
        </div>
      )
    case 'rt_comment_to_other_users':
      return (
        <div>
          {ProfileTag(notification)}
          also commented on a post in
          <strong>
            {' '}
            {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          </strong>{' '}
          {agoTimeString}
        </div>
      )
    case 'delete_video_rt_by_owner':
      return (
        <div>
          {ProfileTag(notification)}
          removed your post from
          <strong>
            {' '}
            {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          </strong>{' '}
          {agoTimeString}
        </div>
      )
    case 'reply_rt':
      return (
        <div>
          {ProfileTag(notification)}
          posted to
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)} </strong>
          See it now. {agoTimeString}
        </div>
      )
    case 'rt_participation_request':
      return (
        <div>
          {ProfileTag(notification)}
          requested to join as a collaborator in
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)} </strong>
          Review their request now. {agoTimeString}
        </div>
      )
    case 'invite_rt':
      return (
        <div>
          {ProfileTag(notification)}
          added you as a collaborator of
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)} </strong>
          in
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>
          community. {agoTimeString}
        </div>
      )
    case 'remove_rt':
      return (
        <div>
          {ProfileTag(notification)}
          removed you as a collaborator of
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}</strong>
          If you believe this was a mistake, contact the Loop's Collaborators. {agoTimeString}
        </div>
      )
    case 'reposted_rt_to_rt':
      return (
        <div>
          {ProfileTag(notification)}
          reposted your post from
          <strong> {notification?.repostedConversation?.group?.name} </strong>
          to
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}</strong>
          Check it now. {agoTimeString}
        </div>
      )
    case 'rt_preview_available':
      return (
        <div>
          You successfully created the loop
          <strong> {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)} </strong>
          Invite people to join! {agoTimeString}
        </div>
      )
    case 'community_join_request_approved':
      return (
        <div>
          Welcome to
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>
          community, {ProfileTag(notification)}! {agoTimeString}
        </div>
      )
    case 'community_join_request':
      return (
        <div>
          {ProfileTag(notification)}
          requested to join
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)}</strong>.{' '}
          {agoTimeString}
        </div>
      )
    case 'community_member_invited':
      return (
        <div>
          {ProfileTag(notification)}
          added you in
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)}</strong>.{' '}
          {agoTimeString}
        </div>
      )
    case 'community_moderator_removed':
      return (
        <div>
          {ProfileTag(notification)}
          removed you as moderator from
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>
          You can still post and interact with the community. {agoTimeString}
        </div>
      )
    case 'community_became_private':
      return (
        <div>
          Update: {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          is now private community. {agoTimeString}
        </div>
      )
    case 'community_became_public':
      return (
        <div>
          Update: {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          is now public community. {agoTimeString}
        </div>
      )
    case 'community_deleted':
      return (
        <div>
          Important Update: {CommunityTag(notification?.community?.slug, notification?.community?.name)}
          community has been deleted. {agoTimeString}
        </div>
      )
    case 'comment_with_user_mentioned':
      return (
        <div>
          <strong> @{notification?.user?.nickname} </strong>
          tagged you in a comment on
          {user?.id === notification?.chat?.owner?.userId ? (
            <>" your post."</>
          ) : (
            <>
              <strong> @{notification?.chat?.owner?.username} </strong>'s post.
            </>
          )}{' '}
          {agoTimeString}
        </div>
      )
    case 'comment_with_community_mentioned':
      return (
        <div>
          <strong> @{notification?.user?.nickname} </strong>
          mentioned
          <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>
          in a comment on
          {user?.id === notification?.chat?.owner?.userId ? (
            <>" your post."</>
          ) : (
            <>
              <strong> @{notification?.chat?.owner?.username} </strong>'s post.
            </>
          )}{' '}
          {agoTimeString}
        </div>
      )
    case 'post_sparked':
      return (
        <div>
          {ProfileTag(notification)}
          sparked your post in
          <strong>
            {' '}
            {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          </strong>. {agoTimeString}
        </div>
      )
    case 'comment_sparked':
      return (
        <div>
          {ProfileTag(notification)}
          sparked your comment in
          <strong>
            {' '}
            {LoopTag(notification?.conversation?.group?.slug, notification?.conversation?.group?.name)}
          </strong>. {agoTimeString}
        </div>
      )
    case 'new_community_moderator_joined': {
      const moderatorsCount = notification?.moderators?.length || 0
      let moderatorsText
      if (moderatorsCount === 1) {
        moderatorsText = (
          <>
            <strong> @{notification?.moderators?.[0]?.nickname} </strong> joined as a moderator of{' '}
            <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>.
          </>
        )
      } else if (moderatorsCount === 2) {
        moderatorsText = (
          <div>
            <strong> @{notification?.moderators?.[0]?.nickname} </strong> and
            <strong> @{notification?.moderators?.[1]?.nickname} </strong> joined as moderators of
            <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>.
          </div>
        )
      } else if (moderatorsCount > 2) {
        moderatorsText = (
          <div>
            <strong> @{notification?.moderators?.[0]?.nickname} </strong>,
            <strong> @{notification?.moderators?.[1]?.nickname} </strong> and
            {moderatorsCount - 2} others joined as moderators of
            <strong> {CommunityTag(notification?.community?.slug, notification?.community?.name)} </strong>.
          </div>
        )
      }
      return (
        <div>
          {moderatorsText} {agoTimeString}
        </div>
      )
    }
    // case "upload_failed":
    //     const failedTime = CommonFunctions.setConversationTime(parseFloat(notification?.failedVideo?.messageAt ?? "0.0") || 0.0);
    //     return (
    //         <div>
    //             Post failed to upload. Please try again!
    //             {failedTime}
    //         </div>
    //     );
    case 'bcc_to_cb_added':
      return (
        <div>
          <Link
            href={{
              pathname: PATH_NAME.brand(notification?.user?.brand?.brand_slug),
            }}>
            <strong> {notification?.brand?.name} </strong>
          </Link>
          added you as a community builder. Create your community now. {agoTimeString}
        </div>
      )
    default:
      return <div>Please update the app to view this notification.</div>
  }
}

function ProfileTag(notification: any) {
  if (!notification?.user?.nickname) return

  return (
    <>
      <Link
        href={{
          pathname: notification?.user?.brand
            ? PATH_NAME.brand(notification?.user?.brand?.brand_slug)
            : PATH_NAME.profile(notification?.user?.nickname),
        }}>
        <strong> @{notification?.user?.nickname} </strong>
      </Link>
    </>
  )
}

function CommunityTag(slug: string, name: string) {
  return (
    <>
      <Link
        href={{
          pathname: PATH_NAME.community(slug),
        }}>
        <span>{name}</span>
      </Link>
    </>
  )
}

function LoopTag(slug: string, name: string) {
  return (
    <>
      <Link
        href={{
          pathname: PATH_NAME.loop(slug),
        }}>
        <span>{name}</span>
      </Link>
    </>
  )
}
