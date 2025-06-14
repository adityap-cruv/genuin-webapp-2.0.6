"use client";
import { getUrlForReaction } from "@genuin/ui/utils";
import { createContext, useContext } from "react";
import type { SizeBoxType } from "@genuin/components/types/base";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

const DEFAULT_WEB_CONFIGS: BrandDetailsConfigType["web_configs"] = {
  video_autoplay: {
    type: 1,
    auto_play_after: 5,
  },
  feed_video_play: {
    type: 1,
    repeat_video: 0,
    swipe_after: 0,
  },
  linkout_delay: {
    type: 1,
    appear_after: 10,
  },
  get_app_popup: {
    enable: true,
    popup_after: 5,
  },
  login_signup_popup: {
    enable: true,
    popup_after: 5,
  },
  interest_selection_popup: {
    enable: true,
    popup_after: 5,
  },
  username_popup: {
    enable: true,
    popup_after: 5,
  },
  complete_profile_popup: {
    enable: true,
    popup_after: 5,
  },
  idle_time_interruption: {
    enable: true,
    popup_after: 60,
  },
  video_aspect_ratio: "9:16",
  tap_behavior: 3,
  gesture_guidance: true,
  playback_speed_enabled: true,
  is_start_with_sound: false,
};

export const DEFAULT_BRAND_DETAILS = {
  reactions: {
    type: "default",
    title: "react",
    suffix: "to",
    keys: {
      comment_selected: {
        svg: getUrlForReaction("spark", true, true),
        png: "",
      },
      comment_unselected: {
        svg: getUrlForReaction("spark", false, true),
        png: "",
      },
      feed_selected: {
        svg: getUrlForReaction("spark", true, false),
        png: "",
      },
      feed_unselected: {
        svg: getUrlForReaction("spark", false, false),
        png: "",
      },
    },
  },
  show_become_creator: true,
  web_configs: DEFAULT_WEB_CONFIGS,
  web_cta: "both",
};

export type BaseContextType = {
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  brandDetails: BrandDetailsConfigType;
  feedVideoSizeBox: SizeBoxType;
};

export const BaseContext = createContext<BaseContextType>({
  muted: true,
  setMuted: () => {},
  volume: 100,
  setVolume: () => {},
  // default brand details configuration.
  brandDetails: DEFAULT_BRAND_DETAILS as any,
  feedVideoSizeBox: {
    height: 0,
    width: 0,
  },
});

export function useBaseContext() {
  const context = useContext(BaseContext);
  if (!context) {
    throw new Error("useBaseContext must be used within a BaseContextProvider");
  }
  return context;
}
