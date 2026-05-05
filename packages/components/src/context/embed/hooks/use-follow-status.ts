import { useCallback, useMemo, useInsertionEffect } from "react";

import { SDKEventEmitter, SDKListenerEventName } from "@genuin/components/lib/sdk-event-emitter";
import type { EventManager } from "@genuin/components/lib/utils/event-manager";

import { type FollowStatusItem } from "../context";
import type { EmbedDataType } from "../embed.types";
import type { EmbedEventContextType, EmbedEventNameType } from "../event-bus";

interface UseFollowStatusProps {
  embedData: EmbedDataType;
  embedEventBus: EventManager<EmbedEventContextType, EmbedEventNameType>;
  isIHeartLayout: boolean;
  setStateEmbedData: React.Dispatch<React.SetStateAction<EmbedDataType>>;
}

interface UseFollowStatusReturn {
  initialFollowStatuses: FollowStatusItem[];
  getFollowStatus: (id: string, type: "podcast" | "station") => boolean | undefined;
  updateFollowStatus: (id: string, type: "podcast" | "station", isFollowed: boolean) => void;
}

/**
 * Custom hook for managing follow status functionality.
 * Only active when isIHeartLayout is true.
 */
export function useFollowStatus({
  embedData,
  embedEventBus,
  isIHeartLayout,
  setStateEmbedData,
}: UseFollowStatusProps): UseFollowStatusReturn {
  // Initialize follow statuses from brand_context (only for iHeart layout)
  const initialFollowStatuses: FollowStatusItem[] = useMemo(() => {
    if (!isIHeartLayout || !embedData.brand_context) return [];

    return embedData.brand_context
      .filter((item) => item.type === "podcast" || item.type === "station")
      .map((item) => ({
        id: String(item.id),
        type: item.type as "podcast" | "station",
        isFollowed: item.isFollowed ?? false,
      }));
  }, [embedData.brand_context, isIHeartLayout]);

  // Follow status management methods (only active for iHeart layout)
  const getFollowStatus = useCallback(
    (id: string, type: "podcast" | "station"): boolean | undefined => {
      if (!isIHeartLayout) return undefined;

      const followStatuses = embedEventBus.getContext().followStatuses;
      const item = followStatuses.find((status: FollowStatusItem) => status.id === String(id) && status.type === type);
      return item?.isFollowed;
    },
    [embedEventBus, isIHeartLayout]
  );

  const updateFollowStatus = useCallback(
    (id: string, type: "podcast" | "station", isFollowed: boolean) => {
      if (!isIHeartLayout) return;

      // Update follow statuses in event bus
      embedEventBus.emit("followStatusChange", undefined, (currentContext: EmbedEventContextType) => {
        const existingIndex = currentContext.followStatuses.findIndex(
          (status: FollowStatusItem) => status.id === String(id) && status.type === type
        );

        let updatedFollowStatuses: FollowStatusItem[];

        if (existingIndex >= 0) {
          // Update existing follow status
          updatedFollowStatuses = [...currentContext.followStatuses];
          updatedFollowStatuses[existingIndex] = {
            id: String(id),
            type,
            isFollowed,
          };
        } else {
          // Add new follow status
          updatedFollowStatuses = [...currentContext.followStatuses, { id: String(id), type, isFollowed }];
        }

        return {
          ...currentContext,
          followStatuses: updatedFollowStatuses,
        };
      });

      // Also update the brand_context in embedData
      setStateEmbedData((prev) => ({
        ...prev,
        brand_context:
          prev.brand_context?.map((item) =>
            item.id === String(id) && item.type === type ? { ...item, isFollowed } : item
          ) ?? [],
      }));
    },
    [embedEventBus, isIHeartLayout, setStateEmbedData]
  );

  // Handle follow change events from external sources (like SDK) - only for iHeart layout
  useInsertionEffect(() => {
    if (!isIHeartLayout) return;

    const handleExternalFollowChange = (data: any) => {
      const payload = data?.payload || data; // Handle both wrapped and direct payload
      if (payload?.id && payload?.type && typeof payload.isFollowed === "boolean") {
        updateFollowStatus(String(payload.id), payload.type, payload.isFollowed);
      }
    };

    SDKEventEmitter.on(SDKListenerEventName.PLAYER_ON_FOLLOW_CHANGED, handleExternalFollowChange);

    return () => {
      SDKEventEmitter.off(SDKListenerEventName.PLAYER_ON_FOLLOW_CHANGED, handleExternalFollowChange);
    };
  }, [isIHeartLayout, updateFollowStatus]);

  return {
    initialFollowStatuses,
    getFollowStatus,
    updateFollowStatus,
  };
}
