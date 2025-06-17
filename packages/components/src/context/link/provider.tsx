"use client";
import React, { useContext, ReactNode, ComponentType } from "react";
import { LinkContextValue } from "./type";
import { LinkContext } from "./context";

export interface LinkProviderProps {
  children: ReactNode;
  LinkComponent?: ComponentType<any>;
  isNextJS?: boolean;
}

export const LinkProvider: React.FC<LinkProviderProps> = ({
  children,
  LinkComponent,
  isNextJS = false,
}) => {
  const contextValue: LinkContextValue = {
    LinkComponent,
    isNextJS,
  };

  return (
    <LinkContext.Provider value={contextValue}>{children}</LinkContext.Provider>
  );
};

export const useLinkContext = () => {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error("useLinkContext must be used within a LinkProvider");
  }
  return context;
};
