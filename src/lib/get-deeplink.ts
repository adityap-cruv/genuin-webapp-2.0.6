import { generateDeepLink, getLoopAndCommunityShareString } from './utils'
import { PATH_NAME } from './utils/constants/path'

type GenerateDeepLinkOptions = {
  action?: string
  contentType?: string
  description?: string
  title?: string
  pathName?: string
  community?: string
  loop?: string
  searchParams?: Record<string, any>
}

async function getDeepLink(action: string, options: GenerateDeepLinkOptions): Promise<string> {
  const commonParams = {
    contentType: options.contentType ?? '',
    description: options.description ?? '',
    title: options.title ?? '',
    previewImage: null,
    fromUserName: null,
    pathName: options.pathName ?? window.location.pathname,
    utmCampaign: 'share',
    utmMedium: 'web',
    utmSource: window.location.hostname,
    community: options.community ?? '',
    loop: options.loop ?? '',
    searchParams: options.searchParams ?? {},
  }

  return await generateDeepLink({ ...commonParams, action }).catch(() => {
    window.open(process.env.NEXT_PUBLIC_HOST_URL)
    throw new Error('Failed to generate deep link')
  })
}

// subscribe action
export async function subscribeDeepLink({
  ldDescription,
  loopDetails,
  searchParams,
}: {
  ldDescription: string
  loopDetails: any
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('subscribe', {
    contentType: 'loop',
    description: ldDescription,
    title: loopDetails.group.group_name,
    community: getLoopAndCommunityShareString(loopDetails.share_url).communityShareString ?? '',
    searchParams,
  })
}

// join_as_collaborator action
export async function joinAsCollaboratorDeepLink({
  ldDescription,
  loopDetails,
  searchParams,
}: {
  ldDescription: string
  loopDetails: any
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('', {
    contentType: 'loop',
    description: ldDescription,
    title: loopDetails.group.group_name,
    community: getLoopAndCommunityShareString(loopDetails.share_url).communityShareString ?? '',
    searchParams,
  })
}

// join_community action
export async function joinCommunityDeepLink({
  communityName,
  searchParams,
}: {
  communityName: string
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('join', {
    contentType: 'community',
    description: `Find your people. Find what you love. | Join ${communityName} to talk about it`,
    title: `join ${communityName}`,
    searchParams,
  })
}

// comment action
export async function commentDeepLink({
  videoSlug,
  communityId,
  loopId,
  searchParams,
}: {
  videoSlug: string
  communityId: string
  loopId: string
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('comment', {
    contentType: 'video',
    pathName: PATH_NAME.video(videoSlug),
    community: communityId,
    loop: loopId,
    searchParams,
  })
}

// repost action
export async function repostDeepLink({
  videoSlug,
  shareUrl,
  searchParams,
}: {
  videoSlug: string
  shareUrl: string
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('repost', {
    contentType: 'video',
    pathName: PATH_NAME.video(videoSlug),
    community: getLoopAndCommunityShareString(shareUrl).communityShareString ?? '',
    loop: getLoopAndCommunityShareString(shareUrl).loopShareString ?? '',
    searchParams,
  })
}

// spark action
export async function sparkDeepLink({
  videoSlug,
  shareUrl,
  searchParams,
}: {
  videoSlug: string
  shareUrl: string
  searchParams: Record<string, any>
}): Promise<string> {
  return await getDeepLink('spark', {
    contentType: 'video',
    pathName: PATH_NAME.video(videoSlug),
    community: getLoopAndCommunityShareString(shareUrl).communityShareString ?? '',
    loop: getLoopAndCommunityShareString(shareUrl).loopShareString ?? '',
    searchParams,
  })
}
