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
import { BaseEventBusContext, createBaseEventBus } from "./event-bus";
import internalStorageManager from "@genuin/components/lib/utils/internal-storage-manager";
import { FeedContextManager } from "./feed-context-manager";
import { useSafeEmbedContext } from "../embed/context";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";

type BaseContextProviderProps = {
  children: React.ReactNode;
  brandDetails: BrandDetailsConfigType;
  /**
   * Pass this prop to indicate that this is an embed context.
   */
  isEmbed: boolean;
};

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
}: BaseContextProviderProps) {
  useLayoutEffect(() => {
    // Set the brand details in the context.
    if (brandDetails) {
      setBrandIdInAxiosInstance(brandDetails.brand_id);
    }
  }, [brandDetails]);
  const baseEventBus = useMemo(() => createBaseEventBus(), []);
  const baseContextManager = useMemo(
    () => FeedContextManager.getInstance(),
    []
  );
  const embedDetails = useSafeEmbedContext();

  // TODO: move this states to event based states.
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);

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
    baseEventBus.updateContext({ ...baseEventBus.getContext(), muted, volume });
  }, [volume, muted]);

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

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
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
      SDKEventEmitter.emit(SDKEventName.PLAY, {
        isFocused: baseContext.userIsFocused,
        isInView,
        muted: baseContext.muted,
        volume: baseContext.volume,
      });
    };

    const handlePause = () => {
      const baseContext = baseEventBus.getContext();
      const isInView =
        typeof embedDetails !== undefined
          ? (embedDetails?.embedEventBus.getContext().containerInView ?? true)
          : true;

      SDKEventEmitter.emit(SDKEventName.PAUSE, {
        isFocused: baseContext.userIsFocused,
        isInView,
        muted: baseContext.muted,
        volume: baseContext.volume,
      });
    };

    baseContextManager.onPlay(handlePlay);
    baseContextManager.onPause(handlePause);

    return () => {
      baseContextManager.offPlay(handlePlay);
      baseContextManager.offPause(handlePause);
    };
  }, [baseContextManager]);

  useEffect(() => {
    const baseContext = baseEventBus.getContext();

    if (baseContext.firstTimeMutedBypass) {
      baseEventBus.updateContext({
        ...baseContext,
        firstTimeMutedBypass: false,
      });
      return;
    }

    SDKEventEmitter.emit(SDKEventName.MUTE_CHANGE, {
      muted,
      volume: baseEventBus.getContext().volume,
    });
  }, [muted]);

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
      }}
    >
      {children}
    </BaseContext.Provider>
  );
}
