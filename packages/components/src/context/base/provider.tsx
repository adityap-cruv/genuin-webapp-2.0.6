"use client";
import { useEffect, useLayoutEffect, useState } from "react";

import { useFeedVideoSizeBox } from "@genuin/components/hooks/use-feed-video-size-box";
import {
  getNewDeviceId,
  useGetDeviceId,
} from "@genuin/components/lib/utils/device-id";
import { setBrandIdInAxiosInstance } from "@genuin/components/react-query/axios-instance";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

import { BaseContext } from "./context";
// import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";

type BaseContextProviderProps = {
  children: React.ReactNode;
  brandDetails: BrandDetailsConfigType;
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
}: BaseContextProviderProps) {
  // //TODO:  Figure out a way to run this only once. Not in useEffect.
  // if (brandDetails) {
  //   setBrandIdInAxiosInstance(2922);
  // }

  useLayoutEffect(() => {
    // Set the brand details in the context.
    if (brandDetails) {
      setBrandIdInAxiosInstance(brandDetails.brand_id);
    }
  }, [brandDetails]);

  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [deviceId, setDeviceId] = useGetDeviceId();

  // todo: handle in case of embed here.
  const feedVideoSizeBox = useFeedVideoSizeBox();

  useEffect(() => {
    // If deviceId is not available, get a new one.
    if (!deviceId) {
      getNewDeviceId((deviceId) => {
        setDeviceId(deviceId);
      });
    }
  }, [deviceId]);

  return (
    <BaseContext.Provider
      value={{
        muted,
        setMuted,
        volume,
        setVolume,
        brandDetails,
        feedVideoSizeBox,
      }}
    >
      {children}
    </BaseContext.Provider>
  );
}
