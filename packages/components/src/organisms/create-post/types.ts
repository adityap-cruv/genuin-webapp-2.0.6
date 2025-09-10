export type PostData = {
  video: {
    id: string;
    createdAt: number;
    commentCount?: number;
    shareUrl?: string;
    attachedLink?: string;
    isSparked?: boolean;
    sparkCount?: number;
    viewCount?: number;
    source: string;
    thumbnail: string;
    thumbnailM: string;
    description?: string;
    descriptionText: string;
    descriptionData: string;
    slug: string;
    location: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    } | null;
    linkoutId?: number;
    clickableUrl?: string;
    linkouts: [
      {
        cta_link: string;
        cta_text: string;
        links: [
          {
            image: string;
            link: string;
            position: number;
            title: string;
          },
        ];
      },
    ];
    isPinned: boolean;
    thumbnailSprite?: string;
    descriptionRich?: string;
  };
  group: {
    id: string;
    slug: string;
    description: string;
    shareUrl: string;
    name: string;
    isSubscribed: boolean;
    role: string;
    isPrivate: boolean;
    actions: {
      action_id: number;
      access_type_id: number;
    }[];
  };
  community: {
    id: string;
    shareUrl?: string;
    slug?: string;
    handle: string;
    isPrivate: boolean;
    userRole: string;
    type: number;
    name: string;
    profileImage: string;
    profileImageL: string;
    profileImageM: string;
    profileImageS: string;
    membersCount: number;
    groupsCount: number;
    postsCount: number;
    brand: {
      id: number;
      name: string;
      slug: string;
      webLogo: string;
      userLogo: number;
      handle: string;
    };
  };
  owner: {
    profileImage: string;
    isAvatar: boolean;
    userName: string;
    name: string;
    brand: {
      id: number;
      slug: string;
      userLogo: number;
    };
  };
};

export type StepPost = "UPLOAD" | "POST" | "EDIT_THUMBNAIL" | "CLIP_VIDEO";

export type FileDetails = {
  aspectRatio?: "9:16";
  resolution?: "1080x1920";
  videoDuration?: number;
  videoThumbnail?: string;
  file?: File;
};

export type UpdatePostDataProps = {
  duration: string;
  size: string;
  video_name: string;
  aspect_ratio: string; // 9:16
  resolution: string; // Width x Height
  meta_data: {
    contains_external_videos: boolean;
    media_type: "video";
  };
};

export interface TrimHandler {
  handleTrim: () => void;
}

export interface EditTrimVideoProps {
  postData: PostData;
  showTrimVideoBtn: boolean;
  showEditCoverBtn: boolean;
  onTrimmerReady: (isReady: boolean) => void;
  playerOverlayAction: (action: "clip" | "cover", url?: string) => void;
  updatePostData: (data: UpdatePostDataProps) => void;
  setVideoTrimProcessing: (isProcessing: boolean) => void;
}
