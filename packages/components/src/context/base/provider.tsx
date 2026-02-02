"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  DEVICE_ID_KEY_FOR_LOCAL_STORAGE,
  getNewDeviceId,
  useGetDeviceId,
} from "@genuin/components/lib/utils/device-id";
import { setBrandIdInAxiosInstance } from "@genuin/components/react-query/axios-instance";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";
import type { PlaybackSpeedType } from "@genuin/components/molecules/feed-player/context/types";

import { BaseContext } from "./context";
import { parseBrandColors } from "@genuin/components/lib/utils/brand-color-parser";
import { createBaseEventBus } from "./event-bus";
import internalStorageManager from "@genuin/components/lib/utils/internal-storage-manager";
import { FeedContextManager } from "./feed-context-manager";
import { useSafeEmbedContext } from "../embed/context";
import {
  SDKEventEmitter,
  SDKEventName,
  SDKEventPayloadMap,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";

type BaseContextProviderProps = {
  children: React.ReactNode;
  brandDetails: BrandDetailsConfigType;
  /**
   * Pass this prop to indicate that this is an embed context.
   */
  isEmbed: boolean;
  /**
   * Theme of the application - 'dark' or 'light'
   */
  theme?: "dark" | "light";
  useShadowDOM : boolean;
};

type AutoplayParams = {
  isEmbed: boolean;
  embedData?: any;
  customization?: any;
  brandDetails?: BrandDetailsConfigType;
  embedDetails?: any;
};

/**
 * Determines whether autoplay should be enabled based on the context (embed or non-embed).
 *
 * For embed context:
 * - Checks placement-specific autoplay setting if placement_id exists
 * - Falls back to customization autoplay setting for standard embeds
 *
 * For non-embed context:
 * - Uses brand config's video_autoplay type (type 1 = "always" autoplay)
 *
 * @param params - Object containing isEmbed, embedData, customization, and brandDetails
 * @returns boolean indicating whether autoplay should be enabled
 */
function getShouldAutoplay(params: AutoplayParams): boolean {
  const { isEmbed, embedDetails, embedData, customization, brandDetails } =
    params;

  const isIheart = embedDetails?.brandLayoutType === "iheart";
  const isPolaris = embedDetails?.embedData.websiteType === "polaris";

  if (isIheart && isPolaris) {
    return true;
  }

  // For embed context, check embed-specific autoplay settings
  if (isEmbed && (embedData || customization)) {
    // Check if it's a placement or standard embed
    if (embedData?.placement_id) {
      return embedData?.media_play?.enable_autoplay ?? false;
    } else {
      return customization?.autoplay ?? false;
    }
  }

  // For non-embed context, use brand config
  const autoplayType = brandDetails?.web_configs?.video_autoplay?.type ?? 1;
  return autoplayType === 1; // type 1 = "always" autoplay
}

/**
 * BaseContextProvider is a context provider that provides the base context to its children.
 * It is used to manage the base state of the application.
 * @param {BaseContextProviderProps} props - The props for the BaseContextProvider component.
 * @returns The BaseContextProvider component.
 */
export function BaseContextProvider({
  children,
  brandDetails,
  isEmbed = false,
  useShadowDOM,
  theme,
}: BaseContextProviderProps) {
  useLayoutEffect(() => {
    // Set the brand details in the context.
    if (brandDetails) {
      setBrandIdInAxiosInstance(brandDetails.brand_id);
    }
  }, [brandDetails]);

  const embedDetails = useSafeEmbedContext();

  const baseEventBus = useMemo(() => {
    const shouldAutoplay = getShouldAutoplay({
      isEmbed,
      embedData: embedDetails?.embedData,
      customization: embedDetails?.customization,
      brandDetails,
      embedDetails,
    });
    return createBaseEventBus(shouldAutoplay);
  }, [isEmbed, embedDetails, brandDetails]);

  const baseContextManager = useMemo(
    () => FeedContextManager.getInstance(),
    []
  );

  // TODO: move this states to event based states.
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [currentTheme, setCurrentTheme] = useState<
    "dark" | "light" | undefined
  >(theme);

  // Detect if running inside an iframe (safe for SSR)
  const isInIframe = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.self !== window.top;
    } catch {
      // Accessing window.top can throw due to cross-origin
      return true;
    }
  }, []);
  const [deviceId, setDeviceId] = useGetDeviceId();
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeedType>({
    speed: 1.0,
    isSpeedFromGesture: false,
  });

  // update volume and muted details in baseEventBus.
  useEffect(() => {
    baseEventBus.updateContext((currentContext) => ({
      ...currentContext,
      muted,
      volume,
    }));
  }, [volume, muted]);

  // This effect uses a cleanup function, which doesn't run on initial mount.
  // The event will be ignored on first render and only emitted from the second time onwards when muted changes.
  useEffect(() => {
    return () => {
      SDKEventEmitter.emit(
        SDKEventName.MUTE_CHANGE,
        {
          muted: !muted,
          volume: baseEventBus.getContext().volume,
        },
        { debounceTime: 300 }
      );
    };
  }, [muted]);

  useEffect(() => {
    // If deviceId is not available, get a new one.
    if (!deviceId) {
      getNewDeviceId((deviceId) => {
        if (isInIframe) {
          internalStorageManager.setItem(
            DEVICE_ID_KEY_FOR_LOCAL_STORAGE,
            deviceId
          );
        } else {
          setDeviceId(deviceId);
        }
      });
    }
  }, [deviceId, isInIframe]);

  // Track window focus state and update userIsFocused in embedEventBus
  useEffect(() => {
    const handleWindowFocus = () => {
      baseEventBus.emit("userFocusChange", undefined, (currentContext) => ({
        ...currentContext,
        userIsFocused: true,
      }));
      baseContextManager.setPlayPauseTracker({ isFocused: true });
    };

    const handleWindowBlur = () => {
      baseEventBus.emit("userFocusChange", undefined, (currentContext) => ({
        ...currentContext,
        userIsFocused: false,
      }));
      baseContextManager.setPlayPauseTracker({ isFocused: false });
    };

    const handlePlayFromOutside = () => {
      baseEventBus.emit(
        "globalPlayingStateChange",
        undefined,
        (currentContext) => ({ ...currentContext, globalPlayingState: true })
      );
    };

    const handlePauseFromOutside = () => {
      baseEventBus.emit(
        "globalPlayingStateChange",
        undefined,
        (currentContext) => ({ ...currentContext, globalPlayingState: false })
      );
      baseContextManager.setPlayPauseTracker({ isPlaying: false });
    };

    const handleMuteFromOutside = () => {
      setMuted(true);
    };

    const handleUnmuteFromOutside = () => {
      setMuted(false);
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);
    SDKEventEmitter.on(SDKListenerEventName.PLAYER_PLAY, handlePlayFromOutside);
    SDKEventEmitter.on(
      SDKListenerEventName.PLAYER_PAUSE,
      handlePauseFromOutside
    );
    SDKEventEmitter.on(SDKListenerEventName.PLAYER_MUTE, handleMuteFromOutside);
    SDKEventEmitter.on(
      SDKListenerEventName.PLAYER_UNMUTE,
      handleUnmuteFromOutside
    );

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);

      SDKEventEmitter.off(
        SDKListenerEventName.PLAYER_PLAY,
        handlePlayFromOutside
      );
      SDKEventEmitter.off(
        SDKListenerEventName.PLAYER_PAUSE,
        handlePauseFromOutside
      );
      SDKEventEmitter.off(
        SDKListenerEventName.PLAYER_MUTE,
        handleMuteFromOutside
      );
      SDKEventEmitter.off(
        SDKListenerEventName.PLAYER_UNMUTE,
        handleUnmuteFromOutside
      );
    };
  }, [baseEventBus]);

  useEffect(() => {
    if (!embedDetails) return;

    const handleInViewChange = (_: any, context: any) => {
      baseContextManager.setPlayPauseTracker({
        isInView: context.containerInView,
      });
    };

    embedDetails.embedEventBus.on("containerInViewChange", handleInViewChange);

    return () => {
      embedDetails.embedEventBus.off(
        "containerInViewChange",
        handleInViewChange
      );
    };
  }, [embedDetails?.embedEventBus, baseContextManager]);

  useEffect(() => {
    const handlePlay = () => {
      const baseContext = baseEventBus.getContext();
      const isInView =
        typeof embedDetails !== undefined
          ? (embedDetails?.embedEventBus.getContext().containerInView ?? true)
          : true;
      SDKEventEmitter.emit(
        SDKEventName.PLAY,
        {
          isFocused: baseContext.userIsFocused,
          isInView,
          muted: baseContext.muted,
          volume: baseContext.volume,
          autoplay: embedDetails?.embedData.media_play?.enable_autoplay,
        },
        { debounceTime: 300 }
      );
    };

    const handlePause = () => {
      const baseContext = baseEventBus.getContext();
      const isInView =
        typeof embedDetails !== undefined
          ? (embedDetails?.embedEventBus.getContext().containerInView ?? true)
          : true;

      SDKEventEmitter.emit(
        SDKEventName.PAUSE,
        {
          isFocused: baseContext.userIsFocused,
          isInView,
          muted: baseContext.muted,
          volume: baseContext.volume,
        },
        { debounceTime: 300 }
      );
    };

    baseContextManager.onPlay(handlePlay);
    baseContextManager.onPause(handlePause);

    return () => {
      baseContextManager.offPlay(handlePlay);
      baseContextManager.offPause(handlePause);
      FeedContextManager.destroy();
      SDKEventEmitter.cancelAllDebounce();
    };
  }, [baseContextManager, baseEventBus, embedDetails]);

  useEffect(() => {
    function handleThemeChange({
      payload,
    }: {
      payload: "dark" | "light" | undefined;
    }) {
      if (currentTheme !== payload && payload !== undefined)
        setCurrentTheme(payload);
    }

    SDKEventEmitter.on(SDKListenerEventName.THEME_CHANGE, handleThemeChange);
    return () => {
      SDKEventEmitter.off(SDKListenerEventName.THEME_CHANGE, handleThemeChange);
    };
  }, [currentTheme]);

  return (
    <BaseContext.Provider
      value={{
        muted,
        setMuted,
        volume,
        setVolume,
        brandDetails,
        isEmbed,
        parsedBrandColors: parseBrandColors(brandDetails?.brand_colors),
        playbackSpeed,
        setPlaybackSpeed,
        baseEventBus,
        isInIframe,
        baseContextManager,
        theme: currentTheme,
        setTheme: setCurrentTheme,
        useShadowDOM
      }}
    >
      {children}
    </BaseContext.Provider>
  );
}
