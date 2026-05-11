import { ChevronLeft } from "lucide-react";

import { cn } from "@lib/utils";

type ModalShellProps = { onBack?: () => void } & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export function ModalShell({ onBack, children, className, ...props }: ModalShellProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-y-4 px-2 sm:max-w-md sm:min-w-[384px] sm:px-4",
        className
      )}
      {...props}>
      {onBack && <ChevronLeft className="stroke-secondary absolute inset-5 h-6 w-6" onClick={onBack} />}
      {children}
    </div>
  );
}
