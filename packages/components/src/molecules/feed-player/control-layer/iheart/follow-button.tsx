import { cn } from "@genuin/ui/lib/utils";
import { IHeartCheckIcon, IHeartPlusIcon } from "@genuin/ui/icons/iheart-icons";
import { type ComponentProps } from "react";

interface IHeartFollowButtonProps extends ComponentProps<"div"> {
  variant?: "outlined" | "filled";
  size?: "xs" | "sm" | "md";
  onClick?: (e: React.MouseEvent) => void;
}

const sizeConfig = {
  xs: {
    container: "gencl:h-5 gencl:px-1.5 gencl:gap-1",
    text: "gencl:text-[10px]! gencl:leading-[100%]! gencl:font-semibold gencl:tracking-[-0.35px]!",
    icon: "xs" as const,
  },
  sm: {
    container: "gencl:h-7 gencl:px-2 gencl:gap-1",
    text: "gencl:text-body-2-semi-bold!",
    icon: "sm" as const,
  },
  md: {
    container: "gencl:h-9 gencl:px-3 gencl:gap-1.5",
    text: "gencl:text-body-1-semi-bold!",
    icon: "md" as const,
  },
};

export function IHeartFollowButton({
  variant = "outlined",
  size = "xs",
  className,
  onClick,
  ...props
}: IHeartFollowButtonProps) {
  const isOutlined = variant === "outlined";
  const config = sizeConfig[size];

  return (
    <div
      {...props}
      onClick={onClick}
      className={cn(
        "gencl:w-fit gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer",
        config.container,
        isOutlined
          ? "gencl:border gencl:border-white gencl:bg-transparent"
          : "gencl:bg-white",
        className
      )}
    >
      <IHeartPlusIcon
        theme={isOutlined ? "dark" : "light"}
        size={config.icon}
      />
      {/* <IHeartCheckIcon
        theme={isOutlined ? "dark" : "light"}
        size={config.icon}
      /> */}
      <p
        className={cn(
          config.text,
          isOutlined ? "gencl:text-white" : "gencl:text-black"
        )}
      >
        Following
      </p>
    </div>
  );
}
