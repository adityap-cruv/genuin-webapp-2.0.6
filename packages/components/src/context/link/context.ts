"use client";
import { createContext } from "react";
import { LinkContextValue } from "./type";

export const LinkContext = createContext<LinkContextValue | null>(null);
