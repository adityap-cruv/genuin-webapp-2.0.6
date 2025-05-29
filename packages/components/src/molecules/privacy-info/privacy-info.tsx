import { LockIcon, PublicIcon } from "@genuin/ui/icons";
import type { ComponentProps } from "react";

type PrivacyInfoProps = ComponentProps<"div"> & {
  isPrivate: boolean;
  label?: string; // Optional label if needed later
};

export function PrivacyInfo({
  isPrivate,
  className = "",
  ...rest
}: PrivacyInfoProps) {
  return (
    <div
      className={`gencl:flex gencl:items-center gencl:gap-1 ${className}`}
      {...rest}
    >
      {isPrivate ? (
        <LockIcon className="gencl:size-4 gencl:fill-secondary-300" />
      ) : (
        <PublicIcon className="gencl:size-4 gencl:stroke-secondary-300" />
      )}
      <p className="gencl:text-secondary-300">
        {isPrivate ? "Private" : "Public"}
      </p>
    </div>
  );
}
