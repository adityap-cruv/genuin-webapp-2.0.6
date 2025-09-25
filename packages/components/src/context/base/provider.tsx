"use client";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

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
      console.log("window focused");
      baseEventBus.emit("userFocusChange", undefined, (currentContext) => ({
        ...currentContext,
        userIsFocused: true,
      }));
    };

    const handleWindowBlur = () => {
      console.log("window blurred");
      baseEventBus.emit("userFocusChange", undefined, (currentContext) => ({
        ...currentContext,
        userIsFocused: false,
      }));
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [baseEventBus]);

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
      }}
    >
      {children}
    </BaseContext.Provider>
  );
}
