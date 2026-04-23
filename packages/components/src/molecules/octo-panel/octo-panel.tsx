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
import { usePrevious } from "@genuin/components/hooks/use-previous";

/**
 * Type definition for the GenAI SDK module
 * This represents the dynamically imported @genuin/genai-sdk package
 */
type GenAISDKModule = {
  init: (config: {
    containerId: string;
    containerElement: HTMLElement;
    userId: string;
    brandId: number;
    view: string;
    renderMode?: "compact" | "full";
    sessionId?: string;
    parentWebSdkInstanceId: string | null;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId: string;
    videoId: string;
    integrationType?: "embed" | "placement";
    integrationId?: string;
    contentOrder?: string[];
  }) => void;
  destroy: () => void | Promise<void>;
  setWebSdkRenderMode?: (mode: "compact" | "full") => void;
};

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
  /**
   * @deprecated Use onThinkingStarted instead. Kept for backward compat.
   */
  onCompactExpand?: () => void;
  onThinkingStarted?: () => void;
  onCountdownActive?: (isActive: boolean) => void;
  onError?: () => void;
  /**
   * Integration type for the chat session.
   * If not provided, will be determined from embed context.
   */
  integrationType?: "embed" | "placement";
  /**
   * Integration ID (embed_id or placement_id) for the chat session.
   * If not provided, will be read from embed context.
   */
  integrationId?: string;
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

/**
 * OctoPanel Component
 *
 * A dynamic panel component that integrates with the GenAI SDK to provide
 * AI-powered interactions within video player interfaces. Supports both
 * standalone and embedded (sheet) rendering modes.
 *
 * Key Features:
 * - Lazy loads GenAI SDK only when panel opens (performance optimization)
 * - Handles SDK lifecycle (init/destroy) automatically
 * - Supports video transitions with proper cleanup/reinit
 * - Manages parent-child SDK instance relationships
 * - Provides imperative handle for external control via ref
 *
 * @example
 * ```tsx
 * // Standalone usage
 * <OctoPanel videoId="123" variant="standalone">
 *   <button>Open Octo</button>
 * </OctoPanel>
 *
 * // Sheet usage (inside DynamicSheet)
 * <OctoPanel
 *   videoId="123"
 *   variant="sheet"
 *   open={isOpen}
 *   renderMode="compact"
 * />
 * ```
 */
