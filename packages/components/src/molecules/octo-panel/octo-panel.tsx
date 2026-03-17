import "@genuin/genai-sdk/styles";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useBaseContext } from "@genuin/components/context/base";
import { useAuthContext } from "@genuin/components/context/auth";
import { Button } from "@genuin/ui/button";
import { X } from "lucide-react";
import { useEmbedContext } from "@genuin/components/context/embed";

/**
 * Custom hook that only runs cleanup on actual component unmount
 * Does NOT run on re-renders or dependency changes
 */
function useUnmount(fn: () => void) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      fnRef.current();
    };
  }, []); // Empty deps = only runs on true unmount
}

type OctoPanelPropsType = {
  videoId: string;
  videoSlug?: string;
  /**
   * Optional trigger to toggle the panel when OctoPanel manages its own state.
   */
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Class name for the rendered panel container.
   */
  panelClassName?: string;
  onClose?: () => void;
  /**
   * Variant of the panel:
   * - "standalone": Renders with wrapper, close button, and rounded corners (default)
   * - "sheet": Only renders SDK container without wrapper - for use inside DynamicSheet
   */
  variant?: "standalone" | "sheet";
  renderMode?: "compact" | "full";
  onExpandRequest?: () => void;
  onCompactExpand?: () => void;
  onCountdownActive?: (isActive: boolean) => void;
} & ComponentProps<"div">;

export type OctoPanelHandle = {
  resetForVideo: (nextVideoId: string) => void;
};

function generateUniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function createPanelIdentity() {
  return {
    containerId: generateUniqueId("octo-genai-container"),
    panelId: generateUniqueId("octo-panel"),
    key: generateUniqueId("octo-panel-key"),
  } as const;
}

