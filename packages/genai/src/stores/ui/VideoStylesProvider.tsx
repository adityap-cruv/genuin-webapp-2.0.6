import { createContext, useContext, type ReactNode } from 'react';

import type { VideoStyle } from './types';
import { useVideoStyles } from '@/hooks/useVideoStyles';

interface VideoStylesContextValue {
  videoStyles: VideoStyle[];
  toggleStyleSelection: (styleIndex: number) => void;
  toggleOptionSelection: (styleIndex: number, optionIndex: number) => void;
  resetVideoStyles: () => void;
  buildVideoGenerationMetadata: (userEmail?: string, userUUID?: string) => Record<string, unknown>;
}

const VideoStylesContext = createContext<VideoStylesContextValue | null>(null);

export function VideoStylesProvider({
  brandId,
  children,
}: {
  brandId?: number;
  children: ReactNode;
}) {
  const value = useVideoStyles(brandId);
  return <VideoStylesContext.Provider value={value}>{children}</VideoStylesContext.Provider>;
}

/** @throws if used outside VideoStylesProvider */
export function useVideoStylesContext(): VideoStylesContextValue {
  const ctx = useContext(VideoStylesContext);
  if (!ctx) throw new Error('useVideoStylesContext must be used inside VideoStylesProvider');
  return ctx;
}
