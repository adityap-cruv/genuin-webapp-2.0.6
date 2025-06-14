type BaseSearchParams = Record<string, any>;

export type DeepLinkActionType = 
  | 'subscribe'
  | 'join_as_collaborator'
  | 'join_community'
  | 'comment'
  | 'repost'
  | 'spark'
  | 'report'
  | 'get_app';

export interface SubscribeActionData {
  ldDescription: string;
  groupName: string;
  shareUrl: string;
  searchParams?: BaseSearchParams;
}

export interface JoinCollaboratorActionData {
  ldDescription: string;
  groupName: string;
  shareUrl: string;
  searchParams?: BaseSearchParams;
}

export interface JoinCommunityActionData {
  communityName: string;
  slug: string;
  searchParams?: BaseSearchParams;
}

export interface CommentActionData {
  videoSlug: string;
  communityId: string;
  loopId: string;
  searchParams?: BaseSearchParams;
}

export interface RepostActionData {
  videoSlug: string;
  shareUrl: string;
  searchParams?: BaseSearchParams;
}

export interface SparkActionData {
  videoSlug: string;
  shareUrl: string;
  reactionSuffix: string;
  reactionTitle: string;
  searchParams?: BaseSearchParams;
}

export interface ReportActionData {
  videoSlug: string;
  shareUrl: string;
  searchParams?: BaseSearchParams;
}

export interface GetAppActionData {
  // No additional data needed
}

export type DeepLinkActionData = {
  [K in DeepLinkActionType]: K extends 'subscribe' ? SubscribeActionData
    : K extends 'join_as_collaborator' ? JoinCollaboratorActionData
    : K extends 'join_community' ? JoinCommunityActionData
    : K extends 'comment' ? CommentActionData
    : K extends 'repost' ? RepostActionData
    : K extends 'spark' ? SparkActionData
    : K extends 'report' ? ReportActionData
    : K extends 'get_app' ? GetAppActionData
    : never;
}[DeepLinkActionType];

export type DeepLinkPayloadUnion = 
  | { type: 'subscribe'; payload: SubscribeActionData }
  | { type: 'join_as_collaborator'; payload: JoinCollaboratorActionData }
  | { type: 'join_community'; payload: JoinCommunityActionData }
  | { type: 'comment'; payload: CommentActionData }
  | { type: 'repost'; payload: RepostActionData }
  | { type: 'spark'; payload: SparkActionData }
  | { type: 'report'; payload: ReportActionData }
  | { type: 'get_app'; payload: GetAppActionData };