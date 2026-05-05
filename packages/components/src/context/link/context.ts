"use client";
import { createContext } from "react";

import type { LinkContextValue } from "./type";

export const LinkContext = createContext<LinkContextValue | null>(null);
