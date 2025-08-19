"use client";
import { useEffect, useLayoutEffect, useState } from "react";

import {
  getNewDeviceId,
  useGetDeviceId,
} from "@genuin/components/lib/utils/device-id";
import { setBrandIdInAxiosInstance } from "@genuin/components/react-query/axios-instance";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

import { BaseContext } from "./context";
import { parseBrandColors } from "@genuin/components/lib/utils/brand-color-parser";

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

  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [deviceId, setDeviceId] = useGetDeviceId();

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
        isEmbed,
        parsedBrandColors: parseBrandColors(brandDetails?.brand_colors),
      }}
    >
      {children}
    </BaseContext.Provider>
  );
}
