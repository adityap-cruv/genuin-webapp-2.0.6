"use client";
import React, { useContext, ReactNode, ComponentType } from "react";
import { LinkContextValue } from "./type";
import { LinkContext } from "./context";
import { usePathnameFromEmbedRouter } from "./use-pathname";
import { useRouter } from "next/navigation";
import { useSafeEmbedContext } from "../embed/context";

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
  // if embed style is standard_wall, use the custom usePathname hook
  const isCustomRouting = embedDetails?.embedData?.style === "standard_wall";
  const contextValue: LinkContextValue = {
    LinkComponent,
    isNextJS,
    isCustomRouting,
    usePathname: isCustomRouting ? usePathnameFromEmbedRouter : usePathname,
    useRouter,
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