export const OctoPanel = forwardRef<OctoPanelHandle, OctoPanelPropsType>(
  (
    {
      videoId,
      videoSlug,
      children,
      className,
      defaultOpen,
      open,
      onOpenChange,
      panelClassName,
      onClose,
      variant = "standalone",
      renderMode,
      onExpandRequest,
      onCompactExpand,
      onCountdownActive,
      ...triggerProps
    },
    ref
  ) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const sdkInitializedRef = useRef(false);
  const previousVideoIdRef = useRef<string | null>(null);
  const { brandDetails } = useBaseContext();
  const embedContext = useEmbedContext();
  const { user } = useAuthContext();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sdkModule, setSDKModule] = useState<any>(null);
  const [panelIdentity, setPanelIdentity] = useState(createPanelIdentity);
  const [isReinitializing, setIsReinitializing] = useState(false);
  const previousRenderModeRef = useRef<"compact" | "full" | undefined>(renderMode);
  const mountTimestamp = useRef(Date.now());
  const isDestroyingRef = useRef(false);
  const [destroyCompleteCounter, setDestroyCompleteCounter] = useState(0);


  const [parentInstanceId, setParentInstanceId] = useState<string | null>(null);
  const [parentContainerId, setParentContainerId] = useState<string | null>(null);
  const [parentEmbedId, setParentEmbedId] = useState<string | null>(null);
  const [parentPlacementId, setParentPlacementId] = useState<string | null>(null);

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerNode(node);
  }, []);

  useEffect(() => {
    if (!embedContext?.rootElement) {
      setParentInstanceId((prev) => prev ?? panelIdentity.panelId);
      return;
    }

    const updateParentIds = () => {
      const instanceId = embedContext.rootElement?.getAttribute('data-instance-id');
      if (instanceId) {
        setParentInstanceId(instanceId);
      } else {
        setParentInstanceId((prev) => prev ?? panelIdentity.panelId);
      }

      const containerId = embedContext.rootElement?.id;
      if (containerId) {
        setParentContainerId(containerId);
      }

      const embedId = embedContext.embedData?.embed_id;
      if (embedId) {
        setParentEmbedId(embedId);
      }

      const placementId = embedContext.embedData?.placement_id;
      if (placementId) {
        setParentPlacementId(String(placementId));
      }
    };

    // Initial update
    updateParentIds();

    // Set up a MutationObserver to watch for attribute changes on the parent element
    // This ensures we pick up instance ID changes when the parent SDK re-initializes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-instance-id') {
          updateParentIds();
          break;
        }
      }
    });

    if (embedContext.rootElement) {
      observer.observe(embedContext.rootElement, {
        attributes: true,
        attributeFilter: ['data-instance-id', 'id'],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [
    embedContext?.rootElement,
    embedContext?.embedData.embed_id,
    embedContext?.embedData.placement_id,
    panelIdentity.panelId,
  ]);

  // Determine actual open state (controlled or uncontrolled)
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isOpen = isControlled ? open! : internalOpen;


  const {
    onClick: triggerOnClick,
    role: triggerRole,
    tabIndex: triggerTabIndex,
    ...restTriggerProps
  } = triggerProps;

  const setOpen = useCallback(
    (nextOpen: boolean, source: "trigger" | "close") => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);

      if (!nextOpen && source === "close") {
        onClose?.();
      }
    },
    [isControlled, onOpenChange, onClose]
  );

  const handleTriggerClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      triggerOnClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(!isOpen, "trigger");
    },
    [isOpen, setOpen, triggerOnClick]
  );

  const handleClose = useCallback(() => {
    setOpen(false, "close");
  }, [setOpen]);

  // Load GenAI SDK dynamically when panel opens
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isSDKLoaded || isInitializing) {
      return;
    }

    setIsInitializing(true);

    const loadSDK = async () => {
      try {
        const module = await import('@genuin/genai-sdk');
        setSDKModule(module);
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('[OctoPanel] Failed to load GenAI SDK:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadSDK();
  }, [isOpen, isSDKLoaded, isInitializing]);

  useLayoutEffect(() => {
    const effectiveContainer = containerNode ?? containerRef.current;

    if (!isOpen || !isSDKLoaded || !sdkModule || !effectiveContainer || !parentInstanceId) {
      return;
    }

    const hasVideoChanged =
      previousVideoIdRef.current !== null && previousVideoIdRef.current !== videoId;

    if (sdkInitializedRef.current && !hasVideoChanged) {
      // Already initialised for this video, nothing to do.
      return;
    }

    // If we're currently destroying, wait for it to complete
    if (isDestroyingRef.current) {
      return;
    }

    if (sdkInitializedRef.current && hasVideoChanged) {
      // Mark that we're destroying
      isDestroyingRef.current = true;
      setIsReinitializing(true);

      // Destroy the current SDK instance asynchronously
      const destroyAndReinit = async () => {
        try {
          await Promise.resolve(sdkModule.destroy());
          sdkInitializedRef.current = false;
          previousVideoIdRef.current = null;

          // Wait a bit to ensure cleanup is complete
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error('[OctoPanel] Failed to destroy SDK during video change:', error);
        } finally {
          isDestroyingRef.current = false;
          // Increment counter to trigger re-initialization
          setDestroyCompleteCounter(prev => prev + 1);
        }
      };

      destroyAndReinit();
      return; // Exit and let the effect re-run after destroy completes
    }

    try {
      sdkModule.init({
        containerId: panelIdentity.containerId,
        containerElement: effectiveContainer,
        userId: user?.id || "anonymous",
        brandId: brandDetails.brand_id,
        view: "web-sdk",
        renderMode,
        sessionId: undefined,
        parentWebSdkInstanceId: parentInstanceId,
        parentWebSdkContainerId: parentContainerId ?? undefined,
        parentWebSdkEmbedId: parentEmbedId ?? undefined,
        parentWebSdkPlacementId: parentPlacementId ?? undefined,
        parentOctoPanelId: panelIdentity.panelId,
        videoId: videoId,
      });
      sdkInitializedRef.current = true;
      previousVideoIdRef.current = videoId;
      setIsReinitializing(false);
      previousRenderModeRef.current = renderMode;
    } catch (error) {
      console.error('[OctoPanel] Failed to initialize GenAI SDK:', error);
      sdkInitializedRef.current = false;
      setIsReinitializing(false);
    }
  }, [
    isOpen,
    isSDKLoaded,
    sdkModule,
    user?.id,
    brandDetails.brand_id,
    parentInstanceId,
    parentContainerId,
    parentEmbedId,
    parentPlacementId,
    containerNode,
    isReinitializing,
    panelIdentity.containerId,
    panelIdentity.panelId,
    videoId,
    destroyCompleteCounter,
  ]);

  // Panel close logic with grace period to prevent rapid open/close cycles
  useEffect(() => {
    if (isOpen) return;

    // Panel closed - wait a bit to see if it reopens (prevents unnecessary destroy)
    const timeout = setTimeout(() => {
      if (!isOpen && sdkModule && sdkInitializedRef.current) {
        try {
          sdkModule.destroy();
          sdkInitializedRef.current = false;
          previousVideoIdRef.current = null;
          setIsReinitializing(false);
        } catch (error) {
          console.error('[OctoPanel] Failed to destroy SDK on close:', error);
        }
      }
    }, 300); // 300ms grace period

    return () => clearTimeout(timeout);
  }, [isOpen, sdkModule]);

  // Only run cleanup on TRUE unmount (not on re-renders or dependency changes)
  // This prevents cascade destroy when component re-renders in nested contexts
  useUnmount(() => {
    if (sdkModule && sdkInitializedRef.current) {
      // CRITICAL: Defer destroy to after React render completes
      // This prevents "Attempted to synchronously unmount a root while React was already rendering"
      // Use setTimeout to push destroy to next tick, allowing React to finish current render
      setTimeout(() => {
        try {
          sdkModule.destroy();
        } catch (error) {
          console.error('[OctoPanel] Cleanup failed:', error);
        }
      }, 0);

      sdkInitializedRef.current = false;
    }
    previousVideoIdRef.current = null;
    setIsReinitializing(false);
  });

  useImperativeHandle(
    ref,
    () => ({
      resetForVideo: (nextVideoId: string) => {
        if (!isOpen) {
          return;
        }

        // Prevent unnecessary reset if video is already current
        if (nextVideoId === videoId && sdkInitializedRef.current) {
          return;
        }

        // Trigger destroy by setting flag - useLayoutEffect will handle re-init
        if (sdkModule && sdkInitializedRef.current && !isDestroyingRef.current) {
          isDestroyingRef.current = true;
          setIsReinitializing(true);

          const destroyForReset = async () => {
            try {
              await Promise.resolve(sdkModule.destroy());
              sdkInitializedRef.current = false;

              // Wait a bit to ensure cleanup is complete
              await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
              console.error('[OctoPanel] Failed to destroy SDK during reset:', error);
            } finally {
              isDestroyingRef.current = false;
              // Increment counter to trigger re-initialization
              setDestroyCompleteCounter(prev => prev + 1);
            }
          };

          destroyForReset();
        }

        // Keep the previous video ID as current so useLayoutEffect detects the change
        // This will trigger re-initialization with nextVideoId in the next render
        previousVideoIdRef.current = videoId;
      },
    }),
    [isOpen, sdkModule, videoId]
  );

  useEffect(() => {
    if (!renderMode) return;
    if (!sdkModule || typeof sdkModule.setWebSdkRenderMode !== "function") return;
    if (!sdkInitializedRef.current) return;
    if (previousRenderModeRef.current === renderMode) return;

    try {
      sdkModule.setWebSdkRenderMode(renderMode);
      previousRenderModeRef.current = renderMode;
    } catch (error) {
      console.error("[OctoPanel] Failed to update web-sdk render mode", error);
    }
  }, [renderMode, sdkModule]);

  useEffect(() => {
    if (!onExpandRequest) return;

    const handleExpandRequest = (event: Event) => {
      const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
      const targetPanelId = detail?.parentOctoPanelId;

      if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
        return;
      }

      onExpandRequest();
    };

    window.addEventListener("genai:webSdkRequestExpand", handleExpandRequest);
    return () => {
      window.removeEventListener("genai:webSdkRequestExpand", handleExpandRequest);
    };
  }, [onExpandRequest, panelIdentity.panelId]);

  useEffect(() => {
    if (!onCompactExpand) {
      return;
    }

    const handleCompactExpand = (event: Event) => {
      const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
      const targetPanelId = detail?.parentOctoPanelId;

      if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
        return;
      }

      onCompactExpand();
    };

    window.addEventListener("genai:webSdkCompactExpand", handleCompactExpand);
    return () => {
      window.removeEventListener("genai:webSdkCompactExpand", handleCompactExpand);
    };
  }, [onCompactExpand, panelIdentity.panelId]);

  useEffect(() => {
    if (!onCountdownActive) {
      return;
    }

    const handleCountdownActive = (event: Event) => {
      const { detail } = event as CustomEvent<{ parentOctoPanelId?: string; isActive: boolean }>;
      const targetPanelId = detail?.parentOctoPanelId;

      if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
        return;
      }

      onCountdownActive(detail.isActive);
    };

    window.addEventListener("genai:webSdkCountdownActive", handleCountdownActive);
    return () => {
      window.removeEventListener("genai:webSdkCountdownActive", handleCountdownActive);
    };
  }, [onCountdownActive, panelIdentity.panelId]);

  // Render SDK container content (used in both variants)
  const sdkContainerContent = (
    <div className="gencl:relative gencl:h-full">
      {isSDKLoaded ? (
        <div
          id={panelIdentity.containerId}
          key={panelIdentity.key}
          ref={handleContainerRef}
          className="gencl:h-full gencl:w-full genai-sdk-container"
          data-octo-panel-id={panelIdentity.panelId}
        />
      ) : (
        <div className="gencl:flex gencl:h-full gencl:items-center gencl:justify-center">
          <div className="gencl:text-center">
            <div className="gencl:mx-auto gencl:h-12 gencl:w-12 gencl:animate-spin gencl:rounded-full gencl:border-b-2 gencl:border-primary-500"></div>
            <p className="gencl:mt-4 gencl:text-secondary-600">Loading Octo...</p>
          </div>
        </div>
      )}

      {isSDKLoaded && isReinitializing ? (
        <div className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white/80">
          <div className="gencl:text-center">
            <div className="gencl:mx-auto gencl:h-12 gencl:w-12 gencl:animate-spin gencl:rounded-full gencl:border-b-2 gencl:border-primary-500"></div>
            <p className="gencl:mt-4 gencl:text-secondary-600">Loading Octo...</p>
          </div>
        </div>
      ) : null}
    </div>
  );

  // Sheet variant: Only render SDK container when open (no wrapper, no close button)
  if (variant === "sheet") {
    return isOpen ? (
      <div className={cn("gencl:flex-1 gencl:min-h-0", panelClassName)}>
        {sdkContainerContent}
      </div>
    ) : null;
  }

  // Standalone variant: Render with wrapper, close button, and trigger
  return (
    <>
      {children ? (
        <div
          className={className}
          role={triggerRole ?? "button"}
          tabIndex={triggerTabIndex ?? 0}
          {...restTriggerProps}
          onClick={handleTriggerClick}
        >
          {children}
        </div>
      ) : null}

      {isOpen ? (
        <div
          className={cn(
            "gencl:relative gencl:flex gencl:h-full gencl:flex-col gencl:overflow-hidden gencl:rounded-2xl gencl:bg-white",
            panelClassName
          )}
        >
          <div className="gencl:flex gencl:justify-end gencl:px-4 gencl:pt-4 gencl:pb-0">
            <Button
              theme="custom"
              variant="icon"
              className="gencl:size-5!"
              onClick={handleClose}
            >
              <X className="gencl:size-5 gencl:cursor-pointer gencl:opacity-70 gencl:transition-opacity gencl:hover:opacity-100" />
            </Button>
          </div>

          <div className="gencl:flex-1 gencl:min-h-0">
            {sdkContainerContent}
          </div>
        </div>
      ) : null}
    </>
  );
  }
);

OctoPanel.displayName = "OctoPanel";
