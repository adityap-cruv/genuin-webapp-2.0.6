import { cn } from "@genuin/ui/lib/utils";
import { IHeartCheckIcon, IHeartPlusIcon } from "@genuin/ui/icons";
import { type ComponentProps } from "react";

interface IHeartFollowButtonProps extends ComponentProps<"button"> {
  variant?: "outlined" | "filled";
  size?: "xs" | "sm" | "md";
  isFollowing?: boolean;
}

export function IHeartFollowButton({
  variant = "outlined",
  size = "xs",
  className,
  isFollowing = false,
  onClick,
  ...props
}: IHeartFollowButtonProps) {
  const isOutlined = variant === "outlined";

  return (
    <button
      type="button"
      {...props}
      onClick={onClick}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
      aria-pressed={isFollowing}
      className={cn(
        "gencl:w-fit gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:h-5 gencl:px-1.5 gencl:gap-1",
        isOutlined
          ? "gencl:border gencl:border-white gencl:bg-transparent"
          : "gencl:bg-white",
        className
      )}
    >
      <IHeartPlusIcon theme={isOutlined ? "dark" : "light"} size={size} aria-hidden="true" />
      <span
        className={cn(
          "gencl:text-[10px]! gencl:leading-[100%]! gencl:font-semibold gencl:tracking-[-0.35px]!",
          isOutlined ? "gencl:text-white" : "gencl:text-black"
        )}
      >
        Following
      </span>
    </button>
  );
}
