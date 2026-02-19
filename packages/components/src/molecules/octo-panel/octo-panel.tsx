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
      console.log('[OctoPanel] No parent root element found, using fallback instance id');
      setParentInstanceId((prev) => prev ?? panelIdentity.panelId);
      return;
    }

    const instanceId = embedContext.rootElement.getAttribute('data-instance-id');
    if (instanceId) {
      console.log('[OctoPanel] Retrieved parent instance id from embed context:', instanceId);
      setParentInstanceId(instanceId);
    } else {
      console.log('[OctoPanel] Parent root element missing data-instance-id attribute, using fallback');
      setParentInstanceId((prev) => prev ?? panelIdentity.panelId);
    }

    const containerId = embedContext.rootElement.id;
    if (containerId) {
      setParentContainerId(containerId);
    }

    const embedId = embedContext.embedData.embed_id;
    if (embedId) {
      setParentEmbedId(embedId);
    }

    const placementId = embedContext.embedData.placement_id;
    if (placementId) {
      setParentPlacementId(String(placementId));
    }
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
      console.log('[OctoPanel] Panel closed, skipping SDK load');
      return;
    }

    if (isSDKLoaded || isInitializing) {
      console.log('[OctoPanel] SDK already loaded or loading');
      return;
    }

    console.log('[OctoPanel] Panel opened, loading SDK module...');
    setIsInitializing(true);

    const loadSDK = async () => {
      try {
        const module = await import('@genuin/genai-sdk');
        console.log('[OctoPanel] SDK module loaded successfully:', module);
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
      if (!parentInstanceId) {
        console.warn('[OctoPanel] Skipping SDK init: parent instance id not ready');
      }
      if (!effectiveContainer && isOpen && isSDKLoaded && sdkModule) {
        if (isReinitializing) {
          console.log('[OctoPanel] Waiting for container ref before reinitializing');
        } else {
          console.error('[OctoPanel] Container ref not set for video:', videoId);
        }
      }
      return;
    }

    const hasVideoChanged =
      previousVideoIdRef.current !== null && previousVideoIdRef.current !== videoId;

    if (sdkInitializedRef.current && !hasVideoChanged) {
      // Already initialised for this video, nothing to do.
      return;
    }

    if (sdkInitializedRef.current && hasVideoChanged) {
      console.log('[OctoPanel] Video changed, destroying existing SDK instance', {
        previousVideoId: previousVideoIdRef.current,
        nextVideoId: videoId,
      });
      try {
        sdkModule.destroy();
      } catch (error) {
        console.error('[OctoPanel] Failed to destroy GenAI SDK on video change:', error);
      }
      sdkInitializedRef.current = false;
    }

    console.log('[OctoPanel] Initializing SDK', {
      videoId,
      containerRef: effectiveContainer,
      parentInstanceId,
    });

    try {
      console.log('[OctoPanel] Calling GenAI SDK init');
      sdkModule.init({
        containerId: panelIdentity.containerId,
        containerElement: effectiveContainer,
        userId: user?.id || "anonymous",
        brandId: brandDetails.brand_id,
        view: "web-sdk",
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
      console.log('[OctoPanel] SDK initialized successfully for video:', videoId, 'with parent instance ID:', parentInstanceId);
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
  ]);

  useEffect(() => {
    if (isOpen) return;

    if (sdkModule && sdkInitializedRef.current) {
      console.log('[OctoPanel] Closing panel: destroying SDK instance');
      try {
        sdkModule.destroy();
      } catch (error) {
        console.error('[OctoPanel] Failed to destroy SDK on close:', error);
      }
      sdkInitializedRef.current = false;
    }
    previousVideoIdRef.current = null;
    setIsReinitializing(false);
  }, [isOpen, sdkModule]);

  useEffect(() => {
    return () => {
      if (sdkModule && sdkInitializedRef.current) {
        console.log('[OctoPanel] Cleanup: destroying SDK');
        try {
          sdkModule.destroy();
        } catch (error) {
          console.error('[OctoPanel] Cleanup failed:', error);
        }
        sdkInitializedRef.current = false;
      }
      previousVideoIdRef.current = null;
      setIsReinitializing(false);
    };
  }, [sdkModule]);

  useImperativeHandle(
    ref,
    () => ({
      resetForVideo: (nextVideoId: string) => {
        if (!isOpen) {
          console.warn('[OctoPanel] Reset requested while panel closed');
          return;
        }
        console.log('[OctoPanel] Resetting SDK for next video', {
          nextVideoId,
          currentVideoId: videoId,
        });

        setIsReinitializing(true);

        if (sdkModule && sdkInitializedRef.current) {
          try {
            sdkModule.destroy();
          } catch (error) {
            console.error('[OctoPanel] Failed to destroy SDK during reset:', error);
          }
        }

        sdkInitializedRef.current = false;
        previousVideoIdRef.current = null;
        containerRef.current = null;
        setContainerNode(null);

        setPanelIdentity(() => createPanelIdentity());
      },
    }),
    [isOpen, sdkModule, videoId]
  );

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
          </div>
        </div>
      ) : null}
    </>
  );
  }
);

OctoPanel.displayName = "OctoPanel";
