import { cn } from "@genuin/ui/lib/utils";
import { IHeartCheckIcon, IHeartPlusIcon } from "@genuin/ui/icons";
import { type ComponentProps } from "react";

interface IHeartFollowButtonProps extends ComponentProps<"span"> {
  variant?: "outlined" | "filled";
  size?: "xs" | "sm" | "md";
  onClick?: (e: React.MouseEvent) => void;
}

export function IHeartFollowButton({
  variant = "outlined",
  size = "xs",
  className,
  onClick,
  ...props
}: IHeartFollowButtonProps) {
  const isOutlined = variant === "outlined";

  return (
    <span
      {...props}
      onClick={onClick}
      className={cn(
        "gencl:w-fit gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:h-5 gencl:px-1.5 gencl:gap-1",
        isOutlined
          ? "gencl:border gencl:border-white gencl:bg-transparent"
          : "gencl:bg-white",
        className
      )}
    >
      <IHeartPlusIcon theme={isOutlined ? "dark" : "light"} size={size} />
      {/* <IHeartCheckIcon
        theme={isOutlined ? "dark" : "light"}
        size={config.icon}
      /> */}
      <span
        className={cn(
          "gencl:text-[10px]! gencl:leading-[100%]! gencl:font-semibold gencl:tracking-[-0.35px]!",
          isOutlined ? "gencl:text-white" : "gencl:text-black"
        )}
      >
        Following
      </span>
    </span>
  );
}
