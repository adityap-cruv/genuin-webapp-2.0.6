import { EventName } from "./context";
import { EventNameType } from "./types";

type AnalyticsEventData = {
  canFire: boolean;
  allowed_keys: string[];
  description: string;
};

type EmitAnalyticsDataType = {
  [K in EventNameType]: AnalyticsEventData;
};

const commonAllowedKeys: string[] = [];

export const EmitAnalyticsData: EmitAnalyticsDataType = {
  [EventName.COMMENT_DELETE]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.COMMENT_REPORT]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.COMMENT_SPARK]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.COMMENT_UNSPARK]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.COMMUNITY_SHARED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_MUTED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.SWIPE_UP_GESTURE]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_UNMUTED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_COMPLETED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_FIRST_QUARTILE]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_IMPRESSION]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_INVIEW]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_MAXIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_MINIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_PAUSED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_SHARED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_STARTED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_THIRD_QUARTILE]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_UNSPARK]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_WATCHED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.EMBED_VIEWED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.DOWNLOAD_APP_VIEWED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.EMBED_INITIALIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_SPARK]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.GET_APP_BUTTON_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.BECOME_CREATOR]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.CHECK_RECENT_SEARCH]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_MIDPOINT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_MARK_COMPLETE]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_PLAY]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PAGE_VIEW]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PLACEMENT_INITIALIZED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PLACEMENT_VIEWED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.SECTION_CHANGES]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.EMBED_MAXIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.EMBED_MINIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PLACEMENT_MAXIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PLACEMENT_MINIMIZED]: {
    canFire: true,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.EMBED_CTA_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.FLOATING_EMBED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_REPOST]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.PLAY_PAUSE_GESTURE]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_COMMENT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_COMMENTED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.VIDEO_REPORT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.LINKOUTS_VIEWED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.LINKOUTS_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.LINKOUTS_CTA_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.KS_USERNAME_SET]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.SUBSCRIPTION_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.LOG_OUT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.SETTINGS_CONTACT_US_FORM_SENT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.NOTIFICATION_SETTINGS_MODIFIED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.KEYWORD_SEARCHED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.CLEAR_RECENT_SEARCH]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.KEYWORD_SEARCH_CANCEL]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.DOWNLOAD_APP_CLICKED]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
  [EventName.GET_APP_LINK_SENT]: {
    canFire: false,
    allowed_keys: [...commonAllowedKeys],
    description: "",
  },
};
