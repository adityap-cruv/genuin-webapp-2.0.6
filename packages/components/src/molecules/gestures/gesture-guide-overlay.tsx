import { type ComponentProps, type ReactNode } from "react";
import { type GestureOverlayKeysType } from "./context";
import { cn, getGifLink, getIconLink } from "@genuin/ui/lib/utils";
// import { Image } from "@genuin/ui/components/image";

type GestureConfig = {
  mobileImage: string;
  desktopImage: string;
  getText: (tapBehavior?: any) => ReactNode;
};

const GESTURE_CONFIG: Record<GestureOverlayKeysType, GestureConfig> = {
  SWIPE: {
    mobileImage: getIconLink("swipeGesture", "png"),
    desktopImage: getGifLink("chevronUp"),
    getText: () => (
      <>
        Swipe up
        <br /> to view videos
      </>
    ),
  },
  PLAY_PAUSE: {
    mobileImage: getIconLink("tapGesture", "png"),
    desktopImage: getIconLink("clickGesture", "png"),
    getText: (tapBehavior: number) => {
      switch (tapBehavior) {
        case 1:
          return <>Tap to Mute/Unmute</>;
        case 2:
          return <>Tap to Play/Pause</>;
        case 3:
          return (
            <>
              Tap to play or pause <br /> while the video is
              <br /> unmuted
            </>
          );
        default:
          return (
            <>
              Tap to play or pause <br /> while the video is
              <br /> unmuted
            </>
          );
      }
    },
  },
};

type LazyGestureGuideOverlayProps = {
  gestureStep: GestureOverlayKeysType;
  tapBehavior?: number;
} & ComponentProps<"div">;

export function LazyGestureGuideOverlay({
  gestureStep,
  tapBehavior,
  className,
  ...props
}: LazyGestureGuideOverlayProps) {
  const gestureData = GESTURE_CONFIG[gestureStep];
  if (!gestureData) return null;

  const gestureText = gestureData.getText(tapBehavior);

  return (
    <div
      className={cn(
        "gencl:pointer-events-none gencl:z-[1000] gencl:h-full gencl:w-full gencl:bg-black/40 gencl:backdrop-blur-sm sm:gencl:absolute"
      )}
      {...props}
    >
      <div
        className={cn(
          "gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-2",
          gestureStep === "SWIPE" && "sm:gencl:justify-end sm:gencl:pb-20",
          className
        )}
      >
        <img
          src={gestureData.desktopImage}
          alt="gesture"
          // height={80}
          // width={80}
          className="sm:gencl:hidden gencl:h-20 gencl:shrink-0"
        />
        <img
          src={gestureData.mobileImage}
          alt="gesture"
          // height={80}
          // width={80}
          className="gencl:hidden sm:gencl:block gencl:shrink-0 gencl:h-20"
        />
        <p className="gencl:text-center gencl:text-body-1-bold gencl:text-white">
          {gestureText}
        </p>
      </div>
    </div>
  );
}