export const OctoPanel = forwardRef<OctoPanelHandle, OctoPanelPropsType>(
  function OctoPanel(
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
      onThinkingStarted,
      onCountdownActive,
      onError,
      integrationType: integrationTypeProp,
      integrationId: integrationIdProp,
      ...triggerProps
    }: OctoPanelPropsType,
    ref,
  ) {
    // DOM References
    // We maintain both a ref and state for the container because:
    // - containerRef: Provides immediate DOM access without triggering re-renders
    // - containerNode: State that triggers re-renders when container is attached
    // This dual approach ensures the SDK initializes correctly while avoiding unnecessary renders
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
      null,
    );

    // SDK State Management
    const sdkInitializedRef = useRef(false); // Tracks if SDK is currently initialized
    const [isInitializing, setIsInitializing] = useState(false); // Loading state for SDK import
    const [sdkModule, setSDKModule] = useState<GenAISDKModule | null>(null); // The loaded SDK module
    const [panelIdentity, setPanelIdentity] = useState(createPanelIdentity); // Unique IDs for this panel instance

    /**
     * Tracks whether we're in the process of reinitializing the SDK for a new video.
     * When true, displays a loading overlay to prevent user interaction during the transition.
     * This is separate from isInitializing (which is for the initial SDK load).
     */
    const [isReinitializing, setIsReinitializing] = useState(false);

    // Lifecycle Management
    const isDestroyingRef = useRef(false); // Prevents concurrent destroy operations
    const [destroyCompleteCounter, setDestroyCompleteCounter] = useState(0); // Triggers re-init after destroy completes

    // Context
    const { brandDetails } = useBaseContext();
    const embedContext = useEmbedContext();
    const { user } = useAuthContext();

    // Track previous values for change detection
    const previousVideoId = usePrevious(videoId);
    const previousRenderMode = usePrevious(renderMode);

    // Parent SDK Instance Tracking
    // These IDs link this OctoPanel to its parent Web SDK instance for proper event routing
    const [parentInstanceId, setParentInstanceId] = useState<string | null>(
      null,
    );
    const [parentContainerId, setParentContainerId] = useState<string | null>(
      null,
    );
    const [parentEmbedId, setParentEmbedId] = useState<string | null>(null);
    const [parentPlacementId, setParentPlacementId] = useState<string | null>(
      null,
    );

    // Determine integration type and ID from props or embed context
    const integrationType =
      integrationTypeProp ??
      (embedContext?.embedData?.embed_id
        ? "embed"
        : embedContext?.embedData?.placement_id
          ? "placement"
          : undefined);
    const integrationId =
      integrationIdProp ??
      embedContext?.embedData?.embed_id ??
      (embedContext?.embedData?.placement_id
        ? String(embedContext.embedData.placement_id)
        : undefined);

    // Extract content_order from octo_settings in live_customization_tools if available
    const contentOrder =
      embedContext?.embedData?.live_customization_tools?.octo_settings
        ?.content_order;

    const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
      containerRef.current = node;
      setContainerNode(node);
    }, []);

    /**
     * Effect: Extract and track parent SDK instance IDs from the embed context.
     * Sets up a MutationObserver to detect when the parent SDK re-initializes and updates its data-instance-id.
     * This ensures OctoPanel always communicates with the correct parent instance.
     */
    useEffect(() => {
      if (!embedContext?.rootElement) {
        setParentInstanceId((prev) => prev ?? panelIdentity.panelId);
        return;
      }

      const updateParentIds = () => {
        const instanceId =
          embedContext.rootElement?.getAttribute("data-instance-id");
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
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-instance-id"
          ) {
            updateParentIds();
            break;
          }
        }
      });

      if (embedContext.rootElement) {
        observer.observe(embedContext.rootElement, {
          attributes: true,
          attributeFilter: ["data-instance-id", "id"],
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

    /**
     * Dispatch genai:webSdkClose to tell the GenAI SDK to reset its chat/prompt state.
     * Called on panel close and unmount so the next open starts fresh.
     */
    const dispatchCloseToGenai = useCallback(() => {
      window.dispatchEvent(
        new CustomEvent("genai:webSdkClose", {
          detail: { parentOctoPanelId: panelIdentity.panelId },
        }),
      );
    }, [panelIdentity.panelId]);

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
      [isControlled, onOpenChange, onClose],
    );

    const handleTriggerClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        triggerOnClick?.(event);
        if (event.defaultPrevented) return;
        setOpen(!isOpen, "trigger");
      },
      [isOpen, setOpen, triggerOnClick],
    );

    const handleClose = useCallback(() => {
      setOpen(false, "close");
    }, [setOpen]);

    /**
     * Effect: Lazy load the GenAI SDK module when the panel first opens.
     * This defers the SDK bundle download until actually needed, improving initial page load performance.
     */
    useEffect(() => {
      if (!isOpen) {
        return;
      }

      // Skip if already loaded or currently loading
      if (sdkModule || isInitializing) {
        return;
      }

      setIsInitializing(true);

      const loadSDK = async () => {
        try {
          const module = await import("@genuin/genai-sdk");
          setSDKModule(module as GenAISDKModule);
        } catch (error) {
          console.error("[OctoPanel] Failed to load GenAI SDK:", error);
        } finally {
          setIsInitializing(false);
        }
      };

      loadSDK();
    }, [isOpen, sdkModule, isInitializing]);

    /**
     * Effect: Initialize/destroy the GenAI SDK based on panel state and video changes.
     *
     * Why useLayoutEffect?
     * - We use useLayoutEffect instead of useEffect to ensure SDK initialization happens
     *   synchronously BEFORE the browser paints. This prevents visual flicker and ensures
     *   the SDK UI is ready when the panel becomes visible.
     * - The SDK modifies the DOM directly, so we need the init/destroy operations to
     *   complete before React commits the changes to the screen.
     *
     * What this effect does:
     * 1. Initializes the SDK when the panel opens for the first time
     * 2. Destroys and reinitializes when the video changes (to clear conversation history)
     * 3. Prevents concurrent destroy operations to avoid race conditions
     * 4. Uses a counter-based trigger (destroyCompleteCounter) to re-run after async destroy
     */
    useLayoutEffect(() => {
      const effectiveContainer = containerNode ?? containerRef.current;

      // Guard: Ensure all prerequisites are met before SDK operations
      if (!isOpen || !sdkModule || !effectiveContainer || !parentInstanceId) {
        return;
      }

      // Detect if video has changed since last initialization
      const hasVideoChanged =
        previousVideoId !== null && previousVideoId !== videoId;

      // Early return: SDK already initialized for current video
      if (sdkInitializedRef.current && !hasVideoChanged) {
        return;
      }

      // Guard: Prevent concurrent destroy operations
      if (isDestroyingRef.current) {
        return;
      }

      // Scenario: Video changed - destroy current SDK and prepare for reinit
      if (sdkInitializedRef.current && hasVideoChanged) {
        isDestroyingRef.current = true;
        setIsReinitializing(true);

        const destroyAndReinit = async () => {
          try {
            await Promise.resolve(sdkModule.destroy());
            sdkInitializedRef.current = false;

            // Grace period to ensure DOM cleanup completes
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(
              "[OctoPanel] Failed to destroy SDK during video change:",
              error,
            );
          } finally {
            isDestroyingRef.current = false;
            // Trigger effect re-run by incrementing counter
            setDestroyCompleteCounter((prev) => prev + 1);
          }
        };

        destroyAndReinit();
        return; // Exit - effect will re-run after destroy completes
      }

      // Initialize SDK for current video
      try {
        console.log("videoId ##", videoId);
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
          integrationType,
          integrationId,
          contentOrder,
        });
        sdkInitializedRef.current = true;
        setIsReinitializing(false);
      } catch (error) {
        console.error("[OctoPanel] Failed to initialize GenAI SDK:", error);
        sdkInitializedRef.current = false;
        setIsReinitializing(false);
      }
    }, [
      isOpen,
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
      previousVideoId,
      destroyCompleteCounter,
      contentOrder,
      integrationType,
      integrationId,
      renderMode,
    ]);

    /**
     * Effect: Destroy SDK when panel closes, with grace period to prevent rapid cycles.
     * The 300ms delay prevents unnecessary destroy/reinit if user quickly reopens the panel.
     * Also dispatches genai:webSdkClose so the GenAI SDK resets its state.
     */
    useEffect(() => {
      if (isOpen) return;

      const timeout = setTimeout(() => {
        if (!isOpen && sdkModule && sdkInitializedRef.current) {
          try {
            dispatchCloseToGenai();
            sdkModule.destroy();
            sdkInitializedRef.current = false;
            setIsReinitializing(false);
          } catch (error) {
            console.error("[OctoPanel] Failed to destroy SDK on close:", error);
          }
        }
      }, 300); // 300ms grace period

      return () => clearTimeout(timeout);
    }, [isOpen, sdkModule, dispatchCloseToGenai]);

    /**
     * Effect: Cleanup SDK on component unmount.
     * Only runs on TRUE unmount (not on re-renders or dependency changes).
     * This prevents cascade destroy when component re-renders in nested contexts.
     * Dispatches genai:webSdkClose so the GenAI SDK resets on video change / unmount.
     */
    useUnmount(() => {
      if (sdkModule && sdkInitializedRef.current) {
        dispatchCloseToGenai();

        // CRITICAL: Defer destroy to after React render completes
        // This prevents "Attempted to synchronously unmount a root while React was already rendering"
        // Use setTimeout to push destroy to next tick, allowing React to finish current render
        setTimeout(() => {
          try {
            sdkModule.destroy();
          } catch (error) {
            console.error("[OctoPanel] Cleanup failed:", error);
          }
        }, 0);

        sdkInitializedRef.current = false;
      }
      setIsReinitializing(false);
    });

    /**
     * Expose imperative handle for external control.
     * Provides resetForVideo method to force SDK reinit for a specific video.
     */
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
          if (
            sdkModule &&
            sdkInitializedRef.current &&
            !isDestroyingRef.current
          ) {
            isDestroyingRef.current = true;
            setIsReinitializing(true);

            const destroyForReset = async () => {
              try {
                await Promise.resolve(sdkModule.destroy());
                sdkInitializedRef.current = false;

                // Wait a bit to ensure cleanup is complete
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (error) {
                console.error(
                  "[OctoPanel] Failed to destroy SDK during reset:",
                  error,
                );
              } finally {
                isDestroyingRef.current = false;
                // Increment counter to trigger re-initialization
                setDestroyCompleteCounter((prev) => prev + 1);
              }
            };

            destroyForReset();
          }
        },
      }),
      [isOpen, sdkModule, videoId],
    );

    /**
     * Effect: Update SDK render mode when it changes (compact <-> full).
     * Only updates if SDK is initialized and the mode actually changed.
     */
    useEffect(() => {
      if (!renderMode) return;
      if (!sdkModule || typeof sdkModule.setWebSdkRenderMode !== "function")
        return;
      if (!sdkInitializedRef.current) return;
      if (previousRenderMode === renderMode) return;

      try {
        sdkModule.setWebSdkRenderMode(renderMode);
      } catch (error) {
        console.error(
          "[OctoPanel] Failed to update web-sdk render mode",
          error,
        );
      }
    }, [renderMode, sdkModule, previousRenderMode]);

    /**
     * Effect: Listen for expand request events from the GenAI SDK.
     * Filters events to only respond to those targeting this specific panel instance.
     */
    useEffect(() => {
      if (!onExpandRequest) return;

      const handleExpandRequest = (event: Event) => {
        const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
        const targetPanelId = detail?.parentOctoPanelId;

        if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
          return;
        }

        // Delay to ensure onCompactExpand (genai:webSdkCompactExpand) fires first
        setTimeout(() => {
          onExpandRequest();
        }, 50);
      };

      window.addEventListener("genai:webSdkRequestExpand", handleExpandRequest);
      return () => {
        window.removeEventListener(
          "genai:webSdkRequestExpand",
          handleExpandRequest,
        );
      };
    }, [onExpandRequest, panelIdentity.panelId]);

    /**
     * Effect: Listen for the auto-close event dispatched by the GenAI SDK after the
     * full-view idle timeout expires (user didn't interact within 5 s of response).
     * Resets the sheet to its default (compact) state so the video can play unobstructed.
     * Only responds when this hook's video is the active one to avoid stale closures.
     */
    useEffect(() => {
      const handleAutoClose = () => {
        onClose?.();
      };

      window.addEventListener("genai:webSdkAutoClose", handleAutoClose);
      return () => {
        window.removeEventListener("genai:webSdkAutoClose", handleAutoClose);
      };
    }, [onClose]);

    /**
     * Effect: Listen for thinking started events from the GenAI SDK.
     * Fires exactly once per session when the agent starts generating.
     * Also supports legacy genai:webSdkCompactExpand for backward compat.
     */
    useEffect(() => {
      const callback = onThinkingStarted ?? onCompactExpand;
      if (!callback) {
        return;
      }

      const handler = (event: Event) => {
        const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
        const targetPanelId = detail?.parentOctoPanelId;

        if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
          return;
        }

        callback();
      };

      window.addEventListener("genai:webSdkThinkingStarted", handler);
      // Keep legacy listener for backward compat
      window.addEventListener("genai:webSdkCompactExpand", handler);
      return () => {
        window.removeEventListener("genai:webSdkThinkingStarted", handler);
        window.removeEventListener("genai:webSdkCompactExpand", handler);
      };
    }, [onThinkingStarted, onCompactExpand, panelIdentity.panelId]);

    /**
     * Effect: Listen for countdown active state changes from the GenAI SDK.
     * Tracks when the auto-send countdown is active/cancelled.
     */
    useEffect(() => {
      if (!onCountdownActive) {
        return;
      }

      const handleCountdownActive = (event: Event) => {
        const { detail } = event as CustomEvent<{
          parentOctoPanelId?: string;
          isActive: boolean;
          source?: string;
        }>;
        const targetPanelId = detail?.parentOctoPanelId;

        if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
          return;
        }

        onCountdownActive(detail.isActive);
      };

      window.addEventListener(
        "genai:webSdkCountdownActive",
        handleCountdownActive,
      );
      return () => {
        window.removeEventListener(
          "genai:webSdkCountdownActive",
          handleCountdownActive,
        );
      };
    }, [onCountdownActive, panelIdentity.panelId]);

    /**
     * Effect: Listen for error events from the GenAI SDK.
     * Fires when the session enters an error state.
     */
    useEffect(() => {
      if (!onError) {
        return;
      }

      const handleError = (event: Event) => {
        const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
        const targetPanelId = detail?.parentOctoPanelId;

        if (targetPanelId && targetPanelId !== panelIdentity.panelId) {
          return;
        }

        onError();
      };

      window.addEventListener("genai:webSdkError", handleError);
      return () => {
        window.removeEventListener("genai:webSdkError", handleError);
      };
    }, [onError, panelIdentity.panelId]);

    // Render SDK container content (used in both variants)
    const sdkContainerContent = (
      <div className="gencl:relative gencl:h-full">
        {sdkModule ? (
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
              <p className="gencl:mt-4 gencl:text-secondary-600">
                Loading Octo...
              </p>
            </div>
          </div>
        )}

        {sdkModule && isReinitializing ? (
          <div className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center gencl:bg-white/80">
            <div className="gencl:text-center">
              <div className="gencl:mx-auto gencl:h-12 gencl:w-12 gencl:animate-spin gencl:rounded-full gencl:border-b-2 gencl:border-primary-500"></div>
              <p className="gencl:mt-4 gencl:text-secondary-600">
                Loading Octo...
              </p>
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
              panelClassName,
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
  },
);
