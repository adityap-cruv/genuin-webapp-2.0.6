"use client";
import React, {
  useContext,
  ReactNode,
  ComponentType,
  useCallback,
} from "react";
import { LinkContextValue } from "./type";
import { LinkContext } from "./context";
import { usePathnameFromEmbedRouter } from "./use-pathname";
import { useRouter } from "next/navigation";
import { useSafeEmbedContext } from "../embed/context";
import { useBaseContext } from "../base";

export interface LinkProviderProps {
  children: ReactNode;
  LinkComponent?: ComponentType<any>;
  isNextJS?: boolean;

  /**
   * Optional hook for Next.js compatibility.
   * @returns {string} The current pathname.
   */
  usePathname?: () => string; // Optional, for Next.js compatibility
  useRouter?: typeof useRouter;
}

export function LinkProvider({
  children,
  LinkComponent,
  isNextJS = false,
  usePathname,
  useRouter,
}: LinkProviderProps) {
  const embedDetails = useSafeEmbedContext();
  const { brandDetails } = useBaseContext();
  // if embed then custom routing.
  const isCustomRouting = !!embedDetails;

  /**
   * Creates an external link URL.
   * @param url - The internal URL to convert.
   * @returns The external link URL.
   */
  const createExternalLink = (url: string) => {
    if (url.startsWith("https://") || url.startsWith("https://")) return url;
    const urlObject = new URL(url, brandDetails.white_label_url);
    return urlObject.href;
  };

  const contextValue: LinkContextValue = {
    LinkComponent,
    isNextJS,
    isCustomRouting,
    usePathname: isCustomRouting ? usePathnameFromEmbedRouter : usePathname,
    useRouter,
    createExternalLink,
  };

  return (
    <LinkContext.Provider value={contextValue}>{children}</LinkContext.Provider>
  );
}

export const useLinkContext = () => {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error("useLinkContext must be used within a LinkProvider");
  }
  return context;
};
