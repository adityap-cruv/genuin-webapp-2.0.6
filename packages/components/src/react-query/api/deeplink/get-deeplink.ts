import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { generateDeepLink } from "@genuin/components/react-query/api/deeplink";
import { 
  CommentActionData, 
  JoinCollaboratorActionData, 
  JoinCommunityActionData, 
  ReportActionData, 
  RepostActionData, 
  SparkActionData, 
  SubscribeActionData,
  DeepLinkActionType,
  DeepLinkActionData
} from "./types";
import { getLoopAndCommunityShareString, getSearchParamsFromWindow, toTitleCase } from "@genuin/components/lib/utils";

// Types
type DeepLinkActionRegistry = {
  [K in DeepLinkActionType]: DeepLinkActionData;
};

type ActionType = keyof DeepLinkActionRegistry;

interface DeepLinkOptions {
  action?: string;
  contentType?: string;
  description?: string;
  title?: string;
  pathName?: string;
  community?: string;
  loop?: string;
  searchParams?: Record<string, any>;
}

interface ActionBuilder<T extends ActionType> {
  action: string;
  contentType?: string;
  buildOptions: (data: DeepLinkActionRegistry[T]) => DeepLinkOptions;
}

// Action builders with reduced duplication
const ACTION_BUILDERS: Record<ActionType, ActionBuilder<any>> = {
  subscribe: {
    action: 'subscribe',
    contentType: 'loop',
    buildOptions: (data: SubscribeActionData) => ({
      contentType: 'loop',
      description: data.ldDescription,
      title: data.groupName,
      community: getLoopAndCommunityShareString(data.shareUrl).communityShareString ?? '',
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  join_as_collaborator: {
    action: '',
    contentType: 'loop',
    buildOptions: (data: JoinCollaboratorActionData) => ({
      contentType: 'loop',
      description: data.ldDescription,
      title: data.groupName,
      community: getLoopAndCommunityShareString(data.shareUrl).communityShareString ?? '',
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  join_community: {
    action: 'join',
    contentType: 'community',
    buildOptions: (data: JoinCommunityActionData) => ({
      contentType: 'community',
      description: `Find your people. Find what you love. | Join ${data.communityName} to talk about it`,
      title: `join ${data.communityName}`,
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
      pathName: `/community/${data.slug}`,
    }),
  },

  comment: {
    action: 'comment',
    contentType: 'video',
    buildOptions: (data: CommentActionData) => ({
      contentType: 'video',
      pathName: buildPageUrl({ type: 'video', slug: data.videoSlug }),
      community: data.communityId,
      loop: data.loopId,
      title: `comment on ${data.videoSlug} video`,
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  repost: {
    action: 'repost',
    contentType: 'video',
    buildOptions: (data: RepostActionData) => ({
      contentType: 'video',
      pathName: buildPageUrl({ type: 'video', slug: data.videoSlug }),
      community: getLoopAndCommunityShareString(data.shareUrl).communityShareString ?? '',
      loop: getLoopAndCommunityShareString(data.shareUrl).loopShareString ?? '',
      title: `repost ${data.videoSlug} video`,
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  spark: {
    action: 'spark',
    contentType: 'video',
    buildOptions: (data: SparkActionData) => ({
      contentType: 'video',
      pathName: buildPageUrl({ type: 'video', slug: data.videoSlug }),
      community: getLoopAndCommunityShareString(data.shareUrl).communityShareString ?? '',
      loop: getLoopAndCommunityShareString(data.shareUrl).loopShareString ?? '',
      title: `${toTitleCase(data.reactionTitle)} ${data.reactionSuffix} the ${data.videoSlug} video`,
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  report: {
    action: 'report',
    contentType: 'video',
    buildOptions: (data: ReportActionData) => ({
      contentType: 'video',
      pathName: buildPageUrl({ type: 'video', slug: data.videoSlug }),
      community: getLoopAndCommunityShareString(data.shareUrl).communityShareString ?? '',
      loop: getLoopAndCommunityShareString(data.shareUrl).loopShareString ?? '',
      title: `report ${data.videoSlug} video`,
      searchParams: data.searchParams ?? getSearchParamsFromWindow(),
    }),
  },

  get_app: {
    action: '/',
    buildOptions: () => ({}),
  },
} as const;

async function createDeepLink<T extends ActionType>(
  actionType: T,
  data: DeepLinkActionRegistry[T]
): Promise<string> {
  const builder = ACTION_BUILDERS[actionType];
  
  if (!builder) {
    throw new Error(`Unsupported action type: ${actionType}`);
  }
  
  const options = builder.buildOptions(data);
  
  // Build parameters directly from options
  const params = {
    contentType: options.contentType ?? "",
    description: options.description ?? "",
    title: options.title ?? "",
    previewImage: null,
    fromUserName: null,
    pathName: options.pathName ?? window.location.pathname,
    utmCampaign: "share",
    utmMedium: "web",
    utmSource: window.location.hostname,
    community: options.community ?? "",
    loop: options.loop ?? "",
    searchParams: options.searchParams ?? {},
    action: builder.action,
  };

  try {
    return await generateDeepLink(params);
  } catch (error) {
    // window.open(process.env.NEXT_PUBLIC_HOST_URL);
    throw new Error(`Failed to generate deep link for action: ${builder.action}`);
  }
}

export const deepLinkActions = {
  subscribe: (data: SubscribeActionData) => createDeepLink('subscribe', data),
  joinAsCollaborator: (data: JoinCollaboratorActionData) => createDeepLink('join_as_collaborator', data),
  joinCommunity: (data: JoinCommunityActionData) => createDeepLink('join_community', data),
  comment: (data: CommentActionData) => createDeepLink('comment', data),
  repost: (data: RepostActionData) => createDeepLink('repost', data),
  spark: (data: SparkActionData) => createDeepLink('spark', data),
  report: (data: ReportActionData) => createDeepLink('report', data),
  getApp: () => createDeepLink('get_app', {}),
} as const;

// Usage examples:
/*
const sparkLink = await deepLinkActions.spark({
  videoSlug: 'my-video',
  shareUrl: 'https://example.com/share',
  reactionSuffix: 'loved',
  reactionTitle: 'heart',
  searchParams: { utm_source: 'app' }
});
*/