"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { useBaseContext } from "../context/base";
import { useAuthContext } from "../context/auth";
import type { AuthUser } from "@genuin/components/types/auth";
import { StepsType } from "../organisms/authentication-modal/context";

const INTERRUPTION_STEPS = [
  {
    key: "SIGNIN" as StepsType,
    configKey: "login_signup_popup",
    isComplete: (user?: AuthUser | null) => !!user,
  },
  {
    key: "CATEGORY_SELECTION" as StepsType,
    configKey: "interest_selection_popup",
    isComplete: (user?: AuthUser | null) => user?.hasTopics,
  },
  {
    key: "EDIT_USERNAME" as StepsType,
    configKey: "username_popup",
    isComplete: (user?: AuthUser | null) => user?.usernameSet,
  },
  // {
  //   key: "COMPLETE_PROFILE" as StepsType,
  //   configKey: "complete_profile_popup",
  //   isComplete: (user?: AuthUser | null) =>
  //     user?.name && user?.bio && user?.image,
  // },
] as const;

export function useInterruptionManager() {
  const { brandDetails } = useBaseContext();
  const { user } = useAuthContext();
  const interactionRef = useRef({ lastIndex: 0, swipeCount: 0 });
  const [shouldShowDialog, setShouldShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<StepsType | undefined>(
    undefined
  );

  // First check if get_app_popup is enabled
  const getAppConfig = brandDetails?.web_configs?.get_app_popup;
  const shouldShowAppDownload =
    getAppConfig?.enable && brandDetails.web_cta === "app";

  // Only check interruption steps if get_app_popup is not enabled
  const interruptionToShow = shouldShowAppDownload
    ? null
    : INTERRUPTION_STEPS.find(
        (step) =>
          brandDetails?.web_configs?.[step.configKey]?.enable &&
          !step.isComplete(user)
      );

  // Trigger authentication or download modal based on configuration
  const triggerAuthenticationModal = useCallback(async () => {
    if (shouldShowAppDownload) {
      setShouldShowDialog(true);
      setDialogType("GET_APP");
      return;
    }

    if (interruptionToShow) {
      setShouldShowDialog(true);
      setDialogType(interruptionToShow.key);
    }
  }, [interruptionToShow, shouldShowAppDownload, brandDetails.web_cta]);

  // Function to close dialog and reset state
  const closeDialog = useCallback(() => {
    setShouldShowDialog(false);
    setDialogType(undefined);
  }, []);

  // Handle swipe interactions to trigger modal after a set count
  const handleSwipeCount = useCallback(
    (index: number) => {
      const { swipeCount, lastIndex } = interactionRef.current;
      const popupAfter = shouldShowAppDownload
        ? (getAppConfig?.popup_after ?? 0)
        : interruptionToShow
          ? (brandDetails?.web_configs?.[interruptionToShow.configKey]
              ?.popup_after ?? 0)
          : 0;

      if (index !== lastIndex) {
        interactionRef.current.swipeCount = swipeCount + 1;
        interactionRef.current.lastIndex = index;
      }

      // console.log(
      //   "popupAfter, interruptionToShow",
      //   popupAfter,
      //   interruptionToShow
      // );

      if (interactionRef.current.swipeCount >= popupAfter) {
        interactionRef.current.swipeCount = 0;
        void triggerAuthenticationModal();
      }
    },
    [
      brandDetails?.web_configs,
      interruptionToShow,
      shouldShowAppDownload,
      getAppConfig,
      triggerAuthenticationModal,
    ]
  );

  // Detect idle time and trigger modal if necessary
  useEffect(() => {
    const idleConfig = brandDetails?.web_configs?.idle_time_interruption;
    if (!idleConfig?.enable) return;

    let timeout: NodeJS.Timeout;
    const resetIdleTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        triggerAuthenticationModal,
        (idleConfig?.popup_after ?? 0) * 1000
      );
    };

    resetIdleTimeout();
    document.addEventListener("click", resetIdleTimeout);

    return () => {
      document.removeEventListener("click", resetIdleTimeout);
      clearTimeout(timeout);
    };
  }, [
    triggerAuthenticationModal,
    brandDetails?.web_configs?.idle_time_interruption,
  ]);

  return {
    handleSwipeCount,
    shouldShowDialog,
    dialogType,
    closeDialog,
  };
}
