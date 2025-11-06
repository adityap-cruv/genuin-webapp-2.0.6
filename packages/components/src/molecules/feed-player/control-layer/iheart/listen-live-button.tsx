import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { type ComponentProps } from "react";
import { Button } from "@genuin/ui";

interface IHeartListenLiveButtonProps extends ComponentProps<"div"> {
  variant?: "outlined" | "filled";
}

export function IHeartListenLiveButton({
  variant = "outlined",
  className,
  ...props
}: IHeartListenLiveButtonProps) {
  const isOutlined = variant === "outlined";

  const ctaText = "Listen Live";

  return (
    <Button
      theme="custom"
      className="gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
      title={ctaText}
    >
      <div
        {...props}
        className={cn(
          "gencl:h-9 gencl:px-4 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1",
          isOutlined
            ? "gencl:border gencl:border-white gencl:bg-transparent"
            : "gencl:bg-white",
          className
        )}
      >
        {/* <IHeartPlayIcon theme={isOutlined ? "dark" : "light"} size="md" /> */}
        {/* <IHeartPauseIcon theme={isOutlined ? "dark" : "light"} size="md" /> */}
        <IHeartStopIcon theme={isOutlined ? "dark" : "light"} size="md" />
        <p
          className={cn(
            "gencl:text-body-1-semi-bold!",
            isOutlined ? "gencl:text-white" : "gencl:text-black"
          )}
        >
          {ctaText}
        </p>
      </div>
    </Button>
  );
}
